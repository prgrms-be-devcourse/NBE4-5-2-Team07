"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "bot";
  content: string;
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
        const res = await fetch("https://devapi.store/member/me", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const json = (await res.json()) as RsData<MeResponseData>;
        setUser(json.data);
        console.log(json);
      } catch (error) {
        router.push("/login");
      } finally {
        setLoadingUser(false);
      }
    })();
  }, [router]);

  if (loadingUser) {
    return (
      <div className="fixed inset-0 h-screen w-screen flex items-center justify-center">
        <Background />
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin z-10"></div>
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
        credentials: "include",
      });
      if (res.status === 403 || res.redirected) {
        router.push("/payment");
        return;
      }
      const data = await res.json();
      const botMessage: Message = { role: "bot", content: data.response };
      setMessages([botMessage]);
    } catch (error) {
      console.error("Error starting interview:", error);
      setMessages([
        { role: "bot", content: "인터뷰 시작 중 오류가 발생했습니다." },
      ]);
    }
  };

  // 답변 전송 및 후속 질문 받기
  const sendAnswer = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    try {
      const res = await fetch("/api/techInterview/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: input, interviewType }),
        credentials: "include",
      });
      if (res.status === 403 || res.redirected) {
        router.push("/payment");
        return;
      }
      const data = await res.json();
      const botMessage: Message = { role: "bot", content: data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "오류가 발생했습니다. 다시 시도해주세요." },
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
        credentials: "include",
      });
      if (res.status === 403 || res.redirected) {
        router.push("/payment");
        return;
      }
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
      <div className="fixed inset-0 h-screen w-screen flex items-center justify-center">
        {/* 배경 컴포넌트 */}
        <Background />

        {/* 주 콘텐츠 */}
        <div className="w-full h-full flex justify-center items-center">
          <div className="w-full max-w-6xl px-4 py-8 z-10">
            {/* 선택 카드 */}
            <div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 md:p-10 mx-auto"
              style={{ maxWidth: "800px" }}
            >
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text mb-8 text-center">
                안녕하세요! <br />
                기술 면접을 담당하는 AI 면접관입니다.
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 text-center">
                아래 버튼에서 가상 인터뷰 주제를 선택해주세요.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                  onClick={() => startInterview("CS")}
                  className="rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-3 px-8 font-medium text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 w-full sm:w-auto"
                >
                  <svg
                    xmlns="https://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  CS 지식 면접
                </button>
                <button
                  onClick={() => startInterview("프로젝트")}
                  className="rounded-full bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 py-3 px-8 font-medium text-lg transition-all flex items-center justify-center gap-2 shadow-lg w-full sm:w-auto"
                >
                  <svg
                    xmlns="https://www.w3.org/2000/svg"
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
                  프로젝트 경험 면접
                </button>
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
                    xmlns="https://www.w3.org/2000/svg"
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
                    xmlns="https://www.w3.org/2000/svg"
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
                    xmlns="https://www.w3.org/2000/svg"
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

  // 인터뷰 진행 중 화면 - 고정 너비 사용
  return (
    <div className="fixed inset-0 h-screen w-screen flex items-center justify-center">
      {/* 배경 컴포넌트 */}
      <Background />

      {/* 고정 너비와 중앙 정렬을 적용한 채팅 영역 */}
      <div className="w-full h-full flex justify-center items-center">
        <div className="w-full max-w-6xl px-4 py-8 z-10">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text text-center mb-6">
              {interviewType === "CS" ? "CS 지식 면접" : "프로젝트 경험 면접"}
            </h1>

            <div className="border border-indigo-100 dark:border-indigo-800 rounded-xl p-6 h-[500px] overflow-y-auto mb-6 bg-indigo-50 dark:bg-indigo-900/30 shadow-inner">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-4 flex ${
                    msg.role === "bot" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[70%] px-5 py-4 rounded-xl shadow-md ${
                      msg.role === "bot"
                        ? "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                        : "bg-indigo-600 text-white"
                    }`}
                  >
                    <span className="font-bold block mb-1">
                      {msg.role === "bot" ? "면접관" : "지원자"}:
                    </span>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col space-y-6">
              <div className="flex flex-col md:flex-row space-y-3 md:space-y-0">
                <textarea
                  value={input}
                  placeholder="답변을 입력하세요..."
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 border border-indigo-200 dark:border-indigo-700 rounded-xl md:rounded-r-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-gray-200 resize-y min-h-[120px]"
                />
                <button
                  onClick={sendAnswer}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium px-6 py-4 rounded-xl md:rounded-l-none transition-colors shadow-lg shadow-indigo-500/20 md:w-28"
                >
                  전송
                </button>
              </div>

              <button
                onClick={evaluateInterview}
                disabled={isEvaluating}
                className={`${
                  isEvaluating
                    ? "bg-gray-400 dark:bg-gray-700"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 hover:from-indigo-700 hover:to-purple-700"
                } text-white font-medium py-3 px-8 rounded-full shadow-lg shadow-indigo-500/20 mx-auto transition-all flex items-center justify-center gap-2 max-w-md w-full`}
              >
                <svg
                  xmlns="https://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                면접 종료하고 평가 받기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
