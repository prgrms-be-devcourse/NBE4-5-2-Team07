"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface ContentDetailModalProps {
  content: {
    title: string;
    firstCategory: string;
    secondCategory: string;
    body: string;
  };
  onClose: () => void;
}

const ContentDetailModal: React.FC<ContentDetailModalProps> = ({
  content,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden animation-fadeIn">
        {/* 배경 장식 효과 */}
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-blue-300 dark:bg-blue-800 opacity-20 blur-xl"></div>
        <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-24 h-24 rounded-full bg-green-300 dark:bg-green-800 opacity-20 blur-xl"></div>

        <div className="relative p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 text-center mb-2">
            {content.title}
          </h2>

          <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
            {content.firstCategory} / {content.secondCategory}
          </p>

          <div className="mb-6 text-gray-800 dark:text-gray-200 prose prose-indigo dark:prose-dark">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {content.body}
            </ReactMarkdown>
          </div>

          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-6 font-medium transition-all"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetailModal;
