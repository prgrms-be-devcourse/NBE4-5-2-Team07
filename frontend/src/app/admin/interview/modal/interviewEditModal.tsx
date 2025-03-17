"use client";

import { useEffect, useState } from "react";
import styles from "../../../styles/admin/modal/contentEditModal.module.css";

const API_URL = "https://devapi.store/api/v1/admin/interview";

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

export default function InterviewEditModal({
  interview,
  onClose,
  onUpdate,
}: InterviewEditModalProps) {
  const [category, setCategory] = useState(interview.category);
  const [keyword, setKeyword] = useState(interview.keyword);
  const [question, setQuestion] = useState(interview.question);
  const [modelAnswer, setModelAnswer] = useState(interview.modelAnswer);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // 기존 카테고리 목록 불러오기
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

        if (!category && categoryKeys.length > 0) {
          setCategory(categoryKeys[0]);
        }
      })
      .catch(() => {
        setError("카테고리를 불러오는 데 실패했습니다.");
      });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    const updatedData = {
      category,
      keyword,
      question,
      modelAnswer,
    };

    try {
      const response = await fetch(`${API_URL}/${interview.id}`, {
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
        throw new Error(
          responseData.message || responseData || "수정에 실패했습니다."
        );
      }

      const updatedInterview = {
        ...interview,
        category,
        keyword,
        question,
        modelAnswer,
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
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>면접 질문 수정</h2>
        {error && <p className={styles.errorMessage}>{error}</p>}

        <label>카테고리:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={styles.selectField}
        >
          {categories.length > 0 ? (
            categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))
          ) : (
            <option disabled>카테고리를 불러오는 중...</option>
          )}
        </select>

        <label>키워드:</label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className={styles.inputField}
        />

        <label>질문:</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className={styles.inputField}
        />

        <label>모범 답안:</label>
        <textarea
          value={modelAnswer}
          onChange={(e) => setModelAnswer(e.target.value)}
          className={styles.textareaField}
          rows={5}
        />

        <div className={styles.buttonGroup}>
          <button
            onClick={handleSave}
            disabled={loading}
            className={styles.saveButton}
          >
            {loading ? "저장 중..." : "저장"}
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
