"use client";
import { createContext, useState, useContext, useEffect } from "react";
import { components } from "@/lib/backend/apiV1/schema";
import client from "@/lib/backend/client";

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

async function checkIsAdmin(id: number): Promise<boolean> {
  try {
    const response = await client.GET("/member/{id}/isAdmin", {
      params: {
        path: {
          id,
        },
      },
    });

    if (!response.error && response.data) {
      return response.data.data || false;
    }
    return false;
  } catch {
    return false;
  }
}

export function useLoginMember() {
  const [isLoginMemberPending, setLoginMemberPending] = useState(true);
  const [loginMember, _setLoginMember] = useState<Member>(createEmptyMember());
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (loginMember.id !== 0) {
      checkIsAdmin(loginMember.id).then(setIsAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [loginMember.id]);

  const removeLoginMember = () => {
    _setLoginMember(createEmptyMember());
    setLoginMemberPending(false);
    setIsAdmin(false);
  };

  const setLoginMember = (member: Member) => {
    _setLoginMember(member);
    setLoginMemberPending(false);
    checkIsAdmin(member.id).then(setIsAdmin);
  };

  const setNoLoginMember = () => {
    setLoginMemberPending(false);
  };

  const isLogin = loginMember.id !== 0;

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
