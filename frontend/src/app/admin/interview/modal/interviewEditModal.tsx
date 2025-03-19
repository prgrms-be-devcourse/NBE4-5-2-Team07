"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api/v1/admin/interview";

interface InterviewEditModalProps {
    interview: {
        id: number;
        category: string;
        keyword: string;
        question: string;
        modelAnswer: string;
    };
    onClose: () => void;
    onUpdate: (updatedInterview: any) => void;
}

export default function InterviewEditModal({ interview, onClose, onUpdate }: InterviewEditModalProps) {
    const [formData, setFormData] = useState({
        category: interview.category,
        keyword: interview.keyword,
        question: interview.question,
        modelAnswer: interview.modelAnswer
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        fetch(`${API_URL}/all`, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error(`서버 오류 발생: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                const categoryKeys = Object.keys(data);
                setCategories(categoryKeys);

                if (!formData.category && categoryKeys.length > 0) {
                    setFormData(prev => ({ ...prev, category: categoryKeys[0] }));
                }
            })
            .catch(() => {
                setError("카테고리를 불러오는 데 실패했습니다.");
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!formData.category || !formData.keyword || !formData.question || !formData.modelAnswer) {
            setError("모든 필드를 입력해주세요.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/${interview.id}`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            let responseData;
            const responseText = await response.text();

            try {
                responseData = JSON.parse(responseText);
            } catch (error) {
                responseData = responseText;
            }

            if (!response.ok) {
                throw new Error(responseData.message || responseData || "수정에 실패했습니다.");
            }

            const updatedInterview = {
                ...interview,
                ...formData
            };

            onUpdate(updatedInterview);
            onClose();
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-lg z-50 flex items-center justify-center">
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-32 h-32 rounded-full bg-yellow-300 dark:bg-yellow-800 opacity-20 blur-xl"></div>
                <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-32 h-32 rounded-full bg-green-300 dark:bg-green-800 opacity-20 blur-xl"></div>

                <div className="relative p-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-green-600 dark:from-yellow-400 dark:to-green-400 text-transparent bg-clip-text mb-6 text-center">면접 질문 수정</h2>

                    {error && (
                        <div className="mb-5 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                            <p className="font-medium">오류</p>
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">질문</label>
                            <input
                                type="text"
                                name="question"
                                value={formData.question}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
                                placeholder="질문을 입력하세요"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                                카테고리
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white appearance-none bg-no-repeat bg-right"
                                style={{
                                    backgroundImage:
                                        "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                                    backgroundSize: "1.5em 1.5em",
                                    paddingRight: "2.5rem",
                                }}
                            >
                                {categories.length > 0 ? (
                                    categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>카테고리를 불러오는 중...</option>
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                                키워드
                            </label>
                            <input
                                type="text"
                                name="keyword"
                                value={formData.keyword}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
                                placeholder="키워드를 입력하세요"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                                모범 답안
                            </label>
                            <textarea
                                name="modelAnswer"
                                value={formData.modelAnswer}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white resize-none min-h-[150px]"
                                placeholder="답안을 입력하세요"
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className={`rounded-full bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white py-2 px-6 font-medium transition-all flex-1 shadow-lg shadow-yellow-500/20 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                {loading ? "저장 중..." : "저장"}
                            </button>
                            <button
                                onClick={onClose}
                                className="rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-6 font-medium transition-all flex-1"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}