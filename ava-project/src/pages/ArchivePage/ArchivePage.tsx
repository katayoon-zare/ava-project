import { useMemo, useState } from "react";
import styles from "./ArchivePage.module.css";
import NewFileModal from "../../components/newFiles/NewFileModal";

type ArchiveStatus = "تکمیل شده" | "در حال پردازش" | "ناموفق";

type ArchiveItem = {
  id: number;
  title: string;
  date: string;
  duration: string;
  status: ArchiveStatus;
};

const archiveItems: ArchiveItem[] = [
  {
    id: 1,
    title: "جلسه تیم طراحی",
    date: "۱۴۰۵/۰۳/۰۱",
    duration: "۱۲:۴۵",
    status: "تکمیل شده",
  },
  {
    id: 2,
    title: "مصاحبه کاربر شماره ۳",
    date: "۱۴۰۵/۰۲/۲۹",
    duration: "۰۸:۱۲",
    status: "در حال پردازش",
  },
  {
    id: 3,
    title: "یادداشت صوتی روزانه",
    date: "۱۴۰۵/۰۲/۲۸",
    duration: "۰۳:۵۰",
    status: "تکمیل شده",
  },
  {
    id: 4,
    title: "جلسه هماهنگی پروژه آوا",
    date: "۱۴۰۵/۰۲/۲۷",
    duration: "۲۵:۱۰",
    status: "ناموفق",
  },
];

type StatusFilter = "all" | "done" | "processing" | "failed";

const statusToFilterValue: Record<ArchiveStatus, Exclude<StatusFilter, "all">> =
  {
    "تکمیل شده": "done",
    "در حال پردازش": "processing",
    ناموفق: "failed",
  };

function normalizeText(input: string): string {
  return input.trim().toLowerCase();
}

export default function ArchivePage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);

  const filteredItems = useMemo(() => {
    const q = normalizeText(query);

    return archiveItems.filter((item) => {
      const matchesStatus =
        statusFilter === "all" ||
        statusToFilterValue[item.status] === statusFilter;

      if (!matchesStatus) return false;
      if (!q) return true;

      const haystack = normalizeText(
        [item.title, item.date, item.duration, item.status].join(" ")
      );

      return haystack.includes(q);
    });
  }, [query, statusFilter]);

  function handleNewFileSuccess(): void {
    // اینجا محل ریفرش لیست/dispatch مجدد است (وقتی دیتا واقعی شد)
    // فعلاً فقط مودال بسته می‌شود
    setIsNewFileModalOpen(false);
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>آرشیو فایل‌ها</h1>
          <p className={styles.subtitle}>
            همه‌ی فایل‌های صوتی و متن‌های پردازش‌شده را اینجا مدیریت کن.
          </p>
        </div>

        <button
          className={styles.newButton}
          type="button"
          onClick={() => setIsNewFileModalOpen(true)}
        >
          + فایل جدید
        </button>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="جستجو در آرشیو..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="done">تکمیل شده</option>
          <option value="processing">در حال پردازش</option>
          <option value="failed">ناموفق</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <span>عنوان</span>
          <span>تاریخ</span>
          <span>مدت</span>
          <span>وضعیت</span>
          <span>عملیات</span>
        </div>

        <div className={styles.tableBody}>
          {filteredItems.map((item) => (
            <div key={item.id} className={styles.row}>
              <div className={styles.titleCell}>
                <div className={styles.fileIcon}>🎵</div>
                <span>{item.title}</span>
              </div>

              <span>{item.date}</span>
              <span>{item.duration}</span>

              <span
                className={`${styles.statusBadge} ${
                  item.status === "تکمیل شده"
                    ? styles.success
                    : item.status === "در حال پردازش"
                    ? styles.processing
                    : styles.failed
                }`}
              >
                {item.status}
              </span>

              <div className={styles.actions}>
                <button className={styles.actionButton} type="button">
                  مشاهده
                </button>
                <button className={styles.actionButton} type="button">
                  دانلود
                </button>
                <button className={styles.deleteButton} type="button">
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <NewFileModal
        isOpen={isNewFileModalOpen}
        onClose={() => setIsNewFileModalOpen(false)}
        onSuccess={handleNewFileSuccess}
      />
    </section>
  );
}
