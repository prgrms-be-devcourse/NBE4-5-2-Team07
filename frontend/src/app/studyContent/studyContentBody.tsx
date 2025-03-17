"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";

const DEFAULT_CATEGORY = {
  firstCategory: "OperatingSystem",
  secondCategory: "운영체제란?",
};

const StudyContentBody = ({ selectedCategory }: { selectedCategory: any }) => {
  const [memo, setMemo] = useState<string | "">("");
  const [selectedContentId, setSelectedContentId] = useState<bigint | null>(
    null
  );
  const [category, setCategory] = useState(
    selectedCategory || DEFAULT_CATEGORY
  );
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [studyContents, setStudyContents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    if (selectedCategory) {
      setCategory(selectedCategory);
      setPage(0);
    } else {
      setCategory(DEFAULT_CATEGORY);
      setPage(0);
    }
  }, [selectedCategory]);

  useEffect(() => {
    const fetchStudyContents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://devapi.store/api/v1/study/${category.firstCategory}/${category.secondCategory}?page=${page}&size=1`
        );
        const data = await response.json();
        setStudyContents(data.content);
        setSelectedContentId(data.content[0]?.id || null);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError("데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudyContents();
  }, [category, page]);

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handlePreviousPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleMemoChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMemo(event.target.value);
  };

  const handleGetMemoList = async () => {
    router.push(`studyContent/memoList/${selectedContentId}`);
  };

  const handlePublishedChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsPublished(event.target.checked);
  };

  const handleMemoCheck = async () => {
    try {
      const response = await fetch(
        `https://devapi.store/api/v1/studyMemo/${selectedContentId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          alert("로그인 후 이용해주세요.");
          router.push("https://chilldevprep.vercel.app/login");
          return;
        }
      }
      const data = await response.json();
      if (data.memoContent) {
        setIsPublished(data.isPublished ?? true);
        setMemo(data.memoContent);
      } else {
        alert("메모가 없습니다.");
      }
    } catch (error) {
      console.error("사용자 정보를 가져오는 데 실패했습니다:", error);
      return null;
    }
  };

  const handleMemoCreate = async () => {
    try {
      const response = await fetch(
        `https://devapi.store/api/v1/studyMemo/create/${selectedContentId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: memo,
            isPublished: isPublished,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          alert("로그인 후 이용해주세요.");
          router.push("https://chilldevprep.vercel.app/login");
          return;
        }
      }
      if (response.ok) {
        alert("메모가 저장되었습니다.");
        setMemo("");
      }
    } catch (error) {
      alert("서버와 연결할 수 없습니다.");
    }
  };

  return (
    // 이 div에서 배경 gradient 제거
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 relative">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-blue-300 dark:bg-blue-600 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-indigo-300 dark:bg-indigo-700 blur-3xl"></div>
      </div>

      {/* Code particles decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
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
              ][Math.floor(Math.random() * 5)]
            }
          </div>
        ))}
      </div>

      {/* Main container */}
      <div className="max-w-7xl mx-auto relative z-10">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded mb-6">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Content Header */}
            <div className="mb-6 border-b border-indigo-100 dark:border-indigo-800 pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                  <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">
                    {category.firstCategory}
                  </div>
                  <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text">
                    {category.secondCategory}
                  </h2>
                </div>
                <div className="flex items-center mt-4 sm:mt-0 self-end sm:self-auto rounded-lg p-1">
                  <button
                    onClick={handlePreviousPage}
                    disabled={page === 0}
                    className={`px-3 py-1 rounded-md text-sm font-medium mr-2 ${
                      page === 0
                        ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                        : "text-gray-700 dark:text-gray-200 hover:bg-indigo-100/50 dark:hover:bg-indigo-800/50"
                    }`}
                  >
                    이전
                  </button>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={page === totalPages - 1 || totalPages === 0}
                    className={`px-3 py-1 rounded-md text-sm font-medium ml-2 ${
                      page === totalPages - 1 || totalPages === 0
                        ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                        : "text-gray-700 dark:text-gray-200 hover:bg-indigo-100/50 dark:hover:bg-indigo-800/50"
                    }`}
                  >
                    다음
                  </button>
                </div>
              </div>
            </div>

            {/* Study Contents */}
            <div className="mb-8">
              {studyContents.length > 0 ? (
                studyContents.map((content: any, index: number) => (
                  <div key={index} className="mb-8">
                    <input type="hidden" value={content.id} />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                      {content.title}
                    </h3>
                    <div className="prose prose-indigo dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content.body.replace(/<br\s*\/?>/gi, "")}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    결과가 없습니다.
                  </p>
                </div>
              )}
            </div>

            {/* Memo Section */}
            <div className="border border-indigo-100 dark:border-indigo-800 rounded-xl">
              <div className="flex justify-between items-center px-6 py-4 border-b border-indigo-100 dark:border-indigo-800 rounded-t-xl">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  나의 메모
                </h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="shareMemo"
                    name="shareMemo"
                    checked={isPublished}
                    onChange={handlePublishedChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="shareMemo"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-200"
                  >
                    공개
                  </label>
                </div>
              </div>
              <div className="p-6">
                <textarea
                  className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 border border-indigo-100 dark:border-indigo-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[150px]"
                  placeholder="메모를 입력하세요..."
                  value={memo}
                  onChange={handleMemoChange}
                ></textarea>
                <div className="flex flex-wrap gap-2 justify-end mt-4">
                  <button
                    onClick={handleMemoCreate}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium text-sm shadow-lg shadow-indigo-500/20 transition-colors"
                  >
                    저장
                  </button>
                  <button
                    onClick={handleMemoCheck}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 font-medium text-sm shadow-lg transition-colors"
                  >
                    나의 메모 조회
                  </button>
                  <button
                    onClick={handleGetMemoList}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 font-medium text-sm shadow-lg transition-colors"
                  >
                    메모 참고하기
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudyContentBody;
