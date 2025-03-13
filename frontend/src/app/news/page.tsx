"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw"; // HTML 처리 플러그인

const News = () => {
    const [content, setContent] = useState<any[]>([]); // 콘텐츠를 저장할 상태
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태
    const [loading, setLoading] = useState(false); // 로딩 상태
    const [hasMore, setHasMore] = useState(true); // 더 많은 데이터가 있는지 여부

    // 페이지가 변경될 때마다 데이터를 요청
    const fetchContent = async (page: number) => {
        setLoading(true);
        try {
            // 페이지와 함께 한 번에 가져올 아이템 개수 설정 (최소 1개, 최대 10개)
            const response = await fetch(`http://localhost:8080/api/v1/news?keyWord=IT%20OR%20기술%20OR%20인공지능&page=${page}&limit=5`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {"Content-Type": "application/json"},
                });

            // 응답을 JSON으로 변환
            const data = await response.json();
            console.log(data);

            // 응답에서 아이템이 있다면 기존 콘텐츠를 덮어씀
            if (data.items && data.items.length > 0) {
                setContent(data.items); // 기존 데이터 무시하고 새로운 데이터로 설정
            } else {
                setHasMore(false); // 더 이상 데이터가 없으면 hasMore를 false로 설정
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // 페이지가 바뀔 때마다 fetchContent 호출
    useEffect(() => {
        fetchContent(currentPage); // 페이지가 바뀔 때마다 새로운 데이터를 요청
    }, [currentPage]);

    // 'Load More' 버튼을 클릭하면 페이지 증가
    const loadMore = () => {
        if (hasMore && !loading) {
            setCurrentPage(prevPage => prevPage + 1); // 페이지를 증가시켜서 더 많은 데이터 요청
        }
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 overflow-hidden relative">
            {/* 배경 장식 요소 */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                <div
                    className="absolute top-10 right-20 w-64 h-64 rounded-full bg-blue-300 dark:bg-blue-600 blur-3xl"></div>
                <div
                    className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-indigo-300 dark:bg-indigo-700 blur-3xl"></div>
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-purple-300 dark:bg-purple-700 blur-3xl"></div>
            </div>

            {/* 코드 파티클 배경 */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                {Array.from({length: 20}).map((_, i) => (
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
                                IT 뉴스
                            </h1>
                            <div className="h-1 w-24 bg-indigo-600 rounded"></div>
                        </div>
                    </header>

                    <div className="mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div
                                    className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                            </div>
                        ) : content.length === 0 ? (
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
                                    뉴스가 없습니다.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {content.map((item, index) => (
                                        <li key={index}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                            <a
                                                href={item.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block p-5"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                            <ReactMarkdown
                                                                remarkPlugins={[remarkGfm]}
                                                                rehypePlugins={[rehypeRaw]}
                                                            >
                                                                {item.title}
                                                            </ReactMarkdown>
                                                        </h3>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                            {new Date(item.pubDate).toLocaleString()}
                                                        </div>
                                                        <div className="prose prose-indigo dark:prose-invert max-w-none">
                                                            <ReactMarkdown
                                                                remarkPlugins={[remarkGfm]}
                                                                rehypePlugins={[rehypeRaw]}
                                                            >
                                                                {item.description}
                                                            </ReactMarkdown>
                                                        </div>
                                                    </div>
                                                </div>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between mt-6">
                        <button
                            className={`px-5 py-2 flex items-center rounded-full border transition-colors duration-200 ${currentPage > 1 ? "border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700" : "border-gray-300 text-gray-400 cursor-not-allowed"}`}
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
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
                            onClick={loadMore}
                            disabled={!hasMore || loading}
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
export default News;
