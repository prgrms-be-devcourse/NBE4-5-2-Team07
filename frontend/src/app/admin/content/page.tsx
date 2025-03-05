"use client";

import { useState } from "react";
import { categories, dummyContents } from "../dummyData";
import styles from "../../styles/admin.module.css";

export default function ContentPage() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [contents, setContents] = useState(dummyContents);
  const [editId, setEditId] = useState<number | null>(null);
  const [editFirstCategory, setEditFirstCategory] = useState("");
  const [editSecondCategory, setEditSecondCategory] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  // 콘텐츠 필터링 (카테고리 + 검색)
  const filteredContents = contents.filter(
    (item) =>
      (selectedCategory === "" || item.first_category === selectedCategory) &&
      (item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.second_category.toLowerCase().includes(search.toLowerCase()))
  );

  // 페이징 관련 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 한 페이지에 표시할 콘텐츠 개수

  // 페이징 처리
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredContents.slice(indexOfFirstItem, indexOfLastItem);

  // 페이지 변경 함수
  const totalPages = Math.ceil(filteredContents.length / itemsPerPage);
  const goToNextPage = () => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  const goToPrevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));

  // 수정 버튼 클릭 시 편집 모드 활성화
  const handleEditClick = (id: number, firstCategory: string, secondCategory: string, title: string, body: string) => {
    setEditId(id);
    setEditFirstCategory(firstCategory);
    setEditSecondCategory(secondCategory);
    setEditTitle(title);
    setEditBody(body);
  };

  // 수정 완료 시 데이터 반영 후 편집 모드 종료
  const handleSave = () => {
    setContents((prevContents) =>
      prevContents.map((item) =>
        item.id === editId
          ? {
              ...item,
              first_category: editFirstCategory,
              second_category: editSecondCategory,
              title: editTitle,
              body: editBody,
            }
          : item
      )
    );
    setEditId(null);
  };

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <ul>
          <li
            className={selectedCategory === "" ? styles.active : ""}
            onClick={() => setSelectedCategory("")}
          >
            All
          </li>
          {categories.map((category) => (
            <li
              key={category}
              className={category === selectedCategory ? styles.active : ""}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </li>
          ))}
        </ul>
      </aside>

      <main className={styles.content}>
        <input
          type="text"
          placeholder="검색어 입력 (제목 또는 카테고리)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchBox}
        />
        <ul className={styles.contentList}>
          {currentItems.map((content) => (
            <li key={content.id} className={styles.contentItem}>
              {editId === content.id ? (
                <div className={styles.editContainer}>
                  {/* 카테고리 선택 */}
                  <label>First Category:</label>
                  <select
                    value={editFirstCategory}
                    onChange={(e) => setEditFirstCategory(e.target.value)}
                    className={styles.selectBox}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <label>Second Category:</label>
                  <input
                    type="text"
                    value={editSecondCategory}
                    onChange={(e) => setEditSecondCategory(e.target.value)}
                    className={styles.inputBox}
                  />

                  <label>Title:</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={styles.inputBox}
                  />

                  <label>Body:</label>
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
                  <span>{content.title}</span>
                  <button
                    className={styles.editBtn}
                    onClick={() =>
                      handleEditClick(
                        content.id,
                        content.first_category,
                        content.second_category,
                        content.title,
                        content.body
                      )
                    }
                  >
                    수정
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>

        {/* 페이징 기능*/}
        <div className={styles.pagination}>
          <button onClick={goToPrevPage} disabled={currentPage === 1}>
            ⬅
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <button onClick={goToNextPage} disabled={currentPage === totalPages}>
            ➡
          </button>
        </div>
      </main>
    </div>
  );
}
