export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  model: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" };
}

export interface ChatCompletionResponse {
  id: string;
  choices: {
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAICompatibleClient {
  constructor(
    private baseUrl: string,
    private apiKey: string,
  ) {}

  async chatCompletion(opts: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const url = `${this.baseUrl.replace(/\/$/, "")}/chat/completions`;
    const body = {
      model: opts.model,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.max_tokens ?? 4096,
      ...(opts.response_format ? { response_format: opts.response_format } : {}),
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI-compatible API error ${res.status}: ${text}`);
    }

    return res.json() as Promise<ChatCompletionResponse>;
  }
}
