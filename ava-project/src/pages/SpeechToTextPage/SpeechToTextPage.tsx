import { useState } from "react";
import { Mic, Folder, ChevronDown, Settings2 } from "lucide-react";
import styles from "./SpeechToTextPage.module.css";

type Mode = "idle" | "recording" | "processing" | "result";

export default function SpeechToTextPage() {
  const [mode, setMode] = useState<Mode>("idle");

  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>تبدیل گفتار به متن</h1>
          <p className={styles.subtitle}>
            آوا، ابزاری ساده و سریع برای تبدیل صحبت‌های شما به متن دقیق و حرفه‌ای است.
          </p>
        </header>

        <div className={styles.modeTabs} role="tablist" aria-label="حالت‌های تبدیل گفتار">
          <button
            className={`${styles.tab} ${mode === "idle" ? styles.tabActive : ""}`}
            onClick={() => setMode("idle")}
          >
            آماده ضبط
          </button>
          <button
            className={`${styles.tab} ${mode === "recording" ? styles.tabActiveRecording : ""}`}
            onClick={() => setMode("recording")}
          >
            در حال ضبط
          </button>
          <button
            className={`${styles.tab} ${mode === "processing" ? styles.tabActiveProcessing : ""}`}
            onClick={() => setMode("processing")}
          >
            در حال تبدیل
          </button>
          <button
            className={`${styles.tab} ${mode === "result" ? styles.tabActiveResult : ""}`}
            onClick={() => setMode("result")}
          >
            نتیجه
          </button>
        </div>

        <section className={`${styles.card} ${styles[mode]}`}>
          {mode === "idle" && (
            <div className={styles.emptyState}>
              <div className={styles.micBadge}>
                <Mic size={26} strokeWidth={2.2} />
              </div>
              <p className={styles.emptyTitle}>برای شروع به صحبت کنید و دکمه ضبط را بزنید</p>
              <p className={styles.emptyText}>
                همین حالا صحبت کنید تا متن شما در همین بخش ظاهر شود.
              </p>
            </div>
          )}

          {mode === "recording" && (
            <div className={styles.recordingState}>
              <div className={styles.recordingDot} />
              <p className={styles.recordingText}>در حال ضبط صدا...</p>
            </div>
          )}

          {mode === "processing" && (
            <div className={styles.processingState}>
              <p className={styles.processingText}>
                H-H-H... سیستم در حال تبدیل گفتار به متن است. لطفاً کمی صبر کنید.
              </p>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} />
              </div>
            </div>
          )}

          {mode === "result" && (
            <div className={styles.resultState}>
              <div className={styles.resultTopBar}>
                <button className={styles.smallPill}>متن خروجی</button>
                <div className={styles.toolbar}>
                  <button className={styles.iconBtn} aria-label="تنظیمات">
                    <Settings2 size={16} />
                  </button>
                  <button className={styles.iconBtn} aria-label="دانلود">
                    <Folder size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.resultBox}>
                <p>
                  اینجا متن تبدیل‌شده قرار می‌گیرد. در نسخه‌ی واقعی، نتیجه‌ی تشخیص
                  گفتار، ویرایش و ذخیره خواهد شد.
                </p>
              </div>

              <div className={styles.audioControls}>
                <button className={styles.playBtn}>▶</button>
                <input className={styles.range} type="range" min="0" max="100" defaultValue="35" />
                <span className={styles.time}>01:24</span>
              </div>
            </div>
          )}
        </section>

        <div className={styles.languageRow}>
          <button className={styles.langButton}>
            <ChevronDown size={14} />
            فارسی
          </button>
          <span className={styles.languageLabel}>زبان گفتار</span>
        </div>
      </div>
    </div>
  );
}
