import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { OpenAICompatibleClient } from "../client";

const BASE_URL = "https://api.openai.com/v1";
const API_KEY = "sk-test-key-12345";
const MODEL = "gpt-4";

type FetchFn = typeof globalThis.fetch;

/** Bun/TS types fetch as an object with static helpers (e.g. preconnect), not just a function. */
function asFetchMock(fn: (...args: Parameters<FetchFn>) => ReturnType<FetchFn>): FetchFn {
  return fn as FetchFn;
}

function setMockFetch(fn: (...args: Parameters<FetchFn>) => ReturnType<FetchFn>): void {
  globalThis.fetch = asFetchMock(fn);
}

function parseRequestBody(opts?: RequestInit): Record<string, unknown> {
  if (opts?.body == null) {
    throw new Error("Expected request body in mock fetch");
  }
  return JSON.parse(String(opts.body));
}

function makeMockStream(chunks: string[]): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

function makeFetchMock(streamChunks: string[], status = 200): FetchFn {
  return asFetchMock(async () =>
    new Response(makeMockStream(streamChunks), {
      status,
      headers: { "content-type": "text/event-stream" },
    }),
  );
}

describe("OpenAICompatibleClient", () => {
  let originalFetch: FetchFn;

  beforeAll(() => {
    originalFetch = globalThis.fetch;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  it("sends correct request and parses SSE response", async () => {
    globalThis.fetch = makeFetchMock([
      `data: ${JSON.stringify({ choices: [{ delta: { content: "Hello" } }] })}\n`,
      `data: ${JSON.stringify({ choices: [{ delta: { content: " World" } }] })}\n`,
      `data: ${JSON.stringify({ choices: [{ delta: {} }], usage: { total_tokens: 10 } })}\n`,
      "data: [DONE]\n",
    ]);

    const client = new OpenAICompatibleClient(BASE_URL, API_KEY);
    const result = await client.chatCompletion({
      model: MODEL,
      messages: [{ role: "user", content: "Test" }],
    });

    expect(result.content).toBe("Hello World");
  });

  it("calls onToken callback for each token", async () => {
    globalThis.fetch = makeFetchMock([
      `data: ${JSON.stringify({ choices: [{ delta: { content: "A" } }] })}\n`,
      `data: ${JSON.stringify({ choices: [{ delta: { content: "B" } }] })}\n`,
      "data: [DONE]\n",
    ]);

    const tokens: string[] = [];
    const client = new OpenAICompatibleClient(BASE_URL, API_KEY);
    await client.chatCompletion(
      { model: MODEL, messages: [{ role: "user", content: "Test" }] },
      { onToken: (t) => tokens.push(t) },
    );

    expect(tokens).toEqual(["A", "B"]);
  });

  it("returns usage from the last chunk", async () => {
    globalThis.fetch = makeFetchMock([
      `data: ${JSON.stringify({ choices: [{ delta: { content: "Hi" } }] })}\n`,
      `data: ${JSON.stringify({ choices: [{ delta: {} }], usage: { total_tokens: 5 } })}\n`,
      "data: [DONE]\n",
    ]);

    const client = new OpenAICompatibleClient(BASE_URL, API_KEY);
    const result = await client.chatCompletion({
      model: MODEL,
      messages: [{ role: "user", content: "Test" }],
    });

    expect(result.usage?.total_tokens).toBe(5);
  });

  it("throws on non-OK response", async () => {
    setMockFetch(async () =>
      new Response("Bad Request", { status: 400, headers: { "content-type": "text/plain" } }),
    );

    const client = new OpenAICompatibleClient(BASE_URL, API_KEY);
    expect(
      client.chatCompletion({
        model: MODEL,
        messages: [{ role: "user", content: "Test" }],
      }),
    ).rejects.toThrow("400");
  });

  it("throws on empty response body", async () => {
    setMockFetch(async () => new Response(null, { status: 200 }));

    const client = new OpenAICompatibleClient(BASE_URL, API_KEY);
    expect(
      client.chatCompletion({
        model: MODEL,
        messages: [{ role: "user", content: "Test" }],
      }),
    ).rejects.toThrow("Empty response body");
  });

  it("throws on invalid base URL", async () => {
    const client = new OpenAICompatibleClient("not-a-url", API_KEY);
    expect(
      client.chatCompletion({
        model: MODEL,
        messages: [{ role: "user", content: "Test" }],
      }),
    ).rejects.toThrow("Invalid base URL");
  });

  it("throws on metadata host (169.254.169.254)", async () => {
    const client = new OpenAICompatibleClient("https://169.254.169.254/v1", API_KEY);
    expect(
      client.chatCompletion({
        model: MODEL,
        messages: [{ role: "user", content: "Test" }],
      }),
    ).rejects.toThrow("metadata/private network");
  });

  it("retries without response_format on 400 with response_format error", async () => {
    let callCount = 0;
    setMockFetch(async (_input, opts) => {
      callCount++;
      if (callCount === 1) {
        const body = parseRequestBody(opts);
        expect(body.response_format).toBeDefined();
        return new Response("response_format is not supported", {
          status: 400,
          headers: { "content-type": "text/plain" },
        });
      }
      const body = parseRequestBody(opts);
      expect(body.response_format).toBeUndefined();
      return new Response(makeMockStream([
        `data: ${JSON.stringify({ choices: [{ delta: { content: "retried" } }] })}\n`,
        "data: [DONE]\n",
      ]), {
        status: 200,
        headers: { "content-type": "text/event-stream" },
      });
    });

    const client = new OpenAICompatibleClient(BASE_URL, API_KEY);
    const result = await client.chatCompletion({
      model: MODEL,
      messages: [{ role: "user", content: "Test" }],
      response_format: { type: "json_object" },
    });

    expect(callCount).toBe(2);
    expect(result.content).toBe("retried");
  });

  it("retries with more tokens on truncated response", async () => {
    let callCount = 0;
    setMockFetch(async (_input, _opts) => {
      callCount++;
      const responseContent = callCount === 1
        ? `data: ${JSON.stringify({ choices: [{ delta: { content: '{"incomplete":' } }] })}\n` + "data: [DONE]\n"
        : `data: ${JSON.stringify({ choices: [{ delta: { content: '{"complete": true}' } }] })}\n` + "data: [DONE]\n";

      return new Response(makeMockStream([responseContent]), {
        status: 200,
        headers: { "content-type": "text/event-stream" },
      });
    });

    const client = new OpenAICompatibleClient(BASE_URL, API_KEY);
    const result = await client.chatCompletion({
      model: MODEL,
      messages: [{ role: "user", content: "Test" }],
      max_tokens: 100,
    });

    expect(callCount).toBe(2);
    expect(result.content).toBe('{"complete": true}');
  });

  it("strips reasoning blocks and returns JSON from GLM-style streams", async () => {
    const json = '{"questions":[{"format":"mcq"}]}';
    globalThis.fetch = makeFetchMock([
      `data: ${JSON.stringify({ choices: [{ delta: { content: "<think>\nPlanning questions...\n</think>" } }] })}\n`,
      `data: ${JSON.stringify({ choices: [{ delta: { content: json } }] })}\n`,
      "data: [DONE]\n",
    ]);

    const client = new OpenAICompatibleClient(BASE_URL, API_KEY);
    const result = await client.chatCompletion({
      model: MODEL,
      messages: [{ role: "user", content: "Test" }],
    });

    expect(result.content).toBe(json);
  });

  it("ignores reasoning_content delta and keeps final content", async () => {
    globalThis.fetch = makeFetchMock([
      `data: ${JSON.stringify({ choices: [{ delta: { reasoning_content: "internal reasoning only" } }] })}\n`,
      `data: ${JSON.stringify({ choices: [{ delta: { content: '{"ok":true}' } }] })}\n`,
      "data: [DONE]\n",
    ]);

    const client = new OpenAICompatibleClient(BASE_URL, API_KEY);
    const result = await client.chatCompletion({
      model: MODEL,
      messages: [{ role: "user", content: "Test" }],
    });

    expect(result.content).toBe('{"ok":true}');
  });

  it("throws on HTML error page in stream", async () => {
    setMockFetch(async () =>
      new Response(makeMockStream([
        `data: ${JSON.stringify({ choices: [{ delta: { content: "<!DOCTYPE html><html><body>502 Bad Gateway</body></html>" } }] })}\n`,
        "data: [DONE]\n",
      ]), {
        status: 200,
        headers: { "content-type": "text/event-stream" },
      }),
    );

    const client = new OpenAICompatibleClient(BASE_URL, API_KEY);
    expect(
      client.chatCompletion({
        model: MODEL,
        messages: [{ role: "user", content: "Test" }],
      }),
    ).rejects.toThrow("HTML");
  });

  it("falls back to non-stream JSON body when SSE yields no tokens", async () => {
    const body = JSON.stringify({
      choices: [{ message: { content: '{"questions":[]}' } }],
    });
    setMockFetch(async () =>
      new Response(body, {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const client = new OpenAICompatibleClient(BASE_URL, API_KEY);
    const result = await client.chatCompletion({
      model: MODEL,
      messages: [{ role: "user", content: "Test" }],
    });

    expect(result.content).toBe('{"questions":[]}');
  });
});
