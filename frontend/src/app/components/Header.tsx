"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import client from "@/lib/backend/client";
import styles from "../styles/header.module.css";
import { useLoginMemberContext } from "../login/loginMemberStore";
import { useEffect } from "react";

export default function Header() {
  const { isLogin, isAdmin, removeLoginMember } = useLoginMemberContext();
  const router = useRouter();
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  async function handleLogout(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const response = await client.DELETE("/member/logout", {
      credentials: "include",
    });
    if (response.error) {
      alert(response.error.msg);
      return;
    }
    removeLoginMember();
    router.replace("/");
  }

  useEffect(() => {
    if (pathname === "/mypage" && !isLogin) {
      alert("로그인 후 이용 가능합니다.");
      router.replace("/login");
    }
  }, [pathname, isLogin, router]);

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
                <Link href="/">MAIN</Link>
              </li>
              <li>
                <Link href="/studyContent">CS 전공지식 학습하기</Link>
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
                    <Link href="/interview/random">랜덤으로 질문 보기</Link>
                  </li>
                  <li>
                    <Link href="/api/techInterview">
                      실전 면접 대비 : 가상 면접
                    </Link>
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
              {!isLogin && (
                <li>
                  <Link href="/login">로그인</Link>
                </li>
              )}
              {isLogin && (
                <li>
                  <button
                    onClick={handleLogout}
                    className={styles.logoutButton}
                  >
                    로그아웃
                  </button>
                </li>
              )}
              {isAdmin && (
                <li>
                  <Link href="/admin">⚙️</Link>
                </li>
              )}
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
