"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EvaluationPage() {
  const router = useRouter();
  const [evaluation, setEvaluation] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const result = localStorage.getItem("evaluationResult");
      console.log("evaluationResult:", result);
      if (result) {
        setEvaluation(result);
        localStorage.removeItem("evaluationResult");
      } else {
        router.push("/api/techInterview");
      }
    }, 300); // 300ms 정도 딜레이
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          면접 평가 결과
        </h1>
        <div className="border border-gray-300 rounded-lg p-4 h-[500px] overflow-y-auto bg-gray-50">
          <pre className="whitespace-pre-wrap text-gray-700">{evaluation}</pre>
        </div>
        <button
          onClick={() => router.push("/api/techInterview")}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md mx-auto mt-4"
        >
          다시 면접하기
        </button>
      </div>
    </div>
  );
}
