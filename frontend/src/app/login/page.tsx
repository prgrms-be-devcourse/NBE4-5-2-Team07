"use client";
import { useContext } from "react";
import { LoginMemberContext } from "./loginMemberStore";

export default function Login() {
  const { isLogin, loginMember } = useContext(LoginMemberContext);

  return (
    <>
      {!isLogin && (
        <div className="flex flex-grow justify-center items-center">
          <button className="bg-yellow-300 hover:bg-yellow-400 text-gray-800 font-bold py-2 px-6 rounded-full shadow-lg transition-colors">
            <a href="http://localhost:8080/oauth2/authorization/kakao?redirectUrl=http://localhost:3000">
              카카오톡 간편 로그인으로 시작하기
            </a>
          </button>
        </div>
      )}
      {isLogin && <div>{loginMember.nickname}님 환영합니다.</div>}
    </>
  );
}
