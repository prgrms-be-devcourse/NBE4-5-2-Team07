"use client";

import { useEffect, useState } from "react";

const StudyContentCategory = ({
  onCategorySelect,
}: {
  onCategorySelect: (firstCategory: string, secondCategory: string) => void;
}) => {
  const [categories, setCategories] = useState<{ [key: string]: string[] }>({});
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 카테고리 리스트 가져오기
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8080/api/v1/study/all", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("카테고리 리스트를 받아오는데 실패했습니다.");
        }
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 서브 카테고리 드롭다운 열기/닫기 상태 관리
  const toggleCategory = (category: string) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
          학습자료
        </h2>
      </div>

      <div className="p-4 flex-grow">
        {loading ? (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 dark:text-red-400 text-sm p-3">
            {error}
          </div>
        ) : Object.keys(categories).length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-sm p-3">
            카테고리가 없습니다.
          </div>
        ) : (
          <ul className="space-y-2">
            {Object.entries(categories).map(
              ([firstCategory, subCategories]) => (
                <li key={firstCategory} className="mb-2">
                  <button
                    onClick={() => toggleCategory(firstCategory)}
                    className={`w-full text-left py-2 px-3 rounded-md flex justify-between items-center transition-colors ${
                      openCategory === firstCategory
                        ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span className="font-medium">{firstCategory}</span>
                    <svg
                      className={`h-4 w-4 transition-transform duration-200 ${
                        openCategory === firstCategory
                          ? "transform rotate-180"
                          : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* 서브 카테고리 드롭다운 - 스크롤 적용 */}
                  <div
                    className={`transition-all duration-300 ${
                      openCategory === firstCategory
                        ? "opacity-100 mt-1"
                        : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                  >
                    {/* 여기에 스크롤 적용 */}
                    <div
                      className={`overflow-y-auto pr-1 ${
                        openCategory === firstCategory
                          ? "max-h-64" // 최대 높이 제한 (필요에 따라 조정)
                          : ""
                      }`}
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "rgba(156, 163, 175, 0.5) transparent",
                      }}
                    >
                      <ul className="pl-4 pt-1 space-y-1">
                        {subCategories.map((secondCategory) => (
                          <li key={secondCategory}>
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                onCategorySelect(firstCategory, secondCategory);
                              }}
                              className="block py-2 px-3 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                            >
                              {secondCategory}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              )
            )}
          </ul>
        )}
      </div>

      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        <p>카테고리를 선택하여 학습을 시작하세요</p>
      </div>
    </div>
  );
};

export default StudyContentCategory;
