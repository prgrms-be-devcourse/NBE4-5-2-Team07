"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../styles/header.module.css";

export default function Header() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <ul className={styles.navList}>

          {isAdminPage ? (
            <>
              <li>
                <Link href="/admin">관리자 홈</Link>
              </li>
              <li>
                <Link href="/admin/content">학습 콘텐츠 관리</Link>
              </li>
              <li>
                <Link href="/admin/questions">질문 관리</Link>
              </li>
              <li>
                <Link href="/admin/members">사용자 관리</Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/">CS 전공지식 학습하기</Link>
              </li>

              {/* 드롭다운 메뉴 시작 */}
              <li className={styles.dropdown}>
                <Link href="#">기술 면접 대비하기</Link>
                <ul className={styles.dropdownMenu}>
                  <li>
                    <Link href="/interview/all">전체 예상 질문 보기</Link>
                  </li>
                  <li>
                    <Link href="/interview/category">
                      CS 분야 별 예상 질문 보기
                    </Link>
                  </li>
                  <li>
                    <Link href="/interview/keyword">
                      키워드 별 예상 질문 보기
                    </Link>
                  </li>
                  <li>
                    <Link href="/interview/random">실전 면접 대비</Link>
                  </li>
                </ul>
              </li>
              {/* 드롭다운 메뉴 끝 */}

              <li>
                <Link href="/contact">로드맵</Link>
              </li>
              <li>
                <Link href="/mypage">마이페이지</Link>
              </li>
            </>
          )}
        </ul>
        <ul className={styles.navList}>
          {isAdminPage ? (
            <li>
              <Link href="/">뒤로가기</Link>
            </li>
          ) : (
            <>
              <li>
                <Link href="/login">로그인 / 회원가입</Link>
              </li>
              <li>
                <Link href="/admin">⚙️</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
