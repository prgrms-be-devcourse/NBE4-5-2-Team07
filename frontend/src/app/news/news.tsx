"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const News = () => {
    const [content, setContent] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchContent = async (page: number) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/v1/news?keyWord=IT%20OR%20기술%20OR%20인공지능&page=${page}&limit=5`, {
                method: "GET",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
            });

            const data = await response.json();

            if (data.items && data.items.length > 0) {
                setContent(data.items);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContent(currentPage);
    }, [currentPage]);

    const loadMore = () => {
        if (hasMore && !loading) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    return (
        <div>
            <div className="mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                    </div>
                ) : content.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
                        <p className="text-lg font-medium text-gray-600 dark:text-gray-400">뉴스가 없습니다.</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {content.map((item, index) => (
                                <li key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="block p-5">
                                        <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                                {item.title}
                                            </ReactMarkdown>
                                        </h3>
                                        <p>{item.description}</p>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="flex justify-between mt-6">
                <button
                    className={`px-5 py-2 flex items-center rounded-full border transition-colors duration-200 ${currentPage > 1 ? "border-indigo-600 text-indigo-600" : "border-gray-300 text-gray-400 cursor-not-allowed"}`}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    이전 페이지
                </button>
                <button
                    className="px-5 py-2 flex items-center border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                    onClick={loadMore}
                    disabled={!hasMore || loading}
                >
                    다음 페이지
                </button>
            </div>
        </div>

    );
};

export default News;
