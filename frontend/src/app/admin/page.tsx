"use client";

import Link from "next/link";
import styles from "../styles/admin.module.css";

export default function AdminPage() {
  return (
    <div className={styles.adminContainer}>
          <h1>관리자 홈 페이지</h1>
          <p>구현 중.. </p>
      
      <nav className={styles.adminNav}>
        <ul>
          <li><Link href="/admin/content">학습 콘텐츠 관리</Link></li>
          <li><Link href="/admin/questions">질문 관리</Link></li>
          <li><Link href="/admin/members">사용자 관리</Link></li>
        </ul>
      </nav>
    </div>
  );
}
