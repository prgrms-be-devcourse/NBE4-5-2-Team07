"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import client from "@/lib/backend/client";
import { useLoginMemberContext } from "../login/loginMemberStore";
import { useEffect, useState } from "react";

export default function Header() {
  const { isLogin, isAdmin, removeLoginMember } = useLoginMemberContext();
  const router = useRouter();
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [interviewDropdownOpen, setInterviewDropdownOpen] = useState(false);

  async function handleLogout(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    try {
      const response = await fetch("https://devapi.store/member/logout", {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.msg || "로그아웃 실패");
        return;
      }
      removeLoginMember();
      router.replace("/");
    } catch (error) {
      console.error("로그아웃 오류:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 메인 컨테이너 - 높이 고정 및 세로 중앙 정렬 */}
        <div className="flex items-center justify-between h-16">
          {/* Logo and Main Navigation */}
          <div className="flex items-center h-full">
            <div className="flex-shrink-0 flex items-center h-full">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                  DevPrep
                </span>
              </Link>
            </div>

            {/* Desktop Navigation - 세로 중앙 정렬 강화 */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center h-full">
              {isAdminPage ? (
                <>
                  <Link
                    href="/admin/studyContent"
                    className={`flex items-center justify-center px-4 py-2 mx-1 rounded-md text-base font-medium ${
                      pathname === "/admin/studyContent"
                        ? "text-white bg-indigo-600 dark:bg-indigo-500"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    학습 콘텐츠 관리
                  </Link>
                  <Link
                    href="/admin/interview"
                    className={`flex items-center justify-center px-4 py-2 mx-1 rounded-md text-base font-medium ${
                      pathname === "/admin/interview"
                        ? "text-white bg-indigo-600 dark:bg-indigo-500"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    면접 질문 관리
                  </Link>
                  <Link
                    href="/admin/chat"
                    className={`flex items-center justify-center px-4 py-2 mx-1 rounded-md text-base font-medium ${
                      pathname === "/admin/chat"
                        ? "text-white bg-indigo-600 dark:bg-indigo-500"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    고객센터
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/studyContent"
                    className={`flex items-center justify-center px-4 py-2 mx-1 rounded-md text-base font-medium ${
                      pathname.startsWith("/studyContent")
                        ? "text-white bg-indigo-600 dark:bg-indigo-500"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    CS 전공지식 학습하기
                  </Link>

                  {/* Interview Dropdown - 문제 수정한 부분 */}
                  <div
                    className="relative flex items-center h-full"
                    onMouseEnter={() => setInterviewDropdownOpen(true)}
                    onMouseLeave={() => setInterviewDropdownOpen(false)}
                  >
                    <button
                      className={`flex items-center justify-center px-4 py-2 mx-1 rounded-md text-base font-medium ${
                        pathname.startsWith("/interview")
                          ? "text-white bg-indigo-600 dark:bg-indigo-500"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => router.push("/interview/all")}
                    >
                      기술 면접 대비하기
                      <svg
                        className="ml-1 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="https://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </button>
                    {/* Dropdown Menu - 간격 제거하고 부모에 이벤트 위임 */}
                    {interviewDropdownOpen && (
                      <div className="absolute left-0 top-full w-60 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                        <div
                          className="py-1"
                          role="menu"
                          aria-orientation="vertical"
                        >
                          <Link
                            href="/interview/all"
                            className="block px-4 py-3 text-base text-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            role="menuitem"
                          >
                            전체 예상 질문 보기
                          </Link>
                          <Link
                            href="/interview/category"
                            className="block px-4 py-3 text-base text-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            role="menuitem"
                          >
                            CS 분야 별 예상 질문 보기
                          </Link>
                          <Link
                            href="/interview/keyword"
                            className="block px-4 py-3 text-base text-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            role="menuitem"
                          >
                            키워드 별 예상 질문 보기
                          </Link>
                          <Link
                            href="/interview/random"
                            className="block px-4 py-3 text-base text-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            role="menuitem"
                          >
                            랜덤으로 질문 보기
                          </Link>
                          <Link
                            href="/api/techInterview"
                            className="block px-4 py-3 text-base text-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            role="menuitem"
                          >
                            실전 면접 대비 : 가상 면접
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  <Link
                    href="/community"
                    className={`flex items-center justify-center px-4 py-2 mx-1 rounded-md text-base font-medium ${
                      pathname.startsWith("/community")
                        ? "text-white bg-indigo-600 dark:bg-indigo-500"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    면접 경험 공유하기
                  </Link>
                  <Link
                    href="/news"
                    className={`flex items-center justify-center px-4 py-2 mx-1 rounded-md text-base font-medium ${
                      pathname.startsWith("/news")
                        ? "text-white bg-indigo-600 dark:bg-indigo-500"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    뉴스
                  </Link>

                  {isLogin && (
                    <Link
                      href="/mypage"
                      className={`flex items-center justify-center px-4 py-2 mx-1 rounded-md text-base font-medium ${
                        pathname.startsWith("/mypage")
                          ? "text-white bg-indigo-600 dark:bg-indigo-500"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      마이페이지
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right side: auth buttons or admin back button */}
          <div className="hidden sm:flex sm:items-center h-full">
            {isAdminPage ? (
              <Link
                href="/"
                className="flex items-center justify-center px-4 py-2 mx-1 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                뒤로가기
              </Link>
            ) : (
              <>
                {!isLogin ? (
                  <Link
                    href="/login"
                    className="flex items-center justify-center px-5 py-2 mx-1 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none"
                  >
                    로그인
                  </Link>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center px-5 py-2 mx-1 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                    >
                      로그아웃
                    </button>

                    {isAdmin && (
                      <Link
                        href="/admin/studyContent"
                        className="flex items-center justify-center p-2 mx-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                      >
                        <span className="sr-only">관리자 페이지</span>
                        <span className="text-xl">⚙️</span>
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-white hover:bg-indigo-600 dark:hover:bg-indigo-500 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${mobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="https://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${mobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="https://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div
        className={`${mobileMenuOpen ? "block" : "hidden"} sm:hidden`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {isAdminPage ? (
            <>
              <Link
                href="/admin/studyContent"
                className={`flex items-center justify-center px-3 py-3 rounded-md text-base font-medium ${
                  pathname === "/admin/studyContent"
                    ? "text-white bg-indigo-600 dark:bg-indigo-500"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                학습 콘텐츠 관리
              </Link>
              <Link
                href="/admin/interview"
                className={`flex items-center justify-center px-3 py-3 rounded-md text-base font-medium ${
                  pathname === "/admin/interview"
                    ? "text-white bg-indigo-600 dark:bg-indigo-500"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                면접 질문 관리
              </Link>
              <Link
                href="/admin/chat"
                className={`flex items-center justify-center px-3 py-3 rounded-md text-base font-medium ${
                  pathname === "/admin/chat"
                    ? "text-white bg-indigo-600 dark:bg-indigo-500"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                고객센터
              </Link>
              <Link
                href="/"
                className="flex items-center justify-center px-3 py-3 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                뒤로가기
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/"
                className={`flex items-center justify-center px-3 py-3 rounded-md text-base font-medium ${
                  pathname === "/"
                    ? "text-white bg-indigo-600 dark:bg-indigo-500"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                MAIN
              </Link>
              <Link
                href="/studyContent"
                className={`flex items-center justify-center px-3 py-3 rounded-md text-base font-medium ${
                  pathname.startsWith("/studyContent")
                    ? "text-white bg-indigo-600 dark:bg-indigo-500"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                CS 전공지식 학습하기
              </Link>

              {/* Mobile Interview Submenu (accordion style) */}
              <div>
                <button
                  className={`w-full flex justify-between items-center px-3 py-3 rounded-md text-base font-medium ${
                    pathname.startsWith("/interview")
                      ? "text-white bg-indigo-600 dark:bg-indigo-500"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  onClick={() =>
                    setInterviewDropdownOpen(!interviewDropdownOpen)
                  }
                >
                  <span>기술 면접 대비하기</span>
                  <svg
                    className={`h-5 w-5 transform ${
                      interviewDropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {interviewDropdownOpen && (
                  <div className="pl-4 pr-2 py-2 space-y-1 bg-gray-50 dark:bg-gray-800 rounded-md mt-1">
                    <Link
                      href="/interview/all"
                      className="flex items-center justify-center px-3 py-3 rounded-md text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      전체 예상 질문 보기
                    </Link>
                    <Link
                      href="/interview/category"
                      className="flex items-center justify-center px-3 py-3 rounded-md text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      CS 분야 별 예상 질문 보기
                    </Link>
                    <Link
                      href="/interview/keyword"
                      className="flex items-center justify-center px-3 py-3 rounded-md text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      키워드 별 예상 질문 보기
                    </Link>
                    <Link
                      href="/interview/random"
                      className="flex items-center justify-center px-3 py-3 rounded-md text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      랜덤으로 질문 보기
                    </Link>
                    <Link
                      href="/api/techInterview"
                      className="flex items-center justify-center px-3 py-3 rounded-md text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      실전 면접 대비 : 가상 면접
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/community"
                className={`flex items-center justify-center px-3 py-3 rounded-md text-base font-medium ${
                  pathname.startsWith("/community")
                    ? "text-white bg-indigo-600 dark:bg-indigo-500"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                면접 경험 공유하기
              </Link>

              {isLogin && (
                <Link
                  href="/mypage"
                  className={`flex items-center justify-center px-3 py-3 rounded-md text-base font-medium ${
                    pathname.startsWith("/mypage")
                      ? "text-white bg-indigo-600 dark:bg-indigo-500"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  마이페이지
                </Link>
              )}

              {/* Mobile Auth Buttons */}
              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                {!isLogin ? (
                  <Link
                    href="/login"
                    className="flex items-center justify-center px-4 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-md text-white text-base font-medium"
                  >
                    로그인
                  </Link>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      로그아웃
                    </button>

                    {isAdmin && (
                      <Link
                        href="/admin/studyContent"
                        className="flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-200 text-base font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        관리자 페이지 ⚙️
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
