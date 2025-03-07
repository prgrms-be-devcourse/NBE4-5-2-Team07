"use client";

import { useEffect, useState } from "react";
import styles from "../../styles/admin.module.css";

const API_URL = "http://localhost:8080/api/v1/admin/study";

export default function AdminContentPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // 카테고리 목록
  useEffect(() => {
    fetch(`${API_URL}/categories`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("카테고리 목록을 불러오지 못했습니다.");
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        if (data.length > 0) {
          // 첫 번째 카테고리를 기본 선택 값으로 설정
          setSelectedCategory(data[0]);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  // 카테고리 콘텐츠
  useEffect(() => {
    if (!selectedCategory) return;

    fetch(`${API_URL}?firstCategory=${selectedCategory}&page=${currentPage}&size=${pageSize}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("콘텐츠를 불러오는 데 실패했습니다.");
        return res.json();
      })
      .then((data) => {
        setContents(data.content);
        setTotalPages(data.totalPages); // 전체 페이지 수 저장
      })
      .catch((err) => setError(err.message));
  }, [selectedCategory, currentPage, pageSize]);

  // 수정 기능
  const handleEditClick = (content: any) => {
    setEditId(content.id);
    setEditTitle(content.title);
    setEditBody(content.body);
  };

  const handleSave = async () => {
    if (!editId) return;

    try {
      const res = await fetch(`${API_URL}/update/${editId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updateContent: editBody }),
      });

      if (!res.ok) throw new Error("수정 실패");

      setContents(
        contents.map((item) =>
          item.id === editId ? { ...item, title: editTitle, body: editBody } : item
        )
      );
      setEditId(null);
    } catch (err) {
      alert("수정에 실패했습니다.");
    }
  };

  // 삭제 기능
  const handleDeleteClick = async (id: number) => {
    if (!confirm("삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`${API_URL}/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("삭제 실패");

      setContents(contents.filter((item) => item.id !== id));
    } catch (err) {
      alert("삭제에 실패했습니다.");
    }
  };

  // 페이징 기능
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <ul>
          {categories.map((category) => (
            <li
              key={category}
              className={category === selectedCategory ? styles.active : ""}
              onClick={() => {
                setSelectedCategory(category);
                setCurrentPage(0); // 카테고리 변경 시 첫 페이지로 초기화
              }}
            >
              {category}
            </li>
          ))}
        </ul>
      </aside>

      <main className={styles.content}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <ul className={styles.contentList}>
          {contents.length > 0 ? (
            contents.map((content) => (
              <li key={content.id} className={styles.contentItem}>
                {editId === content.id ? (
                  <div className={styles.editContainer}>
                    <label>제목:</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className={styles.inputBox}
                    />

                    <label>내용:</label>
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      className={styles.textArea}
                    />

                    <div className={styles.buttonContainer}>
                      <button onClick={handleSave} className={styles.saveBtn}>
                        완료
                      </button>
                      <button onClick={() => setEditId(null)} className={styles.cancelBtn}>
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.titleContainer}>
                      <span>{content.title}</span>
                      <span className={styles.subTitle}>{content.secondCategory}</span>
                    </div>
                    <div className={styles.buttonContainer}>
                      <button className={styles.editBtn} onClick={() => handleEditClick(content)}>
                        수정
                      </button>
                      <button className={styles.deleteBtn} onClick={() => handleDeleteClick(content.id)}>
                        삭제
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))
          ) : (
            <p>콘텐츠가 없습니다.</p>
          )}
        </ul>

        <div className={styles.pagination}>
          <button onClick={goToPrevPage} disabled={currentPage === 0}>
            ⬅ 이전
          </button>
          <span>{currentPage + 1} / {totalPages}</span>
          <button onClick={goToNextPage} disabled={currentPage === totalPages - 1}>
            다음 ➡
          </button>
        </div>
      </main>
    </div>
  );
}
