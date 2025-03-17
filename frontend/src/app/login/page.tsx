"use client";
import { LoginMemberContext } from "./loginMemberStore";
import { use } from "react";
import Link from "next/link";

export default function Login() {
  const { isLogin, loginMember } = use(LoginMemberContext);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 overflow-hidden relative">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-blue-300 dark:bg-blue-600 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-indigo-300 dark:bg-indigo-700 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-purple-300 dark:bg-purple-700 blur-3xl"></div>
      </div>

      {/* Code particles decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
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

      {/* Main content */}
      <div className="flex flex-col items-center justify-center h-screen px-4">
        {!isLogin ? (
          <div className="w-full max-w-md">
            {/* Login Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
              <div className="px-8 pt-8 pb-6">
                <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                  DevPrep
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
                  개발자의 꿈을 현실로, 지금 로그인하세요
                </p>

                <div className="flex flex-col items-center space-y-4">
                  <button className="transition-transform hover:scale-105 focus:outline-none">
                    <a
                      href="https://devapi.store/oauth2/authorization/kakao?redirectUrl=https://chilldevprep.vercel.app"
                      className="block"
                    >
                      <img
                        src="/kakao_login_medium_narrow.png"
                        alt="카카오 로그인"
                        className="w-full h-auto"
                      />
                    </a>
                  </button>

                  {/* 추가 소셜 로그인 버튼이 필요하다면 아래에 추가 */}
                </div>
              </div>

              <div className="px-8 py-6 bg-gray-50 dark:bg-gray-700 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  아직 회원이 아니신가요? 카카오 로그인으로 간편하게 가입하세요.
                </p>
              </div>
            </div>

            {/* Benefits Cards */}
            <div className="mt-10 grid gap-4 grid-cols-1 md:grid-cols-3">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md text-center">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <svg
                    xmlns="https://www.w3.org/2000/svg"
                    className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
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
                <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">
                  맞춤형 학습
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  개인 맞춤형 학습 경로로 효율적인 공부가 가능합니다.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <svg
                    xmlns="https://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">
                  실전형 면접 대비
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  실제 면접과 유사한 환경에서 모의 면접을 통해 자신감을
                  키우세요.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <svg
                    xmlns="https://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">
                  커뮤니티
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  다른 개발자와 면접 경험을 공유하고 피드백을 주고받으세요.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden w-full max-w-md text-center">
            <div className="px-8 py-12">
              <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg
                  xmlns="https://www.w3.org/2000/svg"
                  className="h-12 w-12 text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                환영합니다!
              </h2>

              <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
                <span className="font-semibold">{loginMember.nickname}</span>님,
                오늘도 멋진 하루 되세요.
              </p>

              <div className="flex flex-col space-y-4">
                <Link
                  href="/"
                  className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none"
                >
                  메인으로 돌아가기
                </Link>

                <Link
                  href="/mypage"
                  className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                >
                  마이페이지
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
