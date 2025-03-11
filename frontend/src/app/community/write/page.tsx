"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface AddPostRequestDto {
  title: string;
  content: string;
}

const CommunityWritePage: React.FC = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!title.trim() || !content.trim()) {
      setErrorMsg("제목과 내용을 모두 입력해주세요.");
      return;
    }
    setLoading(true);
    const dto: AddPostRequestDto = { title, content };

    try {
      const response = await fetch(
        "http://localhost:8080/community/article/post",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(dto),
        }
      );
      if (!response.ok) {
        throw new Error("게시글 작성에 실패했습니다.");
      }
      const data = await response.json();
      // 작성 완료 후, 해당 게시글 상세 페이지로 이동
      router.push(`/community/${data.id}`);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[1200px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">게시글 작성</h1>
      {errorMsg && (
        <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          {errorMsg}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="title"
          >
            제목
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="제목을 입력하세요."
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="content"
          >
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="내용을 입력하세요."
            rows={8}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
              loading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "작성 중..." : "작성"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommunityWritePage;
