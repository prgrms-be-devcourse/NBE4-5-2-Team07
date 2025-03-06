"use client"; // 클라이언트 컴포넌트임을 명시

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "bot";
  text: string;
}

export default function TechInterviewChat() {
  const router = useRouter();
  // 메시지 기록, 사용자 입력, 인터뷰 주제 관리
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [interviewType, setInterviewType] = useState<"CS" | "프로젝트" | null>(
    null
  );
  // 평가 진행 상태 관리
  const [isEvaluating, setIsEvaluating] = useState(false);

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

  // 평가 요청: 평가 진행 중이면 알림, 아니면 평가 API 호출
  const evaluateInterview = async () => {
    if (isEvaluating) {
      alert("답변에 대해 AI 가 정리중입니다. 잠시만 기다려주세요.");
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
      <div className="flex items-center justify-center min-h-screen">
        {/* 폭을 50vw로 고정하고 중앙 정렬 */}
        <div className="bg-white rounded-xl shadow-md p-8 w-[50vw] text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            안녕하세요, 기술 면접을 담당하는 AI 면접관 입니다.
          </h1>
          <p className="text-gray-600 mb-6">
            아래 버튼에서 가상 인터뷰 주제를 선택해주세요.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => startInterview("CS")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm"
            >
              CS 지식 면접
            </button>
            <button
              onClick={() => startInterview("프로젝트")}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm"
            >
              프로젝트 경험 면접
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 인터뷰 진행 중 화면: 채팅 UI + 평가 버튼 추가
  return (
    <div className="min-h-screen flex flex-col items-center py-10">
      {/* 폭을 50vw로 고정 */}
      <div className="bg-white rounded-lg shadow-md w-[50vw] p-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          기술 면접 챗봇
        </h1>
        <div className="border border-gray-300 rounded-lg p-4 h-[500px] overflow-y-auto mb-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-2 flex ${
                msg.role === "bot" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg ${
                  msg.role === "bot"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                <span className="font-bold">
                  {msg.role === "bot" ? "면접관" : "지원자"}:
                </span>{" "}
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col space-y-4">
          <div className="flex">
            <textarea
              value={input}
              placeholder="답변을 입력하세요..."
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]"
            />
            <button
              onClick={sendAnswer}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 rounded-r-lg"
            >
              전송
            </button>
          </div>
          {/* 평가 버튼, 평가 진행 중일 때 disabled */}
          <button
            onClick={evaluateInterview}
            disabled={isEvaluating}
            className={`${
              isEvaluating ? "bg-red-300" : "bg-red-500 hover:bg-red-600"
            } text-white font-semibold py-2 px-6 rounded-lg shadow-sm mx-auto`}
          >
            면접 종료하고 평가 받기
          </button>
        </div>
      </div>
    </div>
  );
}
