import { NavLink } from 'react-router-dom';
import { Mic, Folder } from "lucide-react";
import styles from './Sidebar.module.css';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar} aria-label="نوار کناری">
      <div className={styles.logoWrap}>
        <div className={styles.logoMark} aria-hidden="true">
          <span className={styles.logoBar}></span>
          <span className={styles.logoBar}></span>
          <span className={styles.logoBar}></span>
        </div>
        <span className={styles.logoText}>آوا</span>
      </div>

      <nav className={styles.nav} aria-label="منوی اصلی">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
          }
        >
          <span className={styles.itemText}>تبدیل گفتار</span>
          <Mic className={styles.itemIcon} aria-hidden="true" />
        </NavLink>

        <NavLink
          to="/archive"
          className={({ isActive }) =>
            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
          }
        >
          <span className={styles.itemText}>آرشیو</span>
         <Folder className={styles.itemIcon} aria-hidden="true" />
        </NavLink>
      </nav>
    </aside>
  );
}
