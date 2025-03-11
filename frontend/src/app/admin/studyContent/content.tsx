"use client";

import { useEffect, useState } from "react";
import ContentDetailModal from "./modal/contentDetailModal";
import ContentEditModal from "./modal/contentEditModal";
import ContentDeleteModal from "./modal/contentDeleteModal";

const API_URL = "http://localhost:8080/api/v1/admin/study";

interface StudyContentDetailDto {
  id: number;
  firstCategory: string;
  secondCategory: string;
  title: string;
  body: string;
}

interface ContentProps {
  selectedFirstCategory: string | null;
  selectedSecondCategory: string | null;
}

export default function Content({
  selectedFirstCategory,
  selectedSecondCategory,
}: ContentProps) {
  const [contents, setContents] = useState<StudyContentDetailDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedContent, setSelectedContent] =
    useState<StudyContentDetailDto | null>(null);
  const [editContent, setEditContent] = useState<StudyContentDetailDto | null>(
    null
  );
  const [deleteContent, setDeleteContent] =
    useState<StudyContentDetailDto | null>(null);

  useEffect(() => {
    if (!selectedFirstCategory) {
      setContents([]);
      return;
    }

    let url = `${API_URL}/category/${encodeURIComponent(
      selectedFirstCategory
    )}`;
    if (selectedSecondCategory) {
      url += `/${encodeURIComponent(selectedSecondCategory)}`;
    }
    url += `?page=${currentPage}&size=${pageSize}`;

    fetch(url, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("콘텐츠를 불러오는 데 실패했습니다.");
        return res.json();
      })
      .then((data) => {
        setContents(data.content as StudyContentDetailDto[]);
        setTotalPages(data.totalPages);
      })
      .catch((err) => {
        console.error("콘텐츠 불러오기 실패:", err);
        setError(err.message);
      });
  }, [selectedFirstCategory, selectedSecondCategory, currentPage, pageSize]);

  const handleUpdateContent = (updatedContent: StudyContentDetailDto) => {
    setContents((prevContents) =>
      prevContents.map((content) =>
        content.id === updatedContent.id ? updatedContent : content
      )
    );
    setSelectedContent(null);
  };

  const handleDeleteContent = (contentId: number) => {
    setContents((prevContents) =>
      prevContents.filter((content) => content.id !== contentId)
    );
    setDeleteContent(null);
  };

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 relative z-10">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text mb-8">
          {selectedFirstCategory
            ? `${selectedFirstCategory}${
                selectedSecondCategory ? ` > ${selectedSecondCategory}` : ""
              }`
            : "콘텐츠 관리"}
        </h2>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-md">
            <p className="font-bold">오류</p>
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-8">
          {contents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((content) => (
                <div
                  key={content.id}
                  className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1 truncate">
                      {content.title}
                    </h3>
                    <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                      {content.secondCategory}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedContent(content)}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm shadow-indigo-500/20 transition-colors flex-1"
                    >
                      상세 보기
                    </button>
                    <button
                      onClick={() => setEditContent(content)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => setDeleteContent(content)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg
                className="w-16 h-16 text-indigo-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {selectedFirstCategory
                  ? "선택한 카테고리에 콘텐츠가 없습니다."
                  : "카테고리를 선택해주세요."}
              </p>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {contents.length > 0 && (
          <div className="flex justify-center items-center space-x-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentPage === 0
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800"
              } transition-colors`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
            </button>

            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {currentPage + 1} / {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  prev < totalPages - 1 ? prev + 1 : prev
                )
              }
              disabled={currentPage === totalPages - 1}
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentPage === totalPages - 1
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800"
              } transition-colors`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>
          </div>
        )}
      </main>

      {/* 모달 */}
      {selectedContent && (
        <ContentDetailModal
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
        />
      )}

      {editContent && (
        <ContentEditModal
          content={editContent}
          onClose={() => setEditContent(null)}
          onUpdate={handleUpdateContent}
        />
      )}

      {deleteContent && (
        <ContentDeleteModal
          content={deleteContent}
          onClose={() => setDeleteContent(null)}
          onDelete={handleDeleteContent}
        />
      )}
    </div>
  );
}
