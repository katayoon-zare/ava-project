type HarfResponse = {
  text?: string;
  transcript?: string;
  results?: Array<{
    text?: string;
    transcript?: string;
  }>;
} & Record<string, unknown>;

const HARF_BASE_URL =
  import.meta.env.VITE_HARF_BASE_URL ?? "https://harf.roshan-ai.ir";

const HARF_TOKEN = import.meta.env.VITE_HARF_TOKEN;

export async function transcribeFromUrl(mediaUrl: string): Promise<string> {
  if (!HARF_TOKEN) {
    throw new Error("توکن API تنظیم نشده است. VITE_HARF_TOKEN را بررسی کنید.");
  }

  const response = await fetch(`${HARF_BASE_URL}/api/transcribe_files/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${HARF_TOKEN}`,
    },
    body: JSON.stringify({
      media_urls: [mediaUrl],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Transcription request failed (${response.status}): ${errorText || "Unknown Error"}`
    );
  }

  const data = (await response.json()) as HarfResponse;
  
  if (typeof data.text === "string" && data.text.trim()) {
    return data.text;
  }
  if (typeof data.transcript === "string" && data.transcript.trim()) {
    return data.transcript;
  }

  
  if (Array.isArray(data.results) && data.results.length > 0) {
    const first = data.results[0];
    if (typeof first?.text === "string" && first.text.trim()) {
      return first.text;
    }
    if (typeof first?.transcript === "string" && first.transcript.trim()) {
      return first.transcript;
    }
  }

  throw new Error("متن خروجی از پاسخ API قابل استخراج نبود.");
}
