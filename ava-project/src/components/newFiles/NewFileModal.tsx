import React, { useMemo, useState } from "react";
import styles from "./NewFileModal.module.css";

type StatusOption = "completed" | "pending" | "processing" | "failed";

interface NewFileModalProps{
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; 
  onSubmit: (data: {
    title: string;
    status: StatusOption;
    date: string;

    duration: string;
  }) => void;
  defaultValues?: {
    title?: string;
    status?: StatusOption;
    date?: string;
    duration?: string;
  };
}

const statusOptions: Array<{ value: StatusOption; label: string }> = [
  { value: "completed", label: "تکمیل شده" },
  { value: "pending", label: "در انتظار" },
  { value: "processing", label: "در حال پردازش" },
  { value: "failed", label: "ناموفق" },
];

function getTodayJalali(): string {
  const today = new Date();
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(today);
}

export default function NewFileModal({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  onSuccess,
}: NewFileModalProps) {
  const initialValues = useMemo(
    () => ({
      title: defaultValues?.title ?? "",
      status: defaultValues?.status ?? "pending" as StatusOption,
      date: defaultValues?.date ?? getTodayJalali(),
      duration: defaultValues?.duration ?? "00:00",
    }),
    [defaultValues]
  );

  const [title, setTitle] = useState(initialValues.title);
  const [status, setStatus] = useState<StatusOption>(initialValues.status);
  const [date, setDate] = useState(initialValues.date);
  const [duration, setDuration] = useState(initialValues.duration);
  const [error, setError] = useState<string>("");

  function resetForm(): void {
    setTitle(initialValues.title);
    setStatus(initialValues.status);
    setDate(initialValues.date);
    setDuration(initialValues.duration);
    setError("");
  }

  function handleClose(): void {
    resetForm();
    onClose();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();

    if (!title.trim()) {
      setError("عنوان را وارد کنید.");
      return;
    }

    onSubmit({
      title: title.trim(),
      status,
      date,
      duration,
    });

    onSuccess?.();

    resetForm();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>ثبت فایل جدید</h2>
          <button type="button" className={styles.closeBtn} onClick={handleClose}>
            ×
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>عنوان</label>
            <input
              className={styles.input}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: جلسه طراحی محصول"
            />
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>وضعیت</label>
              <select
                className={styles.input}
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusOption)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>تاریخ</label>
              <input className={styles.input} type="text" value={date} readOnly />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>مدت زمان</label>
            <input
              className={styles.input}
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="مثلاً 00:12"
            />
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.actions}>
            <button type="button" className={styles.secondaryBtn} onClick={handleClose}>
              انصراف
            </button>
            <button type="submit" className={styles.primaryBtn}>
              ثبت
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
