"use client";

import { useEffect, useState } from "react";
import styles from "../../styles/admin/content.module.css";
import ContentDetailModal from "./modal/contentDetailModal";
import ContentEditModal from "./modal/contentEditModal";
import ContentDeleteModal from "./modal/contentDeleteModal";

const API_URL = "http://localhost:8080/api/v1/admin/study";

interface StudyContentDetailDto {
  id: number;
  firstCategory: string;
  secondCategory: string;
  title: string;
  body: string;
}

interface ContentProps {
  selectedFirstCategory: string | null;
  selectedSecondCategory: string | null;
}

export default function Content({ selectedFirstCategory, selectedSecondCategory }: ContentProps) {
  const [contents, setContents] = useState<StudyContentDetailDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedContent, setSelectedContent] = useState<StudyContentDetailDto | null>(null);
  const [editContent, setEditContent] = useState<StudyContentDetailDto | null>(null);
  const [deleteContent, setDeleteContent] = useState<StudyContentDetailDto | null>(null);

  useEffect(() => {
    if (!selectedFirstCategory) return;

    let url = `${API_URL}/category/${encodeURIComponent(selectedFirstCategory)}`;
    if (selectedSecondCategory) {
      url += `/${encodeURIComponent(selectedSecondCategory)}`;
    }
    url += `?page=${currentPage}&size=${pageSize}`;

    fetch(url, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("콘텐츠를 불러오는 데 실패했습니다.");
        return res.json();
      })
      .then((data) => {
        setContents(data.content as StudyContentDetailDto[]);
        setTotalPages(data.totalPages);
      })
      .catch((err) => setError(err.message));
  }, [selectedFirstCategory, selectedSecondCategory, currentPage, pageSize]);

  const handleUpdateContent = (updatedContent: StudyContentDetailDto) => {
    setContents((prevContents) =>
      prevContents.map((content) =>
        content.id === updatedContent.id ? updatedContent : content
      )
    );
    setSelectedContent(null);
  };

  const handleDeleteContent = (contentId: number) => {
    setContents((prevContents) => prevContents.filter((content) => content.id !== contentId));
    setDeleteContent(null);
  };

  return (
    <main className={styles.contentContainer}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul className={styles.contentList}>
        {contents.length > 0 ? (
          contents.map((content) => (
            <li key={content.id} className={styles.contentItem}>
              <div className={styles.titleContainer}>
                <span>{content.title}</span>
                <span className={styles.subTitle}>{content.secondCategory}</span>
              </div>

              <div className={styles.buttonGroup}>
                <button className={styles.detailButton} onClick={() => setSelectedContent(content)}>
                  상세 보기
                </button>
                <button className={styles.editButton} onClick={() => setEditContent(content)}>
                  수정
                </button>
                <button className={styles.deleteButton} onClick={() => setDeleteContent(content)}>
                  삭제
                </button>
              </div>
            </li>
          ))
        ) : (
          <p>콘텐츠가 없습니다.</p>
        )}
      </ul>

      <div className={styles.pagination}>
        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))} disabled={currentPage === 0}>
          ⬅
        </button>
        <span>{currentPage + 1} / {totalPages}</span>
        <button onClick={() => setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev))} disabled={currentPage === totalPages - 1}>
          ➡
        </button>
      </div>

      {selectedContent && (
        <ContentDetailModal content={selectedContent} onClose={() => setSelectedContent(null)} />
      )}

      {editContent && (
        <ContentEditModal
          content={editContent}
          onClose={() => setEditContent(null)}
          onUpdate={handleUpdateContent}
        />
      )}

      {deleteContent && (
        <ContentDeleteModal content={deleteContent} onClose={() => setDeleteContent(null)} onDelete={handleDeleteContent} />
      )}
    </main>
  );
}