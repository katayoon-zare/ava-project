// features/speech/speechMachine.ts

export type SpeechStatus = "idle" | "recording" | "processing" | "result" | "error";

export type SpeechErrorCode =
  | "RECORDER_PERMISSION_DENIED"
  | "RECORDER_NOT_SUPPORTED"
  | "RECORDER_FAILED"
  | "INVALID_MEDIA_URL"
  | "TRANSCRIBE_FAILED"
  | "UNKNOWN";

export interface SpeechError {
  code: SpeechErrorCode;
  message: string;
}

export interface SpeechState {
  status: SpeechStatus;

  /**
   * When recording stops, we may have either:
   * - audioBlob + blob: URL (local preview)
   * - OR a public URL (rare, depends on your flow)
   */
  audioBlob: Blob | null;
  audioUrl: string | null;

  /** Result text */
  transcript: string;

  /** If status === "error" this should be non-null */
  error: SpeechError | null;

  /**
   * Optional metadata (keep if useful; otherwise you can remove)
   */
  durationSec: number;
}

export const initialSpeechState: SpeechState = {
  status: "idle",
  audioBlob: null,
  audioUrl: null,
  transcript: "",
  error: null,
  durationSec: 0,
};

export type SpeechEvent =
  | { type: "RESET" }
  | { type: "START_RECORDING" }
  | { type: "START_RECORDING_FAILED"; error: SpeechError }
  | { type: "STOP_RECORDING" } // user intent (optional)
  | {
      type: "RECORDING_READY";
      audioBlob: Blob;
      audioUrl: string; // likely blob:
      durationSec?: number;
    }
  | { type: "SUBMIT_REQUEST" }
  | { type: "SUBMIT_BLOCKED_INVALID_URL"; error?: SpeechError }
  | { type: "SUBMIT_SUCCESS"; transcript: string }
  | { type: "SUBMIT_FAILED"; error: SpeechError }
  | { type: "SET_PUBLIC_AUDIO_URL"; audioUrl: string }
  | { type: "CLEAR_ERROR" };

export function isBlobUrl(url: string | null | undefined): boolean {
  return typeof url === "string" && url.startsWith("blob:");
}

export function normalizeTranscript(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Pure transition function (no side-effects).
 * - Keeps UI simple.
 * - Keeps reducers/thunks consistent.
 */
export function speechTransition(state: SpeechState, event: SpeechEvent): SpeechState {
  switch (event.type) {
    case "RESET": {
      return { ...initialSpeechState };
    }

    case "CLEAR_ERROR": {
      // Don’t force status change here; let caller decide or keep it stable.
      // If you want: when clearing error, go idle.
      if (!state.error) return state;
      return { ...state, error: null, status: state.status === "error" ? "idle" : state.status };
    }

    case "START_RECORDING": {
      // Starting a new recording usually implies clearing old result/errors
      return {
        ...state,
        status: "recording",
        error: null,
        transcript: "",
        audioBlob: null,
        audioUrl: null,
        durationSec: 0,
      };
    }

    case "START_RECORDING_FAILED": {
      return {
        ...state,
        status: "error",
        error: event.error,
      };
    }

    case "STOP_RECORDING": {
      // This is just an intent event.
      // Actual audio availability should come via RECORDING_READY.
      // Keep status as recording until we get RECORDING_READY (or set idle—depends on your UX).
      if (state.status !== "recording") return state;
      return state;
    }

    case "RECORDING_READY": {
      // After stop + data available: we typically go idle (await submit) or processing (auto-submit).
      // Here we set idle. Thunk/controller can dispatch SUBMIT_REQUEST afterwards.
      return {
        ...state,
        status: "idle",
        error: null,
        audioBlob: event.audioBlob,
        audioUrl: event.audioUrl,
        durationSec: event.durationSec ?? state.durationSec,
        // transcript remains cleared already on START_RECORDING; keep as-is.
      };
    }

    case "SET_PUBLIC_AUDIO_URL": {
      // When you upload the blob somewhere and receive a public URL,
      // replace audioUrl so API can accept it.
      return {
        ...state,
        audioUrl: event.audioUrl,
      };
    }

    case "SUBMIT_REQUEST": {
      // Guardrails: must have an audioUrl and must not be blob:
      if (!state.audioUrl) {
        return {
          ...state,
          status: "error",
          error: {
            code: "INVALID_MEDIA_URL",
            message: "آدرس فایل صوتی موجود نیست.",
          },
        };
      }

      if (isBlobUrl(state.audioUrl)) {
        return {
          ...state,
          status: "error",
          error: {
            code: "INVALID_MEDIA_URL",
            message:
              "آدرس صوتی از نوع blob است و قابل ارسال به سرور نیست. ابتدا باید فایل روی یک URL عمومی آپلود شود.",
          },
        };
      }

      return {
        ...state,
        status: "processing",
        error: null,
        // Keep audioUrl/audioBlob for UI preview
      };
    }

    case "SUBMIT_BLOCKED_INVALID_URL": {
      return {
        ...state,
        status: "error",
        error:
          event.error ??
          ({
            code: "INVALID_MEDIA_URL",
            message:
              "ارسال به سرویس تبدیل گفتار به متن ممکن نیست چون آدرس فایل معتبر نیست.",
          } satisfies SpeechError),
      };
    }

    case "SUBMIT_SUCCESS": {
      const transcript = normalizeTranscript(event.transcript);

      return {
        ...state,
        status: transcript ? "result" : "error",
        transcript,
        error: transcript
          ? null
          : {
              code: "TRANSCRIBE_FAILED",
              message: "متنی از سرویس دریافت نشد یا متن خالی بود.",
            },
      };
    }

    case "SUBMIT_FAILED": {
      return {
        ...state,
        status: "error",
        error: event.error,
      };
    }

    default: {
      return state;
    }
  }
}

/**
 * Small helpers to keep UI logic dumb.
 */
export function selectSpeechMode(state: SpeechState): SpeechStatus {
  return state.status;
}

export function canStartRecording(state: SpeechState): boolean {
  return state.status !== "processing" && state.status !== "recording";
}

export function canStopRecording(state: SpeechState): boolean {
  return state.status === "recording";
}

export function canSubmit(state: SpeechState): boolean {
  return !!state.audioUrl && !isBlobUrl(state.audioUrl) && state.status !== "processing";
}

/**
 * Error factory helpers (optional but convenient)
 */
export function makeError(code: SpeechErrorCode, message: string): SpeechError {
  return { code, message };
}
