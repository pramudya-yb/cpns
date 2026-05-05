import { OpenAICompatibleClient } from "./client";
import { GenerationError } from "./errors";
import {
  getQuestionJsonSchemaDescription,
  getPassageJsonSchemaDescription,
  getValidationJsonSchemaDescription,
  getQuestionsArrayJsonSchemaDescription,
  getSelfValidationJsonSchemaDescription,
} from "./schema-to-prompt";
import { questionSchema, type GenerationInput, type GenerationResult } from "./schemas";

interface AgenticStep {
  step: string;
  status: "running" | "done" | "error" | "pending";
  message?: string;
  output?: string;
}

export interface AgenticProgress {
  steps: AgenticStep[];
  currentStep: number;
}

function getSystemPrompt(): string {
  return "You are a precise exam question generator. You always return valid JSON. You never include markdown formatting around the JSON.";
}

function getTargetLanguage(examType: string): string {
  if (examType === "JLPT") return "Japanese";
  if (examType === "HSK") return "Chinese";
  if (examType === "GOETHE") return "German";
  return "English";
}

function parseJsonResponse(content: string): unknown {
  if (!content) throw new Error("Empty response from AI");
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    const cleaned = content
      .replace(/^```json\s*/, "")
      .replace(/```\s*$/, "")
      .trim();
    parsed = JSON.parse(cleaned);
  }
  return parsed;
}

