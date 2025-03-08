"use client";

import styles from "../../../styles/admin/modal/contentDeleteModal.module.css";

const API_URL = "http://localhost:8080/api/v1/admin/study";

interface ContentDeleteModalProps {
  content: { id: number; title: string };
  onClose: () => void;
  onDelete: (contentId: number) => void;
}

export default function ContentDeleteModal({ content, onClose, onDelete }: ContentDeleteModalProps) {
  const handleDelete = async () => {
    try {
      console.log(`삭제 요청: ${API_URL}/${content.id}`);

      const response = await fetch(`${API_URL}/${content.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const responseText = await response.text();
      console.log("서버 응답:", responseText);

      if (!response.ok) {
        throw new Error(`삭제 실패: ${response.status} ${responseText}`);
      }

      onDelete(content.id);
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
        <p>"{content.title}"을(를) 삭제하시겠습니까?</p>
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