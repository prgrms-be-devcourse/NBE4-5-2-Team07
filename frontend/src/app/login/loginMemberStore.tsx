"use client";
import { createContext, useState, useContext } from "react";
import { components } from "@/lib/backend/apiV1/schema";

type Member = components["schemas"]["MemberDto"];

export const LoginMemberContext = createContext<{
  loginMember: Member;
  setLoginMember: (member: Member) => void;
  removeLoginMember: () => void;
  isLogin: boolean;
  isLoginMemberPending: boolean;
  isAdmin: boolean;
  setNoLoginMember: () => void;
}>({
  loginMember: createEmptyMember(),
  setLoginMember: () => {},
  removeLoginMember: () => {},
  isLogin: false,
  isLoginMemberPending: true,
  isAdmin: false,
  setNoLoginMember: () => {},
});

function createEmptyMember(): Member {
  return {
    id: 0,
    nickname: "",
    profileImgUrl: "",
  };
}

export function useLoginMember() {
  const [isLoginMemberPending, setLoginMemberPending] = useState(true);
  const [loginMember, _setLoginMember] = useState<Member>(createEmptyMember());

  const removeLoginMember = () => {
    _setLoginMember(createEmptyMember());
    setLoginMemberPending(false);
  };

  const setLoginMember = (member: Member) => {
    _setLoginMember(member);
    setLoginMemberPending(false);
  };

  const setNoLoginMember = () => {
    setLoginMemberPending(false);
  };

  const isLogin = loginMember.id !== 0;
  const isAdmin = loginMember.id === 1;

  return {
    loginMember,
    removeLoginMember,
    isLogin,
    isLoginMemberPending,
    setLoginMember,
    isAdmin,
    setNoLoginMember,
  };
}

export function useLoginMemberContext() {
  return useContext(LoginMemberContext);
}
