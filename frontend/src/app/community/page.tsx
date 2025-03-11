"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface PostListResponseDto {
  postId: number;
  title: string;
  author: string;
  createdAt: string;
}

type SortingType =
  | "title"
  | "likeDesc"
  | "likeAsc"
  | "commentDesc"
  | "commentAsc"
  | "createdAtDesc";

const sortingEndpoints: Record<SortingType, string> = {
  title: "/article/list/title",
  likeDesc: "/article/list/like/desc",
  likeAsc: "/article/list/like/asc",
  commentDesc: "/article/list/comment/desc",
  commentAsc: "/article/list/comment/asc",
  createdAtDesc: "/article/list/createdat/desc",
};

const CommunityListPage: React.FC = () => {
  const [posts, setPosts] = useState<PostListResponseDto[]>([]);
  const [sorting, setSorting] = useState<SortingType>("title");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const size = 10;

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/community${sortingEndpoints[sorting]}?page=${page}&size=${size}`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("게시글을 불러오는데 실패했습니다.");
      }
      const data = await response.json();
      setPosts(data.content || data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [sorting, page]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getSortingButtonClass = (sortType: SortingType) => {
    return sorting === sortType
      ? "bg-indigo-600 text-white"
      : "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700";
  };

  return (
    <div className="min-h-screen w-full max-w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 overflow-hidden relative">
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

      {/* 메인 컨텐츠 */}
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 md:p-10">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                커뮤니티 게시판
              </h1>
              <div className="h-1 w-24 bg-indigo-600 rounded"></div>
            </div>
            {/* 게시글 작성 버튼 */}
            <Link
              href="/community/write"
              className="rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-2 px-6 font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              게시글 작성
            </Link>
          </header>

          <div className="mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
              게시글 정렬
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                { type: "title", label: "제목순" },
                { type: "likeDesc", label: "좋아요 많은 순" },
                { type: "likeAsc", label: "좋아요 적은 순" },
                { type: "commentDesc", label: "댓글 많은 순" },
                { type: "commentAsc", label: "댓글 적은 순" },
                { type: "createdAtDesc", label: "최신순" },
              ].map(({ type, label }) => (
                <button
                  key={type}
                  className={`px-4 py-2 border border-indigo-600 rounded-full transition-all duration-200 text-sm font-medium ${getSortingButtonClass(
                    type as SortingType
                  )}`}
                  onClick={() => setSorting(type as SortingType)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
              <svg
                className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                게시글이 없습니다.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {posts.map((post) => (
                  <li
                    key={post.postId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <Link
                      href={`/community/${post.postId}`}
                      className="block p-5"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            {post.title}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center mr-4">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                ></path>
                              </svg>
                              {post.author}
                            </span>
                            <span className="inline-flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                ></path>
                              </svg>
                              {formatDate(post.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              className={`px-5 py-2 flex items-center rounded-full border transition-colors duration-200 ${
                page > 0
                  ? "border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700"
                  : "border-gray-300 text-gray-400 cursor-not-allowed"
              }`}
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
            >
              <svg
                className="w-5 h-5 mr-1"
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
              이전 페이지
            </button>
            <button
              className="px-5 py-2 flex items-center border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
              onClick={() => setPage(page + 1)}
            >
              다음 페이지
              <svg
                className="w-5 h-5 ml-1"
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
        </div>
      </div>
    </div>
  );
};

export default CommunityListPage;
