"use client";

import React, { useEffect, useState } from "react";
import InterviewCreateModal from "./interviewCreateModal";

const API_URL = "http://localhost:8080/api/v1/admin/interview";

interface InterviewContent {
    id: number;
    question: string;
    category: string;
    keyword: string;
    modelAnswer: string;
}

interface InterviewDetailModalProps {
    interview: InterviewContent;
    onClose: () => void;
    onSelectInterview: (selectedInterview: InterviewContent) => void;
}

const InterviewDetailModal: React.FC<InterviewDetailModalProps> = ({ interview, onClose, onSelectInterview }) => {
    const [relatedQuestions, setRelatedQuestions] = useState<InterviewContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [historyStack, setHistoryStack] = useState<InterviewContent[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        const fetchRelatedQuestions = async () => {
            try {
                const response = await fetch(`${API_URL}/${interview.id}/related`, {
                    method: "GET",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                });

                if (!response.ok) {
                    throw new Error("꼬리 질문을 불러오는 데 실패했습니다.");
                }

                const data: InterviewContent[] = await response.json();
                console.log("Fetched Related Questions:", data);

                const filteredQuestions = data.filter(q => q.id !== interview.id);
                setRelatedQuestions(filteredQuestions);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRelatedQuestions();
    }, [interview.id]);

    const handleRelatedQuestionClick = async (questionId: number) => {
        try {
            const response = await fetch(`${API_URL}/${questionId}`, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("질문 데이터를 불러오는 데 실패했습니다.");
            }

            const newInterview: InterviewContent = await response.json();
            console.log("New Selected Interview:", newInterview);

            setHistoryStack((prevStack) => [...prevStack, interview]);
            onSelectInterview(newInterview);
        } catch (err) {
            console.error("Error fetching new interview:", err);
        }
    };

    const handleGoBack = () => {
        if (historyStack.length > 0) {
            const previousInterview = historyStack[historyStack.length - 1];
            setHistoryStack((prevStack) => prevStack.slice(0, -1));
            onSelectInterview(previousInterview);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-lg z-50 flex items-center justify-center">
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-xl w-full mx-4 overflow-hidden">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-32 h-32 rounded-full bg-blue-300 dark:bg-blue-800 opacity-20 blur-xl"></div>
                <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-32 h-32 rounded-full bg-indigo-300 dark:bg-indigo-800 opacity-20 blur-xl"></div>

                <div className="relative p-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-transparent bg-clip-text mb-2 text-center">{interview.question}</h2>
                    <p className="text-center text-gray-600 dark:text-gray-400 mb-4">{interview.category} / {interview.keyword}</p>

                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{interview.modelAnswer}</p>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">연관된 꼬리 질문</h3>
                    {loading ? (
                        <p className="text-center text-gray-600 dark:text-gray-400">로딩 중...</p>
                    ) : error ? (
                        <div className="mb-5 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                            <p>{error}</p>
                        </div>
                    ) : relatedQuestions.length > 0 ? (
                        <ul className="space-y-2 mb-6">
                            {relatedQuestions.map((q) => (
                                <li
                                    key={q.id}
                                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-all"
                                    onClick={() => handleRelatedQuestionClick(q.id)}
                                >
                                    {q.question}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center mb-6">
                            <p className="text-gray-600 dark:text-gray-400 mb-3">등록된 꼬리 질문이 없습니다.</p>
                            <button
                                className="rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-2 px-6 font-medium transition-all shadow-lg shadow-indigo-500/20"
                                onClick={() => setShowCreateModal(true)}
                            >
                                꼬리 질문 생성
                            </button>
                        </div>
                    )}

                    <div className="flex gap-3 mt-6">
                        <button
                            className={`rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-6 font-medium transition-all flex-1 ${historyStack.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={handleGoBack}
                            disabled={historyStack.length === 0}
                        >
                            뒤로가기
                        </button>
                        <button
                            className="rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-6 font-medium transition-all flex-1"
                            onClick={onClose}
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </div>

            {showCreateModal && (
                <InterviewCreateModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={(newInterview) => {
                        setRelatedQuestions((prev) => [
                            ...prev,
                            {
                                id: 0, // 임시 값
                                question: newInterview.question,
                                category: newInterview.category,
                                keyword: newInterview.keyword,
                                modelAnswer: newInterview.modelAnswer,
                            } as InterviewContent,
                        ]);
                        setShowCreateModal(false);
                    }}
                    headId={interview.id}
                />
            )}
        </div>
    );
};

export default InterviewDetailModal;