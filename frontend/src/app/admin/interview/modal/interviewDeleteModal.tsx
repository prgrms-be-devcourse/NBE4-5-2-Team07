"use client";

import styles from "../../../styles/admin/modal/contentDeleteModal.module.css";

const API_URL = "http://localhost:8080/api/v1/admin/interview";

interface InterviewDeleteModalProps {
    interview: { id: number; question: string };
    onClose: () => void;
    onDelete: (interviewId: number) => void;
}

export default function InterviewDeleteModal({ interview, onClose, onDelete }: InterviewDeleteModalProps) {
    const handleDelete = async () => {
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
            alert(`삭제 중 오류가 발생했습니다: ${error.message}`);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>삭제 확인</h2>
                <p>
                    "{interview.question}"을(를) 삭제하시겠습니까?
                </p>
                <div className={styles.buttonGroup}>
                    <button onClick={handleDelete} className={styles.deleteButton}>
                        삭제
                    </button>
                    <button onClick={onClose} className={styles.cancelButton}>
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
}