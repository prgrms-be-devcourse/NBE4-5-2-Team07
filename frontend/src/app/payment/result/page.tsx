"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePaymentStore } from "../store/paymentStroe";

// 배경 컴포넌트 - 화면 전체에 적용될 배경을 만듭니다
const Background = () => (
  <>
    {/* 배경 그라데이션 */}
    <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 -z-10"></div>

    {/* 배경 장식 요소 */}
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none -z-10">
      <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-blue-300 dark:bg-blue-600 blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-indigo-300 dark:bg-indigo-700 blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-purple-300 dark:bg-purple-700 blur-3xl"></div>
    </div>

    {/* 코드 파티클 배경 */}
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none -z-10">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-gray-800 dark:text-gray-200 text-opacity-30 font-mono text-sm"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 90 - 45}deg)`,
          }}
        >
          {
            [
              "function()",
              "const data = []",
              "for(let i=0;)",
              "if(isValid)",
              "return result",
              "{ }",
              "=> {}",
              "import",
              "export",
              "class",
            ][Math.floor(Math.random() * 10)]
          }
        </div>
      ))}
    </div>
  </>
);

export default function PaymentResultPage() {
  const router = useRouter();
  const paymentData = usePaymentStore().paymentData;

  return (
    <div className="fixed inset-0 h-screen w-screen flex items-center justify-center">
      {/* 배경 컴포넌트 */}
      <Background />

      {/* 주 콘텐츠 */}
      <div className="w-full h-full flex justify-center items-center">
        <div className="w-full max-w-6xl px-4 py-8 z-10">
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 md:p-10 mx-auto"
            style={{ maxWidth: "800px" }}
          >
            <div className="text-center">
              {/* 성공 아이콘 */}
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text mb-8">
                결제 완료 🎉
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                결제가 성공적으로 완료되었습니다!
              </p>

              {/* 결제 정보 카드 */}
              <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-6 mb-8 shadow-inner mx-auto max-w-md">
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center border-b border-indigo-100 dark:border-indigo-800 pb-4">
                    <span className="text-gray-600 dark:text-gray-400">
                      결제 상품
                    </span>
                    <strong className="text-lg text-gray-800 dark:text-white">
                      {paymentData.buyerName} 님의 프리미엄 플랜 30일 구독
                    </strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-indigo-100 dark:border-indigo-800 pb-4">
                    <span className="text-gray-600 dark:text-gray-400">
                      결제 금액
                    </span>
                    <strong className="text-lg text-gray-800 dark:text-white">
                      {paymentData.amount.toLocaleString()} 원
                    </strong>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      결제 상태
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      {paymentData.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => router.push("/")}
                  className="rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-3 px-8 font-medium text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  홈으로 이동
                </button>
                <button
                  onClick={() => router.push("/api/techInterview")}
                  className="rounded-full bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 py-3 px-8 font-medium text-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  면접 시작하기
                </button>
              </div>
            </div>
          </div>

          {/* 특징 섹션 - 고정 너비로 설정 */}
          <div
            className="grid md:grid-cols-3 gap-8 mt-12 mx-auto"
            style={{ maxWidth: "1000px" }}
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg mb-4 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                AI 기반 학습
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                실제 면접과 유사한 질문으로 실전 감각을 기를 수 있습니다.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mb-4 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                맞춤형 피드백
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                상세한 피드백으로 부족한 부분을 파악하고 개선할 수 있습니다.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                무제한 연습
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                언제든지 면접 연습을 할 수 있어 자신감을 키울 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
