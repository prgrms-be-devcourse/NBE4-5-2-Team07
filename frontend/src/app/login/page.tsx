"use client";
import { useContext } from "react";
import { LoginMemberContext } from "./loginMemberStore";

export default function Login() {
  const { isLogin, loginMember } = useContext(LoginMemberContext);

  return (
    <>
      {!isLogin && (
        <div className="flex flex-grow justify-center items-center">
          <button>
            <a href="http://localhost:8080/oauth2/authorization/kakao?redirectUrl=http://localhost:3000">
              카카오 로그인
            </a>
          </button>
        </div>
      )}
      {isLogin && <div>{loginMember.nickname}님 환영합니다.</div>}
    </>
  );
}
