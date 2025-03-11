"use client";

import "./globals.css";
import Header from "./components/Header";
import client from "@/lib/backend/client";
import { LoginMemberContext, useLoginMember } from "./login/loginMemberStore";
import { useEffect } from "react";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {
    setLoginMember,
    isLogin,
    loginMember,
    removeLoginMember,
    isLoginMemberPending,
    isAdmin,
    setNoLoginMember,
  } = useLoginMember();

  const loginMemberContextValue = {
    loginMember,
    setLoginMember,
    removeLoginMember,
    isLogin,
    isLoginMemberPending,
    isAdmin,
    setNoLoginMember,
  };

  async function fetchLoginMember() {
    const response = await client.GET("/member/me", {
      credentials: "include",
    });

    if (response.error) {
      setNoLoginMember();
      return;
    }

    setLoginMember(response.data.data);
  }

  useEffect(() => {
    fetchLoginMember();
  }, []);

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
        <LoginMemberContext.Provider value={loginMemberContextValue}>
          <Header />
          <div className="flex-grow">{children}</div>
          <footer className="relative overflow-hidden py-10 bg-white dark:bg-gray-800 shadow-lg mt-12">
            {/* 배경 장식 요소 */}
            <div className="absolute bottom-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-indigo-300 dark:bg-indigo-700 blur-2xl"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-purple-300 dark:bg-purple-700 blur-2xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
                    D
                  </div>
                  <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    DevPrep
                  </span>
                </div>

                <div className="text-center md:text-right">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    © {new Date().getFullYear()} Programmers Devcourse BE4-5
                    Chill Team Project
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                    개발자의 꿈을 현실로
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </LoginMemberContext.Provider>
      </body>
    </html>
  );
}
