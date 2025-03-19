"use client";

import { useState } from "react";

const API_URL = "http://localhost:8080/api/v1/admin/interview";

interface InterviewDeleteModalProps {
    interview: { id: number; question: string };
    onClose: () => void;
    onDelete: (interviewId: number) => void;
}

export default function InterviewDeleteModal({ interview, onClose, onDelete }: InterviewDeleteModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log(`삭제 요청: ${API_URL}/${interview.id}`);

            const response = await fetch(`${API_URL}/${interview.id}`, {
                method: "DELETE",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error(`삭제 실패: ${response.status}`);
            }

            onDelete(interview.id);
            onClose();
        } catch (error: any) {
            console.error("삭제 오류:", error);
            setError(`삭제 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-lg z-50 flex items-center justify-center">
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-32 h-32 rounded-full bg-red-300 dark:bg-red-800 opacity-20 blur-xl"></div>
                <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-32 h-32 rounded-full bg-purple-300 dark:bg-purple-800 opacity-20 blur-xl"></div>

                <div className="relative p-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-purple-600 dark:from-red-400 dark:to-purple-400 text-transparent bg-clip-text mb-6 text-center">삭제 확인</h2>

                    {error && (
                        <div className="mb-5 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                            <p className="font-medium">오류</p>
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
                        <p className="text-gray-800 dark:text-gray-200 font-medium text-center break-words">
                            "{interview.question}"을(를) 삭제하시겠습니까?
                        </p>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-6 font-medium transition-all flex-1"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className={`rounded-full bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white py-2 px-6 font-medium transition-all flex-1 shadow-lg shadow-red-500/20 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                            {loading ? "삭제 중..." : "삭제"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}