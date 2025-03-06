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
      <body>
        <LoginMemberContext.Provider value={loginMemberContextValue}>
          <Header />
          <div className="flex flex-col flex-grow justify-center items-center">
            {children}
          </div>
          <footer className="flex justify-center gap-7 p-4">
            @Copywrite 2025
          </footer>
        </LoginMemberContext.Provider>
      </body>
    </html>
  );
}
