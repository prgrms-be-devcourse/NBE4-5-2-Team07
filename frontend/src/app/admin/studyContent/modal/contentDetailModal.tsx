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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-lg z-50 flex items-center justify-center">
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-32 h-32 rounded-full bg-blue-300 dark:bg-blue-800 opacity-20 blur-xl"></div>
        <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-32 h-32 rounded-full bg-indigo-300 dark:bg-indigo-800 opacity-20 blur-xl"></div>

        <div className="relative p-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-transparent bg-clip-text mb-2 text-center">{content.title}</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-4">{content.firstCategory} / {content.secondCategory}</p>

          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6 prose prose-indigo dark:prose-dark max-h-100 overflow-y-auto">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {content.body}
            </ReactMarkdown>
          </div>

          <div className="flex justify-center mt-6">
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