import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { submitSpeechFromRecording } from "./speechThunks";

export type SpeechStatus = "idle" | "recording" | "processing" | "result" | "error";

export interface SpeechState {
  status: SpeechStatus;
  file: File | null;
  audioUrl: string | null;
  language: string;
  transcript: string | null;
  error: string | null;
}

const initialState: SpeechState = {
  status: "idle",
  file: null,
  audioUrl: null,
  language: "fa",
  transcript: null,
  error: null,
};

const speechSlice = createSlice({
  name: "speech",
  initialState,
  reducers: {
    setFile: (state, action: PayloadAction<File | null>) => {
      state.file = action.payload;
      state.transcript = null;
      state.error = null;
      state.status = "idle";
    },

    setAudioUrl: (state, action: PayloadAction<string | null>) => {
      state.audioUrl = action.payload;
    },

    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },

    setRecording: (state, action: PayloadAction<boolean>) => {
      state.status = action.payload ? "recording" : "idle";
      if (action.payload) {
        state.error = null;
      }
    },

    setProcessingError: (state, action: PayloadAction<string>) => {
      state.status = "error";
      state.error = action.payload;
    },

    clear: (state) => {
      state.status = "idle";
      state.file = null;
      state.audioUrl = null;
      state.language = "fa";
      state.transcript = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitSpeechFromRecording.pending, (state) => {
        state.status = "processing";
        state.error = null;
        state.transcript = null;
      })
      .addCase(submitSpeechFromRecording.fulfilled, (state, action) => {
        state.status = "result";
        state.transcript = action.payload;
        state.error = null;
      })
      .addCase(submitSpeechFromRecording.rejected, (state, action) => {
        state.status = "error";
        state.error =
          action.payload ?? action.error.message ?? "خطا در تبدیل گفتار به متن";
      });
  },
});

export const {
  setFile,
  setAudioUrl,
  setLanguage,
  setRecording,
  setProcessingError,
  clear,
} = speechSlice.actions;

export const speechActions = speechSlice.actions;

export default speechSlice.reducer;
