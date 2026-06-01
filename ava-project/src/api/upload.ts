import { createAsyncThunk } from "@reduxjs/toolkit";
import { transcribeFromUrl } from "./transcribe";

type SubmitSpeechPayload = {
  mediaUrl: string;
};

export const submitSpeechFromRecording = createAsyncThunk<
  string, // Return type (transcript)
  SubmitSpeechPayload, // Payload type
  { rejectValue: string } // Error type
>("speech/submitSpeechFromRecording", async ({ mediaUrl }, thunkApi) => {
  try {
    if (!mediaUrl) {
      return thunkApi.rejectWithValue("آدرس فایل صوتی معتبر نیست.");
    }

    // جلوگیری از ارسال Blob URL محلی به API عمومی
    if (mediaUrl.startsWith("blob:")) {
      return thunkApi.rejectWithValue(
        "این سرویس فقط لینک‌های عمومی را می‌پذیرد. ابتدا فایل را آپلود کنید."
      );
    }

    const transcript = await transcribeFromUrl(mediaUrl);
    return transcript;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return thunkApi.rejectWithValue(error.message);
    }
    return thunkApi.rejectWithValue("خطا در تبدیل گفتار به متن");
  }
});
