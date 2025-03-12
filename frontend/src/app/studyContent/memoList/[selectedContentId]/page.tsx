"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type StudyMemoResponseDto = {
  memoId: number;
  memoContent: string;
  likeCount: number;
  createdAt?: string;
};

const MemoList = () => {
  const { selectedContentId } = useParams();
  const [memoList, setMemoList] = useState<StudyMemoResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemoList = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/v1/studyMemo/list/${selectedContentId}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok)
          throw new Error("메모 리스트를 불러오는 데 실패했습니다.");
        const data = await response.json();
        setMemoList(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMemoList();
  }, [selectedContentId]);

  const handleMemoLike = async (memoId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/studyMemo/like/${memoId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("좋아요를 추가하는 데 실패했습니다.");
      }

      const responseMessage = await response.text();
      if (responseMessage === "좋아요 추가") {
        setMemoList((prevMemoList) =>
          prevMemoList.map((memo) =>
            memo.memoId === memoId
              ? { ...memo, likeCount: memo.likeCount + 1 }
              : memo
          )
        );
      } else if (responseMessage === "좋아요 취소") {
        setMemoList((prevMemoList) =>
          prevMemoList.map((memo) =>
            memo.memoId === memoId
              ? { ...memo, likeCount: memo.likeCount - 1 }
              : memo
          )
        );
      }
    } catch (err: any) {
      console.error("좋아요 실패:", err.message);
    }
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* 배경 그라데이션만 유지 */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
        {/* 블러 배경 요소 */}
        <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-blue-300 dark:bg-blue-600 blur-3xl opacity-20"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-indigo-300 dark:bg-indigo-700 blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-purple-300 dark:bg-purple-700 blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text mb-8 text-center">
          공개 메모 리스트
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900 bg-opacity-50 dark:bg-opacity-50 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded mb-6">
            <p>{error}</p>
          </div>
        ) : memoList.length > 0 ? (
          <div className="space-y-4">
            {memoList.map((memo) => (
              <div
                key={memo.memoId}
                className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 rounded-xl shadow-lg p-6 transition-transform hover:scale-[1.01]"
              >
                <p className="text-gray-800 dark:text-gray-200 text-lg mb-4 whitespace-pre-wrap">
                  {memo.memoContent}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMemoLike(memo.memoId)}
                      className="flex items-center justify-center w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 rounded-full transition-colors p-2"
                    >
                      <span role="img" aria-label="heart" className="text-xl">
                        🧡
                      </span>
                    </button>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {memo.likeCount}
                    </span>
                  </div>

                  {memo.createdAt && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(memo.createdAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 rounded-xl shadow-lg p-10">
            <svg
              className="w-16 h-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              공개된 메모가 없습니다.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              다른 사용자들이 공개한 메모를 확인할 수 있습니다.
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 hover:bg-opacity-100 dark:hover:bg-opacity-100 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 font-medium shadow-lg transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoList;
