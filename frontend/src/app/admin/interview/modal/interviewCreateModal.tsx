"use client";

import { useEffect, useState } from "react";
import styles from "../../../styles/admin/modal/contentEditModal.module.css";

const API_URL = "https://devapi.store/api/v1/admin/interview";

interface InterviewContentCreateDto {
  headId: number | null;
  category: string;
  keyword: string;
  question: string;
  modelAnswer: string;
}

interface InterviewCreateModalProps {
  onClose: () => void;
  onCreate: (newInterview: InterviewContentCreateDto) => void;
  headId: number | null;
}

export default function InterviewCreateModal({
  onClose,
  onCreate,
  headId,
}: InterviewCreateModalProps) {
  const [formData, setFormData] = useState<InterviewContentCreateDto>({
    headId,
    category: "",
    keyword: "",
    question: "",
    modelAnswer: "",
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/all`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        const categoryKeys = Object.keys(data);
        setCategories(categoryKeys);
        if (categoryKeys.length > 0) {
          setFormData((prev) => ({ ...prev, category: categoryKeys[0] }));
        }
      })
      .catch(() => setError("카테고리를 불러오는 데 실패했습니다."));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    if (
      !formData.category ||
      !formData.keyword ||
      !formData.question ||
      !formData.modelAnswer
    ) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("등록 실패");

      onCreate(formData);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>
          {headId ? "꼬리 질문 등록" : "면접 질문 등록"}
        </h2>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <label>카테고리:</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={styles.selectField}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <label>키워드:</label>
        <input
          type="text"
          name="keyword"
          value={formData.keyword}
          onChange={handleChange}
          className={styles.inputField}
        />

        <label>질문:</label>
        <input
          type="text"
          name="question"
          value={formData.question}
          onChange={handleChange}
          className={styles.inputField}
        />

        <label>모범 답안:</label>
        <textarea
          name="modelAnswer"
          value={formData.modelAnswer}
          onChange={handleChange}
          className={styles.textareaField}
          rows={5}
        />

        <div className={styles.buttonGroup}>
          <button
            onClick={handleCreate}
            disabled={loading}
            className={styles.saveButton}
          >
            {loading ? "등록 중..." : "등록"}
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
