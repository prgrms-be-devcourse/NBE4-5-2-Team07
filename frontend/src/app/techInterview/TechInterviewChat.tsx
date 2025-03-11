"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "bot";
  text: string;
}

interface MeResponseData {
  id: number;
  username: string;
}

interface RsData<T> {
  resultCode: string;
  msg: string;
  data: T;
}

export default function TechInterviewChat() {
  const router = useRouter();

  // 로그인 사용자 정보와 로딩 상태
  const [user, setUser] = useState<MeResponseData | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // 메시지 기록, 사용자 입력, 인터뷰 주제 관리
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [interviewType, setInterviewType] = useState<"CS" | "프로젝트" | null>(
    null
  );
  // 평가 진행 상태 관리
  const [isEvaluating, setIsEvaluating] = useState(false);

  // 컴포넌트 마운트 시 로그인 여부 확인
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:8080/member/me", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const json = (await res.json()) as RsData<MeResponseData>;
        setUser(json.data);
      } catch (error) {
        router.push("/login");
      } finally {
        setLoadingUser(false);
      }
    })();
  }, [router]);

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>로그인 상태 확인중...</p>
      </div>
    );
  }
  if (!user) return null;

  // 인터뷰 시작: 주제 선택 버튼 클릭 시
  const startInterview = async (type: "CS" | "프로젝트") => {
    setInterviewType(type);
    try {
      const res = await fetch("/api/techInterview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewType: type }),
      });
      const data = await res.json();
      const botMessage: Message = { role: "bot", text: data.response };
      setMessages([botMessage]);
    } catch (error) {
      console.error("Error starting interview:", error);
      setMessages([
        { role: "bot", text: "인터뷰 시작 중 오류가 발생했습니다." },
      ]);
    }
  };

  // 답변 전송 및 후속 질문 받기
  const sendAnswer = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    try {
      const res = await fetch("/api/techInterview/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: input, interviewType }),
      });
      const data = await res.json();
      const botMessage: Message = { role: "bot", text: data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "오류가 발생했습니다. 다시 시도해주세요." },
      ]);
    }
    setInput("");
  };

  // 평가 요청
  const evaluateInterview = async () => {
    if (isEvaluating) {
      alert("답변에 대해 AI가 정리중입니다. 잠시만 기다려주세요.");
      return;
    }
    setIsEvaluating(true);
    try {
      const res = await fetch("/api/techInterview/evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation: messages }),
      });
      const data = await res.json();
      localStorage.setItem("evaluationResult", data.response);
      router.push("/techInterview/evaluation");
    } catch (error) {
      console.error("Evaluation error:", error);
      alert("평가 요청 중 오류가 발생했습니다.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // 주제 선택 전 화면: 두 개의 버튼 제공
  if (!interviewType) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 relative">
        {/* 배경 장식 요소 */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-blue-300 dark:bg-blue-600 blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-indigo-300 dark:bg-indigo-700 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-purple-300 dark:bg-purple-700 blur-3xl"></div>
        </div>
        {/* 코드 파티클 배경 */}
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
        {/* 메인 컨텐츠: 가로 여백 늘림 */}
        <div className="container mx-auto max-w-4xl px-4 py-12 relative z-10">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-10 text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              안녕하세요! <br />
              기술 면접을 담당하는 AI 면접관 입니다.
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              아래 버튼에서 가상 인터뷰 주제를 선택해주세요.
            </p>
            <div className="flex justify-center space-x-6">
              <button
                onClick={() => startInterview("CS")}
                className="rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-3 px-8 shadow-lg transition-all"
              >
                CS 지식 면접
              </button>
              <button
                onClick={() => startInterview("프로젝트")}
                className="rounded-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold py-3 px-8 shadow-lg transition-all"
              >
                프로젝트 경험 면접
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 인터뷰 진행 중 화면: 컨텐츠 너비 및 레이아웃 개선
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 overflow-hidden relative">
      {/* 배경 장식 요소 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-blue-300 dark:bg-blue-600 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-indigo-300 dark:bg-indigo-700 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-purple-300 dark:bg-purple-700 blur-3xl"></div>
      </div>
      {/* 코드 파티클 배경 */}
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
      {/* 메인 컨텐츠: 가로 크기 및 패딩 개선 */}
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 md:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-200 text-center mb-8">
            기술 면접 챗봇
          </h1>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 h-[600px] overflow-y-auto mb-6 bg-gray-50 dark:bg-gray-900">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-4 flex ${
                  msg.role === "bot" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-lg shadow-sm ${
                    msg.role === "bot"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                      : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                  }`}
                >
                  <span className="font-bold block mb-1">
                    {msg.role === "bot" ? "면접관" : "지원자"}:
                  </span>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col space-y-6">
            <div className="flex">
              <textarea
                value={input}
                placeholder="답변을 입력하세요..."
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-200 resize-y min-h-[100px]"
              />
              <button
                onClick={sendAnswer}
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold px-6 rounded-r-lg transition-colors"
              >
                전송
              </button>
            </div>
            <button
              onClick={evaluateInterview}
              disabled={isEvaluating}
              className={`${
                isEvaluating
                  ? "bg-red-300 dark:bg-red-700"
                  : "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
              } text-white font-semibold py-3 px-8 rounded-lg shadow-md mx-auto transition-colors`}
            >
              면접 종료하고 평가 받기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