async function step1GeneratePassage(
  client: OpenAICompatibleClient,
  input: GenerationInput,
  onToken?: (token: string) => void,
): Promise<{ passage: string; title: string; tokensUsed: number }> {
  const schema = getPassageJsonSchemaDescription();
  const prompt = `Generate an authentic, high-quality reading passage for ${input.examType} ${input.section.toLowerCase()} section at difficulty level ${input.difficulty}/5.

Requirements:
- Language: ${getTargetLanguage(input.examType)}
- Topics: ${input.topics.join(", ")}
- Difficulty: ${input.difficulty}/5
- The passage should be natural, well-structured, and appropriate for the exam level
- Length should be suitable for ${input.questionCount} comprehension questions

Return ONLY valid JSON conforming to this schema:
${schema}`;

  const result = await client.chatCompletion(
    {
      model: input.apiKeyConfig.model,
      messages: [
        { role: "system", content: getSystemPrompt() },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: input.apiKeyConfig.maxTokens,
      response_format: { type: "json_object" },
    },
    onToken ? { onToken } : undefined,
  );

  const parsed = parseJsonResponse(result.content) as Record<string, unknown>;
  if (!parsed.passage || typeof parsed.passage !== "string") {
    throw new Error("Invalid passage generation response");
  }
  return {
    passage: parsed.passage,
    title: typeof parsed.title === "string" ? parsed.title : "Untitled Passage",
    tokensUsed: result.usage?.total_tokens ?? 0,
  };
}

async function step2ValidatePassage(
  client: OpenAICompatibleClient,
  input: GenerationInput,
  passage: string,
  onToken?: (token: string) => void,
): Promise<{ isValid: boolean; feedback: string; tokensUsed: number }> {
  const schema = getValidationJsonSchemaDescription();
  const prompt = `Validate this reading passage for a ${input.examType} exam at difficulty ${input.difficulty}/5.

Passage:
"""
${passage}
"""

Check:
1. Grammar and spelling correctness
2. Difficulty appropriateness (${input.difficulty}/5)
3. Length sufficiency for ${input.questionCount} questions
4. Topic relevance: ${input.topics.join(", ")}
5. Natural flow and coherence

Return ONLY valid JSON conforming to this schema:
${schema}`;

  const result = await client.chatCompletion(
    {
      model: input.apiKeyConfig.model,
      messages: [
        { role: "system", content: getSystemPrompt() },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: input.apiKeyConfig.maxTokens,
      response_format: { type: "json_object" },
    },
    onToken ? { onToken } : undefined,
  );

  const parsed = parseJsonResponse(result.content) as Record<string, unknown>;
  return {
    isValid: !!parsed.isValid,
    feedback: typeof parsed.feedback === "string" ? parsed.feedback : "No feedback",
    tokensUsed: result.usage?.total_tokens ?? 0,
  };
}

async function step3GenerateQuestions(
  client: OpenAICompatibleClient,
  input: GenerationInput,
  passage: string,
  onToken?: (token: string) => void,
): Promise<{ questions: Array<Record<string, unknown>>; tokensUsed: number }> {
  const questionSchemaDesc = getQuestionJsonSchemaDescription();
  const wrapperSchema = getQuestionsArrayJsonSchemaDescription();

  const prompt = `Using the following passage, generate ${input.questionCount} reading comprehension questions for ${input.examType} exam.

Passage:
"""
${passage}
"""

Formats to generate: ${input.formats.join(", ")}

Rules:
- Each question must be directly answerable from the passage
- Use "passageText" field with the relevant excerpt from the passage (or full passage if needed)
- Questions should test real comprehension, not surface recall
- For multiple choice: always provide 4 options (A, B, C, D) with one clearly correct answer
- Options must be plausible distractors
- explanation (explanation) - dijelaskan dengan bahasa Indonesia

Question schema:
${questionSchemaDesc}

Return ONLY valid JSON conforming to this schema:
${wrapperSchema}`;

  const result = await client.chatCompletion(
    {
      model: input.apiKeyConfig.model,
      messages: [
        { role: "system", content: getSystemPrompt() },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: input.apiKeyConfig.maxTokens,
      response_format: { type: "json_object" },
    },
    onToken ? { onToken } : undefined,
  );

  const parsed = parseJsonResponse(result.content) as Record<string, unknown>;
  if (!Array.isArray(parsed.questions)) {
    throw new Error("Missing questions array in AI response");
  }
  return {
    questions: parsed.questions as Array<Record<string, unknown>>,
    tokensUsed: result.usage?.total_tokens ?? 0,
  };
}

async function step4SelfValidate(
  client: OpenAICompatibleClient,
  input: GenerationInput,
  passage: string,
  questions: Array<Record<string, unknown>>,
  onToken?: (token: string) => void,
): Promise<{ correctedQuestions: Array<Record<string, unknown>>; confidence: number; tokensUsed: number }> {
  const qaPairs = questions
    .map((q, i) => `Q${i + 1}: ${q.questionText}\nA: ${q.correctAnswer}`)
    .join("\n\n");

  const schema = getSelfValidationJsonSchemaDescription();
  const prompt = `You are a strict exam validator. Review these questions against the passage and identify any errors.

Passage:
"""
${passage}
"""

Questions & Claimed Answers:
${qaPairs}

For each question, verify:
1. Is the claimed answer truly correct based on the passage?
2. Are there any ambiguous questions?
3. Are distractors plausible but clearly wrong?

Return ONLY valid JSON conforming to this schema:
${schema}`;

  const result = await client.chatCompletion(
    {
      model: input.apiKeyConfig.model,
      messages: [
        { role: "system", content: getSystemPrompt() },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: input.apiKeyConfig.maxTokens,
      response_format: { type: "json_object" },
    },
    onToken ? { onToken } : undefined,
  );

  const parsed = parseJsonResponse(result.content) as Record<string, unknown>;
  const confidence = typeof parsed.overallConfidence === "number" ? parsed.overallConfidence : 75;
  const issues = Array.isArray(parsed.issues) ? parsed.issues : [];

  // Apply fixes if needed
  const corrected = questions.map((q, i) => {
    const issue = issues.find((iss: any) => iss?.questionIndex === i);
    if (issue && issue.suggestedFix) {
      return { ...q, explanation: `${q.explanation}\n[Validator note: ${issue.suggestedFix}]` };
    }
    return q;
  });

  return { correctedQuestions: corrected, confidence, tokensUsed: result.usage?.total_tokens ?? 0 };
}

async function step4RegenerateBadQuestions(
  client: OpenAICompatibleClient,
  input: GenerationInput,
  passage: string,
  questions: Array<Record<string, unknown>>,
  issueIndices: number[],
  onToken?: (token: string) => void,
): Promise<{ regenerated: Array<Record<string, unknown>>; tokensUsed: number }> {
  const badQuestions = issueIndices.map((i) => ({
    index: i,
    ...questions[i],
  }));

  const questionSchemaDesc = getQuestionJsonSchemaDescription();
  const wrapperSchema = getQuestionsArrayJsonSchemaDescription();

  const prompt = `You are an expert exam question writer. The following questions were flagged as incorrect or flawed. Regenerate them to fix the issues while keeping the same format and difficulty.

Passage:
"""
${passage}
"""

Flawed questions (with their original index):
${JSON.stringify(badQuestions, null, 2)}

Rules:
- Regenerate ONLY the flawed questions
- Maintain the same format, difficulty (${input.difficulty}), and exam style (${input.examType})
- Each question must be directly answerable from the passage
- explanation (explanation) - dijelaskan dengan bahasa Indonesia
- Return the same number of questions in the same order as the input

Question schema:
${questionSchemaDesc}

Return ONLY valid JSON conforming to this schema:
${wrapperSchema}`;

  const result = await client.chatCompletion(
    {
      model: input.apiKeyConfig.model,
      messages: [
        { role: "system", content: getSystemPrompt() },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: input.apiKeyConfig.maxTokens,
      response_format: { type: "json_object" },
    },
    onToken ? { onToken } : undefined,
  );

  const parsed = parseJsonResponse(result.content) as Record<string, unknown>;
  if (!Array.isArray(parsed.questions) || parsed.questions.length !== badQuestions.length) {
    throw new Error("Regeneration did not return the expected number of questions");
  }

  return {
    regenerated: parsed.questions as Array<Record<string, unknown>>,
    tokensUsed: result.usage?.total_tokens ?? 0,
  };
}

export async function generateQuestionsAgentic(
  input: GenerationInput,
  onProgress?: (progress: AgenticProgress) => void,
  onToken?: (token: string) => void,
): Promise<GenerationResult> {
  const start = Date.now();
  const client = new OpenAICompatibleClient(
    input.apiKeyConfig.baseUrl,
    input.apiKeyConfig.apiKey,
  );

  const steps: [AgenticStep, AgenticStep, AgenticStep, AgenticStep] = [
    { step: "generate_passage", status: "running" },
    { step: "validate_passage", status: "pending" as any },
    { step: "generate_questions", status: "pending" as any },
    { step: "self_validate", status: "pending" as any },
  ];

  const report = (current: number) => {
    if (onProgress) {
      onProgress({ steps, currentStep: current });
    }
  };

  let accumulatedTokens = 0;

  // Step 1: Generate passage
  report(0);
  let passage: string;
  let title: string;
  try {
    const s1 = await step1GeneratePassage(client, input, onToken);
    passage = s1.passage;
    title = s1.title;
    accumulatedTokens += s1.tokensUsed;
    steps[0].status = "done";
    steps[0].message = `Generated: ${title}`;
    steps[0].output = passage;
  } catch (err: any) {
    steps[0].status = "error";
    steps[0].message = err.message ?? "Passage generation failed";
    throw new GenerationError(`Step 1 failed: ${err.message}`, { tokensUsed: accumulatedTokens });
  }

  // Step 2: Validate passage
  steps[1].status = "running";
  report(1);
  let isValid: boolean;
  let feedback: string;
  try {
    const s2 = await step2ValidatePassage(client, input, passage, onToken);
    isValid = s2.isValid;
    feedback = s2.feedback;
    accumulatedTokens += s2.tokensUsed;
    steps[1].status = isValid ? "done" : "error";
    steps[1].message = feedback;
    steps[1].output = JSON.stringify({ isValid, feedback }, null, 2);
  } catch (err: any) {
    steps[1].status = "error";
    steps[1].message = err.message ?? "Passage validation failed";
    throw new GenerationError(`Step 2 failed: ${err.message}`, { tokensUsed: accumulatedTokens });
  }

  // Even if not perfect, continue (the feedback is logged)

  // Step 3: Generate questions
  steps[2].status = "running";
  report(2);
  let rawQuestions: Array<Record<string, unknown>>;
  try {
    const s3 = await step3GenerateQuestions(client, input, passage, onToken);
    rawQuestions = s3.questions;
    accumulatedTokens += s3.tokensUsed;
    steps[2].status = "done";
    steps[2].message = `Generated ${rawQuestions.length} questions`;
    steps[2].output = rawQuestions.map((q, i) => `${i + 1}. [${q.format}] ${q.questionText}`).join("\n");
  } catch (err: any) {
    steps[2].status = "error";
    steps[2].message = err.message ?? "Question generation failed";
    throw new GenerationError(`Step 3 failed: ${err.message}`, { tokensUsed: accumulatedTokens });
  }

  // Step 4: Self-validate
  steps[3].status = "running";
  report(3);
  let correctedQuestions: Array<Record<string, unknown>>;
  let confidence: number;
  try {
    const s4 = await step4SelfValidate(client, input, passage, rawQuestions, onToken);
    correctedQuestions = s4.correctedQuestions;
    confidence = s4.confidence;
    accumulatedTokens += s4.tokensUsed;

    // If validation found issues and confidence is low, actually regenerate the bad questions
    const issueIndices = (s4.correctedQuestions as any[])
      .map((q, i) => (q.explanation?.includes("[Validator note:") ? i : -1))
      .filter((i) => i !== -1);

    if (issueIndices.length > 0 && confidence < 85) {
      steps[3].message = `Found ${issueIndices.length} issues. Regenerating...`;
      report(3);
      const regen = await step4RegenerateBadQuestions(
        client,
        input,
        passage,
        rawQuestions,
        issueIndices,
        onToken,
      );
      accumulatedTokens += regen.tokensUsed;

      // Replace the bad questions with regenerated ones
      for (let idx = 0; idx < issueIndices.length; idx++) {
        correctedQuestions[issueIndices[idx]] = regen.regenerated[idx];
      }
      confidence = Math.min(100, confidence + 10);
      steps[3].message = `Regenerated ${issueIndices.length} questions. Confidence: ${confidence}%`;
    } else {
      steps[3].message = `Confidence score: ${confidence}%`;
    }

    steps[3].status = "done";
    steps[3].output = `Overall Confidence: ${confidence}%\nTotal Questions: ${correctedQuestions.length}`;
  } catch (err: any) {
    steps[3].status = "error";
    steps[3].message = err.message ?? "Self-validation failed";
    throw new GenerationError(`Step 4 failed: ${err.message}`, { tokensUsed: accumulatedTokens });
  }

  // Parse and validate final questions
  const questions = correctedQuestions
    .map((q) => {
      try {
        return questionSchema.parse({ ...q, passageText: passage });
      } catch (e) {
        console.warn("Question validation failed:", e);
        return null;
      }
    })
    .filter((q): q is NonNullable<typeof q> => q !== null);

  if (questions.length === 0) {
    throw new GenerationError("No valid questions generated after agentic validation", {
      tokensUsed: accumulatedTokens,
    });
  }

  return {
    questions,
    meta: {
      model: input.apiKeyConfig.model,
      durationMs: Date.now() - start,
      mode: "agentic",
      tokensUsed: accumulatedTokens,
    },
  };
}
