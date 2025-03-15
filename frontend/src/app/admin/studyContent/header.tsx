"use client";

import { useState } from "react";
import ContentCreateModal from "./modal/contentCreateModal";

export default function Header({
  onCreate,
}: {
  onCreate: (newContent: any) => void;
}) {
  const [selectedCreate, setSelectedCreate] = useState<boolean>(false);

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
        관리자 대시보드
      </h1>

      <button
        className="rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-2 px-6 font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
        onClick={() => setSelectedCreate(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        등록
      </button>

      {selectedCreate && (
        <ContentCreateModal
          onClose={() => setSelectedCreate(false)}
          onCreate={onCreate}
        />
      )}
    </div>
  );
}
