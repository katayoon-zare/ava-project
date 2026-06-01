// src/features/speech/speechThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { transcribeFromUrl } from "../../api/transcribe";

type SubmitSpeechFromRecordingArg = {
  mediaUrl: string;
};

type RejectValue = string;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "خطای ناشناخته";
}

export const submitSpeechFromRecording = createAsyncThunk<
  string, // fulfilled payload = transcript text
  SubmitSpeechFromRecordingArg,
  { rejectValue: RejectValue }
>("speech/submitSpeechFromRecording", async ({ mediaUrl }, thunkApi) => {
  try {
    if (!mediaUrl) {
      return thunkApi.rejectWithValue("آدرس فایل (mediaUrl) خالی است.");
    }

    if (mediaUrl.startsWith("blob:")) {
      return thunkApi.rejectWithValue(
        "آدرس blob محلی است و API فقط URL عمومی را می‌پذیرد."
      );
    }

    // transcribeFromUrl MUST return string (final transcript)
    const text = await transcribeFromUrl(mediaUrl);

    if (!text.trim()) {
      return thunkApi.rejectWithValue("متنی از API دریافت نشد.");
    }

    return text;
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(getErrorMessage(error));
  }
});
