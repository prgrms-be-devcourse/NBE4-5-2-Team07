"use client";

import React, { useEffect, useState } from "react";
import styles from "../../../styles/admin/modal/contentDetailModal.module.css";

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
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>{interview.question}</h2>
                <p className={styles.modalCategory}>{interview.category} / {interview.keyword}</p>
                <p className={styles.modalBody}>{interview.modelAnswer}</p>

                <h3 className={styles.relatedTitle}>연관된 꼬리 질문</h3>
                {loading ? (
                    <p>로딩 중...</p>
                ) : error ? (
                    <p className={styles.error}>{error}</p>
                ) : relatedQuestions.length > 0 ? (
                    <ul className={styles.relatedList}>
                        {relatedQuestions.map((q) => (
                            <li
                                key={q.id}
                                className={styles.relatedItem}
                                onClick={() => handleRelatedQuestionClick(q.id)}
                            >
                                {q.question}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>연관된 꼬리 질문이 없습니다.</p>
                )}

                <div className={styles.modalFooter}>
                    <button
                        className={styles.backButton}
                        onClick={handleGoBack}
                        disabled={historyStack.length === 0}
                    >
                        뒤로가기
                    </button>

                    <button className={styles.closeButton} onClick={onClose}>
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InterviewDetailModal;
