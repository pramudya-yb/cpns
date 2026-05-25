export const AnalyticsEvent = {
  ATTEMPT_START: "attempt_start",
  ATTEMPT_FINISH: "attempt_finish",
  ATTEMPT_ABANDON: "attempt_abandon",
  AI_GENERATE_QUICK: "ai_generate_quick",
  AI_GENERATE_AGENTIC: "ai_generate_agentic",
  SIGN_IN: "sign_in",
  SIGN_UP: "sign_up",
  API_KEY_ADDED: "api_key_added",
  API_KEY_REMOVED: "api_key_removed",
  VIEW_ANALYTICS: "view_analytics",
  VIEW_HISTORY: "view_history",
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

export interface AttemptStartPayload {
  exam_type: string;
  question_count: number;
}

export interface AttemptFinishPayload {
  exam_type: string;
  score: number;
  max_score: number;
  percentage: number;
  time_elapsed_sec: number;
}

export interface AttemptAbandonPayload {
  exam_type: string;
  questions_answered: number;
  total_questions: number;
}

export interface AiGeneratePayload {
  exam_type: string;
  mode: string;
  sections: string[];
  formats: string[];
  question_count: number;
  topics: string[];
  difficulty: number;
  use_free_credits: boolean;
}

export interface ApiKeyPayload {
  provider: string;
}

type EventPayloadMap = {
  [AnalyticsEvent.ATTEMPT_START]: AttemptStartPayload;
  [AnalyticsEvent.ATTEMPT_FINISH]: AttemptFinishPayload;
  [AnalyticsEvent.ATTEMPT_ABANDON]: AttemptAbandonPayload;
  [AnalyticsEvent.AI_GENERATE_QUICK]: AiGeneratePayload;
  [AnalyticsEvent.AI_GENERATE_AGENTIC]: AiGeneratePayload;
  [AnalyticsEvent.API_KEY_ADDED]: ApiKeyPayload;
  [AnalyticsEvent.API_KEY_REMOVED]: ApiKeyPayload;
  [AnalyticsEvent.SIGN_IN]: Record<string, never>;
  [AnalyticsEvent.SIGN_UP]: Record<string, never>;
  [AnalyticsEvent.VIEW_ANALYTICS]: Record<string, never>;
  [AnalyticsEvent.VIEW_HISTORY]: Record<string, never>;
};

export function trackUmamiEvent<T extends AnalyticsEventName>(
  eventName: T,
  payload?: T extends keyof EventPayloadMap ? EventPayloadMap[T] : never,
): void {
  if (import.meta.env.DEV) return;
  if (typeof window === "undefined" || !window.umami) return;
  window.umami.track(eventName, payload as Record<string, unknown>);
}
