"use client";

import { useState } from "react";
import Jobs from "./jobs";  // 채용공고 컴포넌트
import News from "./news";  // IT 뉴스 컴포넌트

const Page = () => {
    const [selectedTab, setSelectedTab] = useState<"news" | "jobs">("news");

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 overflow-hidden relative">
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
                                {selectedTab === "news" ? "IT 뉴스 목록" : "채용 공고 목록"}
                            </h1>
                            <div className="h-1 w-24 bg-indigo-600 rounded"></div>
                        </div>
                    </header>

                    {/* 탭 버튼들 */}
                    <div className="flex mb-6 space-x-4">
                        <button
                            className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                                selectedTab === "news"
                                    ? "bg-blue-500 text-white shadow-lg"
                                    : "bg-gray-200 text-gray-800 hover:bg-blue-50"
                            }`}
                            onClick={() => setSelectedTab("news")}
                        >
                            IT 뉴스
                        </button>
                        <button
                            className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                                selectedTab === "jobs"
                                    ? "bg-blue-500 text-white shadow-lg"
                                    : "bg-gray-200 text-gray-800 hover:bg-blue-50"
                            }`}
                            onClick={() => setSelectedTab("jobs")}
                        >
                            채용공고
                        </button>
                    </div>

                    {/* 선택된 탭에 맞는 컴포넌트 표시 */}
                    {selectedTab === "news" ? <News /> : <Jobs />}
                </div>
            </div>
        </div>
    );
};

export default Page;
