"use client";

import React, { useEffect, useState } from "react";
import styles from "../styles/mypage.module.css";

interface Comment {
  commentId: number;
  comment: string;
  interviewContentId: number;
  interviewContentTitle: string;
  category: string;
  public: boolean;
}

interface InterviewData {
  [category: string]: Comment[];
}

const ClientPage = () => {
  const [showNoteList, setShowNoteList] = useState(false);
  const [memoDropdownOpen, setMemoDropdownOpen] = useState(false);
  const [answerDropdownOpen, setAnswerDropdownOpen] = useState(false);
  const [selectedNoteCategory, setSelectedNoteCategory] = useState("");
  const [selectedMemoCategory, setSelectedMemoCategory] = useState("");
  const [selectedAnswerCategory, setSelectedAnswerCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState<Comment | null>(null);
  const [selectedNote, setSelectedNote] = useState("");
  const [details, setDetails] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [interviewData, setInterviewData] = useState<InterviewData>({});
  const [updatedComment, setUpdatedComment] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const notes = ["노트1", "노트2", "노트3", "노트4", "노트5", "노트6"];
  const memos = [
    "Computer Architecture",
    "Data Structure",
    "Operating System",
    "Database",
    "Network",
    "Software Engineering",
  ];
  const answerCategory = ["데이터베이스", "네트워크", "운영체제", "스프링"];

  const fetchInterviewComment = async (category: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/interview/comment?category=${category}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const responseData = await response.json();

      if (!responseData || responseData.length === 0) {
        console.log("No comments available for this category.");
      }

      const updatedCategoryItems = responseData.reduce(
        (acc: InterviewData, comment: Comment) => {
          const commentCategory = comment.category;
          if (!acc[commentCategory]) {
            acc[commentCategory] = [];
          }
          acc[commentCategory].push(comment);
          return acc;
        },
        {}
      );

      setInterviewData(updatedCategoryItems);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateComment = async () => {
    if (!selectedItem) return;

    const isConfirmed = window.confirm("해당 답변을 수정하시겠습니까?");
    if (!isConfirmed) return;

    const updatedDto = {
      comment: updatedComment,
      isPublic: isPublic,
      interviewContentId: selectedItem.interviewContentId,
    };

    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/interview/comment/${selectedItem.commentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedDto),
          credentials: "include",
        }
      );

      if (response.ok) {
        const updatedData = await response.json();

        setInterviewData((prevData) => {
          const updatedInterviewData = { ...prevData };
          const updatedCategory = selectedItem.category;

          updatedInterviewData[updatedCategory] = updatedInterviewData[
            updatedCategory
          ].map((comment) =>
            comment.commentId === selectedItem.commentId
              ? {
                  ...comment,
                  comment: updatedData.comment,
                  public: updatedData.isPublic,
                }
              : comment
          );
          return updatedInterviewData;
        });

        alert("댓글이 수정되었습니다.");
        window.location.reload();
      } else {
        console.error("댓글 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 수정 중 오류가 발생했습니다.", error);
    }
  };

  const deleteComment = async () => {
    if (!selectedItem) return;

    const isConfirmed = window.confirm("해당 답변을 삭제하시겠습니까?");
    if (!isConfirmed) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/interview/comment/${selectedItem.commentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        setInterviewData((prevData) => {
          const updatedInterviewData = { ...prevData };
          const updatedCategory = selectedItem.category;
          updatedInterviewData[updatedCategory] = updatedInterviewData[
            updatedCategory
          ].filter((comment) => comment.commentId !== selectedItem.commentId);
          return updatedInterviewData;
        });

        setSelectedItem(null);
        setDetails("");
        alert("댓글이 삭제되었습니다.");
        window.location.reload();
      } else {
        console.error("댓글 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 삭제 중 오류가 발생했습니다.", error);
    }
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleNoteCategorySelect = (category: string) => {
    setSelectedNoteCategory(category);
    setSelectedAnswerCategory("");
    setSelectedMemoCategory("");
    setSelectedItem(null);
    setDetails("");
    setSelectedNote(category);
  };

  const handleMemoCategorySelect = (category: string) => {
    setSelectedMemoCategory(category);
    setSelectedNoteCategory("");
    setSelectedAnswerCategory("");
    setSelectedItem(null);
    setDetails("");
    setShowNoteList(false);
  };

  const handleAnswerCategorySelect = (category: string) => {
    setSelectedAnswerCategory(category);
    setSelectedMemoCategory("");
    setSelectedNoteCategory("");
    setSelectedItem(null);
    setDetails("");
    setShowNoteList(false);

    fetchInterviewComment(category);
  };

  const handleItemSelect = (comment: Comment) => {
    setSelectedItem(comment);
    setDetails(
      `Title: ${comment.interviewContentTitle} \nComment: ${comment.comment}`
    );
    setUpdatedComment(comment.comment);
    setIsPublic(comment.public);
  };

  const handleUpdate = () => {
    updateComment();
  };

  const handleDelete = () => {
    deleteComment();
  };

  const selectedCategory =
    selectedMemoCategory || selectedAnswerCategory || selectedNoteCategory;

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${styles.small}`}>
        {/* 내 노트 버튼 */}
        <button
          className={styles.btn}
          onClick={() => {
            setShowNoteList((prevState) => !prevState);
            setSelectedNoteCategory("");
          }}
        >
          내 노트
        </button>

        {/* 학습 메모 드롭다운 */}
        <button
          className={styles.btn}
          onClick={() => setMemoDropdownOpen((prevState) => !prevState)}
        >
          작성한 학습 메모 {memoDropdownOpen ? "▲" : "▼"}
        </button>
        {memoDropdownOpen && (
          <ul className={`${styles.dropdownList} ${styles.small}`}>
            {memos.map((category, index) => (
              <li
                key={index}
                onClick={() => handleMemoCategorySelect(category)}
                className={`${styles.dropdownItem} ${
                  selectedMemoCategory === category ? styles.selected : ""
                }`}
              >
                {category}
              </li>
            ))}
          </ul>
        )}

        {/* 기술 면접 답변 드롭다운 */}
        <button
          className={styles.btn}
          onClick={() => setAnswerDropdownOpen((prevState) => !prevState)}
        >
          작성한 기술 면접 답변 {answerDropdownOpen ? "▲" : "▼"}
        </button>
        {answerDropdownOpen && (
          <ul className={`${styles.dropdownList} ${styles.small}`}>
            {answerCategory.map((category, index) => (
              <li
                key={index}
                onClick={() => handleAnswerCategorySelect(category)}
                className={`${styles.dropdownItem} ${
                  selectedAnswerCategory === category ? styles.selected : ""
                }`}
              >
                {category}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 선택한 카테고리의 아이템 목록 */}
      <div className={`${styles.card} ${styles.small}`}>
        <ul>
          {/* 내 노트 목록 */}
          {showNoteList ? (
            <ul>
              {notes.map((category, index) => (
                <li
                  key={index}
                  onClick={() => handleNoteCategorySelect(category)}
                  className={`${styles.dropdownItem} ${
                    selectedNoteCategory === category ? styles.selected : ""
                  }`}
                >
                  {category}
                </li>
              ))}
            </ul>
          ) : // 선택한 카테고리의 아이템 목록
          selectedCategory && interviewData[selectedCategory] ? (
            interviewData[selectedCategory].map((comment, index) => (
              <li
                key={index}
                onClick={() => handleItemSelect(comment)}
                className={`${styles.listItem} ${
                  selectedItem?.commentId === comment.commentId
                    ? styles.selected
                    : ""
                }`}
              >
                {comment.interviewContentTitle}
              </li>
            ))
          ) : (
            <p className={styles.noItems}>항목이 없습니다.</p>
          )}
        </ul>
      </div>

      {/* 상세 내용 */}
      <div className={`${styles.card} ${styles.large}`}>
        <p className={styles.noItems}>
          {selectedItem ? (
            <>
              <strong>Title:</strong> {selectedItem.interviewContentTitle}
              <br />
              <strong>Comment:</strong>
              <textarea
                value={updatedComment}
                onChange={(e) => setUpdatedComment(e.target.value)}
                rows={4}
                className={styles.textarea}
              />
              <br />
              <label>
                공개 여부:
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={() => setIsPublic((prev) => !prev)}
                />
              </label>
            </>
          ) : (
            "항목을 선택하세요."
          )}
        </p>

        {/* 수정 삭제 버튼 */}
        {selectedItem && (
          <div className={styles.actionButtons}>
            <button className={styles.updateButton} onClick={handleUpdate}>
              수정
            </button>
            <button className={styles.deleteButton} onClick={handleDelete}>
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientPage;
