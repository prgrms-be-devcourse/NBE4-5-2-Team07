"use client";
import { LoginMemberContext } from "./loginMemberStore";
import { use } from "react";

export default function Login() {
  const { isLogin, loginMember } = use(LoginMemberContext);

  return (
    <>
      {!isLogin && (
        <div className="flex flex-grow justify-center items-center">
          <button>
            <a href="http://localhost:8080/oauth2/authorization/kakao?redirectUrl=http://localhost:3000">
              <img src="/kakao_login_medium_narrow.png" alt="카카오 로그인" />
            </a>
          </button>
        </div>
      )}
      {isLogin && <div>{loginMember.nickname}님 환영합니다.</div>}
    </>
  );
}
