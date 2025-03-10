"use client";

import { useEffect, useState } from "react";
import styles from "../../styles/admin/content.module.css";
import InterviewDetailModal from "./modal/interviewDetailModal";
import InterviewEditModal from "./modal/interviewEditModal";
import InterviewDeleteModal from "./modal/interviewDeleteModal";

const API_URL = "http://localhost:8080/api/v1/admin/interview";

interface InterviewContentDetail {
  id: number;
  headId: number | null;
  tailId: number | null;
  isHead: boolean;
  hasTail: boolean;
  keyword: string;
  category: string;
  question: string;
  modelAnswer: string;
  likeCount: number;
}

interface ContentProps {
  selectedCategory: string | null;
  selectedKeyword: string | null;
}

export default function Content({ selectedCategory, selectedKeyword }: ContentProps) {
  const [interviewContents, setInterviewContents] = useState<InterviewContentDetail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInterview, setSelectedInterview] = useState<InterviewContentDetail | null>(null);
  const [editInterview, setEditInterview] = useState<InterviewContentDetail | null>(null);
  const [deleteInterview, setDeleteInterview] = useState<InterviewContentDetail | null>(null);

  useEffect(() => {
    if (!selectedCategory) return;

    let url = `${API_URL}/category/${encodeURIComponent(selectedCategory)}`;
    if (selectedKeyword) {
      url += `/${encodeURIComponent(selectedKeyword)}`;
    }
    url += `?page=${currentPage}&size=${pageSize}`;

    fetch(url, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("면접 질문을 불러오는 데 실패했습니다.");
        return res.json();
      })
      .then((data) => {
        console.log("Fetched Data:", data);
        setInterviewContents(data.content as InterviewContentDetail[]);
        setTotalPages(data.totalPages);
      })
      .catch((err) => {
        console.error("Error fetching interview content:", err);
        setError(err.message);
      });
  }, [selectedCategory, selectedKeyword, currentPage, pageSize]);

  const handleUpdateInterview = (updatedInterview: InterviewContentDetail) => {
    setInterviewContents((prevContents) =>
      prevContents.map((content) =>
        content.id === updatedInterview.id ? updatedInterview : content
      )
    );
    setSelectedInterview(null);
  };

  const handleDeleteInterview = (interviewId: number) => {
    setInterviewContents((prevContents) => prevContents.filter((content) => content.id !== interviewId));
    setDeleteInterview(null);
  };

  return (
    <main className={styles.contentContainer}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul className={styles.contentList}>
        {interviewContents.length > 0 ? (
          interviewContents.map((content) => (
            <li key={content.id} className={styles.contentItem}>
              <div className={styles.titleContainer}>
                <span>{content.question}</span>
                <span className={styles.subTitle}>{content.keyword}</span>
              </div>

              <div className={styles.buttonGroup}>
                <button className={styles.detailButton} onClick={() => setSelectedInterview(content)}>
                  상세 보기
                </button>
                <button className={styles.editButton} onClick={() => setEditInterview(content)}>
                  수정
                </button>
                <button className={styles.deleteButton} onClick={() => setDeleteInterview(content)}>
                  삭제
                </button>
              </div>
            </li>
          ))
        ) : (
          <p>면접 질문이 없습니다.</p>
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

      {selectedInterview && (
        <InterviewDetailModal
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
          onSelectInterview={(newInterview: any) => {
            if (!newInterview) return;

            // InterviewContentAdminResponseDto 타입의 데이터 처리
            const formattedInterview: InterviewContentDetail = {
              id: newInterview.id,
              headId: newInterview.headId ?? null,
              tailId: newInterview.tailId ?? null,
              isHead: newInterview.isHead ?? false,
              hasTail: newInterview.hasTail ?? false,
              keyword: newInterview.keyword ?? "",
              category: newInterview.category ?? "",
              question: newInterview.question ?? "",
              modelAnswer: newInterview.modelAnswer ?? "",
              likeCount: newInterview.likeCount ?? 0,
            };

            setSelectedInterview(formattedInterview);
          }}

        />
      )}

      {editInterview && (
        <InterviewEditModal
          interview={editInterview}
          onClose={() => setEditInterview(null)}
          onUpdate={handleUpdateInterview}
        />
      )}

      {deleteInterview && (
        <InterviewDeleteModal interview={deleteInterview} onClose={() => setDeleteInterview(null)} onDelete={handleDeleteInterview} />
      )}
    </main>
  );
}