"use client";

import { useEffect, useState } from "react";
import styles from "../../../styles/admin/modal/contentEditModal.module.css";

const API_URL = "http://localhost:8080/api/v1/admin/study";

interface StudyContentCreateRequestDto {
    firstCategory: string;
    secondCategory: string;
    title: string;
    body: string;
}

interface ContentCreateModalProps {
    onClose: () => void;
    onCreate: (newContent: StudyContentCreateRequestDto) => void;
}

export default function ContentCreateModal({ onClose, onCreate }: ContentCreateModalProps) {
    const [formData, setFormData] = useState<StudyContentCreateRequestDto>({
        firstCategory: "",
        secondCategory: "",
        title: "",
        body: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        fetch(`${API_URL}/all`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`서버 오류 발생: ${res.status} - ${errorText}`);
                }
                return res.json();
            })
            .then((data) => {
                const firstKeys = Object.keys(data);
                setCategories(firstKeys);
                if (firstKeys.length > 0) {
                    setFormData((prev) => ({ ...prev, firstCategory: firstKeys[0] }));
                }
            })
            .catch((err) => {
                console.error("카테고리를 불러오는 데 실패했습니다:", err);
                setError("카테고리를 불러오는 데 실패했습니다.");
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreate = async () => {
        if (!formData.firstCategory || !formData.secondCategory || !formData.title || !formData.body) {
            setError("모든 필드를 입력해주세요.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`등록 실패: ${response.status} - ${errorText}`);
            }

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
                <h2 className={styles.modalTitle}>학습 콘텐츠 등록</h2>

                {error && <p className={styles.errorMessage}>{error}</p>}

                <label>제목:</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={styles.inputField}
                />

                <label>첫 번째 카테고리:</label>
                <select
                    name="firstCategory"
                    value={formData.firstCategory}
                    onChange={handleChange}
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
                    name="secondCategory"
                    value={formData.secondCategory}
                    onChange={handleChange}
                    className={styles.inputField}
                    placeholder="새로운 카테고리를 입력하세요"
                />

                <label>내용:</label>
                <textarea
                    name="body"
                    value={formData.body}
                    onChange={handleChange}
                    className={styles.textareaField}
                    rows={5}
                />

                <div className={styles.buttonGroup}>
                    <button onClick={handleCreate} disabled={loading} className={styles.saveButton}>
                        {loading ? "등록 중..." : "등록"}
                    </button>
                    <button onClick={onClose} className={styles.cancelButton}>취소</button>
                </div>
            </div>
        </div>
    );
}