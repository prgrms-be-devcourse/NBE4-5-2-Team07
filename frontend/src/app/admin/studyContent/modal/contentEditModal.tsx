"use client";

import { useEffect, useState } from "react";
import styles from "../../../styles/admin/modal/contentEditModal.module.css";

const API_URL = "http://localhost:8080/api/v1/admin/study";

interface StudyContentDetailDto {
  id: number;
  firstCategory: string;
  secondCategory: string;
  title: string;
  body: string;
}

interface StudyContentUpdateRequestDto {
  title: string;
  firstCategory: string;
  secondCategory: string;
  updateContent: string;
}

interface ContentEditModalProps {
  content: StudyContentDetailDto;
  onClose: () => void;
  onUpdate: (updatedContent: StudyContentDetailDto) => void;
}

export default function ContentEditModal({ content, onClose, onUpdate }: ContentEditModalProps) {
  const [title, setTitle] = useState(content.title);
  const [firstCategory, setFirstCategory] = useState(content.firstCategory);
  const [secondCategory, setSecondCategory] = useState(content.secondCategory);
  const [updateContent, setUpdateContent] = useState(content.body);
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
        const firstKeys = Object.keys(data);
        setCategories(firstKeys);

        if (!firstCategory && firstKeys.length > 0) {
          setFirstCategory(firstKeys[0]);
        }
      })
      .catch(() => {
        setError("카테고리를 불러오는 데 실패했습니다.");
      });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    const updatedData: StudyContentUpdateRequestDto = {
      title: title.trim() !== "" ? title : content.title,
      firstCategory,
      secondCategory,
      updateContent,
    };

    try {
      const response = await fetch(`${API_URL}/${content.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
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

      const updatedContent: StudyContentDetailDto = {
        id: content.id,
        firstCategory,
        secondCategory,
        title,
        body: updateContent,
      };

      onUpdate(updatedContent);
      onClose();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>학습 콘텐츠 수정</h2>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <label>제목:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.inputField}
        />

        <label>첫 번째 카테고리:</label>
        <select
          value={firstCategory}
          onChange={(e) => setFirstCategory(e.target.value)}
          className={styles.selectField}
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

        <label>두 번째 카테고리:</label>
        <input
          type="text"
          value={secondCategory}
          onChange={(e) => setSecondCategory(e.target.value)}
          className={styles.inputField}
          placeholder="새로운 카테고리를 입력하세요"
        />

        <label>내용:</label>
        <textarea
          value={updateContent}
          onChange={(e) => setUpdateContent(e.target.value)}
          className={styles.textareaField}
          rows={5}
        />

        <div className={styles.buttonGroup}>
          <button onClick={handleSave} disabled={loading} className={styles.saveButton}>
            {loading ? "저장 중..." : "저장"}
          </button>
          <button onClick={onClose} className={styles.cancelButton}>취소</button>
        </div>
      </div>
    </div>
  );
}