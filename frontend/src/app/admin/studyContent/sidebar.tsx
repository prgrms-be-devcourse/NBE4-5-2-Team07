"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api/v1/admin/study";

interface SidebarProps {
  selectedFirstCategory: string | null;
  setSelectedFirstCategory: (category: string) => void;
  selectedSecondCategory: string | null;
  setSelectedSecondCategory: (category: string | null) => void;
}

export default function Sidebar({
  selectedFirstCategory,
  setSelectedFirstCategory,
  selectedSecondCategory,
  setSelectedSecondCategory,
}: SidebarProps) {
  const [categories, setCategories] = useState<{ [key: string]: string[] }>({});
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/all`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("카테고리 목록을 불러오지 못했습니다.");
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        const firstCategoryKeys = Object.keys(data);
        if (firstCategoryKeys.length > 0 && !selectedFirstCategory) {
          setSelectedFirstCategory(firstCategoryKeys[0]);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <aside className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 h-auto min-h-full">
      <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text mb-6">
        카테고리
      </h3>

      <div className="space-y-2">
        {Object.keys(categories).map((firstCategory) => (
          <div key={firstCategory} className="mb-2">
            <button
              className={`w-full text-left px-4 py-3 rounded-lg flex justify-between items-center transition-colors ${firstCategory === selectedFirstCategory
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              onClick={() => {
                if (openCategory === firstCategory) {
                  setOpenCategory(null);
                } else {
                  setSelectedFirstCategory(firstCategory);
                  setSelectedSecondCategory(null);
                  setOpenCategory(firstCategory);
                }
              }}
            >
              <span className="font-medium">{firstCategory}</span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${openCategory === firstCategory ? "rotate-180" : "rotate-0"
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>


            {openCategory === firstCategory &&
              categories[firstCategory].length > 0 && (
                <div className="mt-2 ml-4 space-y-1 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 transition-all duration-300">
                  {categories[firstCategory].map((secondCategory) => (
                    <button
                      key={secondCategory}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${secondCategory === selectedSecondCategory &&
                        firstCategory === selectedFirstCategory
                        ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      onClick={() => setSelectedSecondCategory(secondCategory)}
                    >
                      {secondCategory}
                    </button>
                  ))}
                </div>
              )}
          </div>
        ))}

        {Object.keys(categories).length === 0 && (
          <div className="py-8 text-center">
            <svg
              className="w-12 h-12 text-indigo-300 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              ></path>
            </svg>
            <p className="text-gray-500 dark:text-gray-400">로딩 중입니다...</p>
          </div>
        )}
      </div>
    </aside>
  );
}