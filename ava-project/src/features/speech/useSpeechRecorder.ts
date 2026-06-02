import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import {
  setAudioUrl,
  setFile,
  setProcessingError,
  setRecording,
} from "./speechSlice";

export type RecorderStatus = "idle" | "recording";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "خطای ناشناخته";
}

export function useSpeechRecorder() {
  const dispatch = useAppDispatch();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const objectUrlRef = useRef<string | null>(null);

  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState(0);

  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const cleanupObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(async () => {
    try {
      cleanupObjectUrl();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "speech-recording.webm", {
          type: "audio/webm",
        });

        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;

        setAudioBlob(blob);
        setLocalAudioUrl(url);

       
        dispatch(setFile(file));
        dispatch(setAudioUrl(url));
        dispatch(setRecording(false));

        cleanupStream();
      };

      mediaRecorder.start();

      startedAtRef.current = Date.now();
      setDurationSec(0);

      stopTimer();
      timerRef.current = window.setInterval(() => {
        if (startedAtRef.current) {
          setDurationSec(
            Math.floor((Date.now() - startedAtRef.current) / 1000)
          );
        }
      }, 250);

      setStatus("recording");
      dispatch(setRecording(true));
    } catch (error: unknown) {
      dispatch(
        setProcessingError(
          getErrorMessage(error) || "دسترسی به میکروفون ممکن نشد."
        )
      );
      setStatus("idle");
      cleanupStream();
      stopTimer();
    }
  }, [cleanupObjectUrl, cleanupStream, dispatch, stopTimer]);

  const stop = useCallback(() => {
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }

    setStatus("idle");
    stopTimer();

    if (startedAtRef.current) {
      setDurationSec(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }
  }, [stopTimer]);

  useEffect(() => {
    return () => {
      stopTimer();
      cleanupStream();
      cleanupObjectUrl();
    };
  }, [cleanupObjectUrl, cleanupStream, stopTimer]);

  return {
    status,
    isRecording: status === "recording",
    audioBlob,
    audioUrl,
    durationSec,
    start,
    stop,
  };
}
