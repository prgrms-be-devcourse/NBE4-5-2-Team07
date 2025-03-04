"use client";

import Link from "next/link";
import styles from "../styles/header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          <li>
            <Link href="/">CS 전공지식 학습하기</Link>
          </li>
          <li>
            <Link href="/about">기술 면접 뿌시기</Link>
          </li>
          <li>
            <Link href="/contact">로드맵</Link>
          </li>
          <li>
            <Link href="/mypage">마이페이지</Link>
          </li>
        </ul>
        <ul className={styles.navList}>
          <li>
            <Link href="/login">로그인 / 회원가입</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
