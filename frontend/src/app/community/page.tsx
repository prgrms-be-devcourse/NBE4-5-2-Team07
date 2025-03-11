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
      ? "bg-blue-600 text-white"
      : "bg-white text-blue-600 hover:bg-blue-50";
  };

  return (
    <div className="w-[1200px] mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          커뮤니티 게시판
        </h1>
        <div className="h-1 w-24 bg-blue-600 rounded"></div>
      </header>

      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-700 mb-3">게시글 정렬</h2>
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 border border-blue-600 rounded-md transition-colors duration-200 text-sm font-medium ${getSortingButtonClass(
              "title"
            )}`}
            onClick={() => setSorting("title")}
          >
            제목순
          </button>
          <button
            className={`px-4 py-2 border border-blue-600 rounded-md transition-colors duration-200 text-sm font-medium ${getSortingButtonClass(
              "likeDesc"
            )}`}
            onClick={() => setSorting("likeDesc")}
          >
            좋아요 많은 순
          </button>
          <button
            className={`px-4 py-2 border border-blue-600 rounded-md transition-colors duration-200 text-sm font-medium ${getSortingButtonClass(
              "likeAsc"
            )}`}
            onClick={() => setSorting("likeAsc")}
          >
            좋아요 적은 순
          </button>
          <button
            className={`px-4 py-2 border border-blue-600 rounded-md transition-colors duration-200 text-sm font-medium ${getSortingButtonClass(
              "commentDesc"
            )}`}
            onClick={() => setSorting("commentDesc")}
          >
            댓글 많은 순
          </button>
          <button
            className={`px-4 py-2 border border-blue-600 rounded-md transition-colors duration-200 text-sm font-medium ${getSortingButtonClass(
              "commentAsc"
            )}`}
            onClick={() => setSorting("commentAsc")}
          >
            댓글 적은 순
          </button>
          <button
            className={`px-4 py-2 border border-blue-600 rounded-md transition-colors duration-200 text-sm font-medium ${getSortingButtonClass(
              "createdAtDesc"
            )}`}
            onClick={() => setSorting("createdAtDesc")}
          >
            최신순
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
          <p className="text-lg font-medium text-gray-600">
            게시글이 없습니다.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {posts.map((post) => (
              <li
                key={post.postId}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <Link href={`/community/${post.postId}`} className="block p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-medium text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
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
          className={`px-5 py-2 flex items-center rounded-md border text-sm font-medium transition-colors duration-200 ${
            page > 0
              ? "border-blue-600 text-blue-600 hover:bg-blue-50"
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
          className="px-5 py-2 flex items-center border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-md text-sm font-medium transition-colors duration-200"
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
  );
};

export default CommunityListPage;
