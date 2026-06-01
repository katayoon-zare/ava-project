

export type Mode = "idle" | "recording" | "processing" | "result" | "error";

export interface SpeechState {
  mode: Mode;


  error: string | null;


  hasMicPermission: boolean;
  isRecording: boolean;

 
  audioBlob: Blob | null;
  audioUrl: string | null;
  durationSec: number;

 
  requestId: string | null;
  transcript: string | null;
}

export type SpeechAction =
  | { type: "RESET" }
  | { type: "SET_MODE"; payload: Mode }
  | { type: "PERMISSION_GRANTED" }
  | { type: "PERMISSION_DENIED"; payload: string }
  | { type: "RECORDING_STARTED" }
  | {
      type: "RECORDING_STOPPED";
      payload: { audioBlob: Blob; audioUrl: string; durationSec: number };
    }
  | { type: "PROCESSING_STARTED" }
  | {
      type: "PROCESSING_SUCCESS";
      payload: { requestId?: string | null; transcript?: string | null };
    }
  | { type: "PROCESSING_ERROR"; payload: string };
