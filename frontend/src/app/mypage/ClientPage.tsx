"use client";

import React, { useEffect, useState } from "react";
import styles from "../styles/mypage.module.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Note {
  contentId: number;
  question: string;
  answer: string;
}

interface Comment {
  commentId: number;
  comment: string;
  interviewContentId: number;
  interviewContentTitle: string;
  category: string;
  public: boolean;
  modelAnswer: String;
}

interface Memo {
  memoId: number;
  memoContent: string;
  firstCategory: string;
  title: string;
  body: string;
}

interface InterviewData {
  [category: string]: Comment[];
}

interface MemoData {
  [category: string]: Memo[];
}

const ClientPage = () => {
  const [showNoteList, setShowNoteList] = useState(false);
  const [memoDropdownOpen, setMemoDropdownOpen] = useState(false);
  const [answerDropdownOpen, setAnswerDropdownOpen] = useState(false);
  const [selectedMemoCategory, setSelectedMemoCategory] = useState("");
  const [selectedAnswerCategory, setSelectedAnswerCategory] = useState("");
  const [selectedNoteItem, setSelectedNoteItem] = useState<Note | null>(null);
  const [selectedCommentItem, setSelectedCommentItem] =
    useState<Comment | null>(null);
  const [selectedMemoItem, setSelectedMemoItem] = useState<Memo | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [interviewData, setInterviewData] = useState<InterviewData>({});
  const [updatedComment, setUpdatedComment] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [memoData, setMemoData] = useState<MemoData>({});
  const [updatedMemo, setUpdatedMemo] = useState("");

  const memoCategory = [
    "컴퓨터구조",
    "자료구조",
    "운영체제",
    "데이터베이스",
    "네트워크",
    "소프트웨어엔지니어링",
    "웹",
  ];
  const answerCategory = ["데이터베이스", "네트워크", "운영체제", "스프링"];

  {
    /* 노트 API 연동 */
  }
  const fetchNoteList = async () => {
    try {
      const response = await fetch(`http://localhost:8080/interview/bookmark`, {
        method: "GET",
        credentials: "include",
      });

      const responseData = await response.json();

      console.log(responseData);

      if (!responseData || responseData.length === 0) {
        console.log("No Notes available.");
        setNotes([]);
        return;
      }

      setNotes(responseData);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const deleteNote = async () => {
    if (!selectedNoteItem) return;

    const isConfirmed = window.confirm("해당 노트를 삭제하시겠습니까?");
    if (!isConfirmed) return;

    try {
      const response = await fetch(
        `http://localhost:8080/interview/bookmark/${selectedNoteItem?.contentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        setSelectedNoteItem(null);
        alert("노트가 삭제되었습니다.");
        window.location.reload();
      } else {
        console.error("노트 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("노트 삭제 중 오류가 발생했습니다.", error);
    }
  };

  {
    /* 기술면접 API 연동 */
  }
  const fetchInterviewComment = async (category: string) => {
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
    }
  };

  const updateComment = async () => {
    if (!selectedCommentItem) return;

    const isConfirmed = window.confirm("해당 답변을 수정하시겠습니까?");
    if (!isConfirmed) return;

    const updatedDto = {
      comment: updatedComment,
      isPublic: isPublic,
      interviewContentId: selectedCommentItem.interviewContentId,
    };

    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/interview/comment/${selectedCommentItem.commentId}`,
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
          const updatedCategory = selectedCommentItem.category;

          updatedInterviewData[updatedCategory] = updatedInterviewData[
            updatedCategory
          ].map((comment) =>
            comment.commentId === selectedCommentItem.commentId
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
    if (!selectedCommentItem) return;

    const isConfirmed = window.confirm("해당 답변을 삭제하시겠습니까?");
    if (!isConfirmed) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/interview/comment/${selectedCommentItem.commentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        setInterviewData((prevData) => {
          const updatedInterviewData = { ...prevData };
          const updatedCategory = selectedCommentItem.category;
          updatedInterviewData[updatedCategory] = updatedInterviewData[
            updatedCategory
          ].filter(
            (comment) => comment.commentId !== selectedCommentItem.commentId
          );
          return updatedInterviewData;
        });

        setSelectedCommentItem(null);
        alert("댓글이 삭제되었습니다.");
        window.location.reload();
      } else {
        console.error("댓글 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 삭제 중 오류가 발생했습니다.", error);
    }
  };

  {
    /* 메모 API 연동 */
  }
  const fetchStudyMemo = async (category: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/studyMemo?category=${category}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const responseData = await response.json();

      if (!responseData || responseData.length === 0) {
        console.log("No memos available for this category.");
      }

      const updatedCategoryItems = responseData.reduce(
        (acc: MemoData, memo: Memo) => {
          const memoCategory = memo.firstCategory;
          if (!acc[memoCategory]) {
            acc[memoCategory] = [];
          }
          acc[memoCategory].push(memo);
          return acc;
        },
        {}
      );

      setMemoData(updatedCategoryItems);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const updateMemo = async () => {
    if (!selectedMemoItem) return;

    const isConfirmed = window.confirm("해당 메모를 수정하시겠습니까?");
    if (!isConfirmed) return;

    const updatedDto = {
      memoContent: updatedMemo,
      memoId: selectedMemoItem.memoId,
    };

    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/studyMemo/${selectedMemoItem.memoId}`,
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

        setMemoData((prevData) => {
          const updatedMemoData = { ...prevData };
          const updatedCategory = selectedMemoItem.firstCategory;

          updatedMemoData[updatedCategory] = updatedMemoData[
            updatedCategory
          ].map((memo) =>
            memo.memoId === selectedMemoItem.memoId
              ? {
                  ...memo,
                  memoContent: updatedData.memoContent,
                }
              : memo
          );
          return updatedMemoData;
        });

        alert("메모가 수정되었습니다.");
        window.location.reload();
      } else {
        console.error("메모 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("메모 수정 중 오류가 발생했습니다.", error);
    }
  };

  const deleteMemo = async () => {
    if (!selectedMemoItem) return;

    const isConfirmed = window.confirm("해당 메모를 삭제하시겠습니까?");
    if (!isConfirmed) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/studyMemo/${selectedMemoItem.memoId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        setMemoData((prevData) => {
          const updatedMemoData = { ...prevData };
          const updatedCategory = selectedMemoItem.firstCategory;
          updatedMemoData[updatedCategory] = updatedMemoData[
            updatedCategory
          ].filter((memo) => memo.memoId !== selectedMemoItem.memoId);
          return updatedMemoData;
        });

        setSelectedMemoItem(null);
        alert("메모가 삭제되었습니다.");
        window.location.reload();
      } else {
        console.error("메모 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("메모 삭제 중 오류가 발생했습니다.", error);
    }
  };

  {
    /* 핸들러 */
  }
  const handleNoteItemSelect = (note: Note) => {
    setSelectedNoteItem(note);
    setSelectedCommentItem(null);
    setSelectedMemoItem(null);
  };

  const handleShowNoteList = () => {
    if (!showNoteList) {
      setShowNoteList(true);
      setSelectedAnswerCategory("");
      setSelectedMemoCategory("");
    }
  };

  const handleDeleteNote = () => {
    deleteNote();
  };

  const handleMemoCategorySelect = (category: string) => {
    setSelectedMemoCategory(category);
    setSelectedAnswerCategory("");
    setSelectedCommentItem(null);
    setSelectedMemoItem(null);
    setShowNoteList(false);

    fetchStudyMemo(category);
  };

  const handleAnswerCategorySelect = (category: string) => {
    setSelectedAnswerCategory(category);
    setSelectedMemoCategory("");
    setSelectedCommentItem(null);
    setSelectedMemoItem(null);
    setShowNoteList(false);

    fetchInterviewComment(category);
  };

  const handleCommentItemSelect = (comment: Comment) => {
    setSelectedNoteItem(null);
    setSelectedMemoItem(null);
    setSelectedCommentItem(comment);
    setUpdatedComment(comment.comment);
    setIsPublic(comment.public);
  };

  const handleUpdateComment = () => {
    updateComment();
  };

  const handleDeleteComment = () => {
    deleteComment();
  };

  const handleMemoItemSelect = (memo: Memo) => {
    setSelectedNoteItem(null);
    setSelectedCommentItem(null);
    setSelectedMemoItem(memo);
    setUpdatedMemo(memo.memoContent);
  };

  const handleUpdateMemo = () => {
    updateMemo();
  };

  const handleDeleteMemo = () => {
    deleteMemo();
  };

  useEffect(() => {
    if (showNoteList) {
      fetchNoteList();
    }
  }, [showNoteList]);

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${styles.small}`}>
        {/* 내 노트 버튼 */}
        <button
          className={`${styles.btn} ${showNoteList ? styles.selectedBtn : ""}`}
          onClick={() => {
            handleShowNoteList();
            fetchNoteList();
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
            {memoCategory.map((category, index) => (
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
              {notes.map((note) => (
                <li
                  key={note.contentId}
                  onClick={() => handleNoteItemSelect(note)}
                  className={`${styles.listItem} ${
                    selectedNoteItem?.contentId === note.contentId
                      ? styles.selected
                      : ""
                  }`}
                >
                  {note.question}
                </li>
              ))}
            </ul>
          ) : /* 기술 면접 답변 목록 */
          selectedAnswerCategory && interviewData[selectedAnswerCategory] ? (
            interviewData[selectedAnswerCategory].map((comment) => (
              <li
                key={comment.commentId}
                onClick={() => handleCommentItemSelect(comment)}
                className={`${styles.listItem} ${
                  selectedCommentItem?.commentId === comment.commentId
                    ? styles.selected
                    : ""
                }`}
              >
                {comment.interviewContentTitle}
              </li>
            ))
          ) : /* 학습 메모 목록 */
          selectedMemoCategory && memoData[selectedMemoCategory] ? (
            memoData[selectedMemoCategory].map((memo) => (
              <li
                key={memo.memoId}
                onClick={() => handleMemoItemSelect(memo)}
                className={`${styles.listItem} ${
                  selectedMemoItem?.memoId === memo.memoId
                    ? styles.selected
                    : ""
                }`}
              >
                {memo.title}
              </li>
            ))
          ) : (
            <p className={styles.noItems}>항목이 없습니다.</p>
          )}
        </ul>
      </div>
      {/* 상세 내용 */}
      <div className={`${styles.card} ${styles.large}`}>
        {selectedNoteItem ? (
          <>
            <div className={styles.largeText}>
              <strong>{selectedNoteItem.question}</strong>
              <button
                className={styles.noteDeleteButton}
                onClick={handleDeleteNote}
              >
                내 노트에서 삭제
              </button>
            </div>
            <br />
            <div className={styles.text}>{selectedNoteItem.answer}</div>
          </>
        ) : selectedCommentItem ? (
          <>
            <strong className={styles.largeText}>
              {selectedCommentItem.interviewContentTitle}
            </strong>
            <br />
            <div className={styles.text}>{selectedCommentItem.modelAnswer}</div>
            <br />
            <div className={styles.bottom}>
              <strong className={styles.text}>내 답변</strong>
              <input
                type="checkbox"
                checked={isPublic}
                className={styles.checkbox}
                onChange={() => setIsPublic((prev) => !prev)}
              />
              <label className={styles.label}>공개</label>
              {selectedCommentItem && (
                <span className={styles.actionButtons}>
                  <button
                    className={styles.updateButton}
                    onClick={handleUpdateComment}
                  >
                    수정
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={handleDeleteComment}
                  >
                    삭제
                  </button>
                </span>
              )}
              <textarea
                value={updatedComment}
                onChange={(e) => setUpdatedComment(e.target.value)}
                rows={5}
                className={styles.textarea}
              />
            </div>
            <br />
          </>
        ) : selectedMemoItem ? (
          <>
            <strong className={styles.largeText}>
              {selectedMemoItem.title}
            </strong>
            <br />
            <span className={styles.text}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedMemoItem.body.replace(/<br\s*\/?>/gi, "")}
              </ReactMarkdown>
            </span>
            <br />
            <div className={styles.bottom}>
              {selectedMemoItem && (
                <div>
                  <strong className={styles.text}>내 메모</strong>
                  <span className={styles.actionButtons}>
                    <button
                      className={styles.updateButton}
                      onClick={handleUpdateMemo}
                    >
                      수정
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={handleDeleteMemo}
                    >
                      삭제
                    </button>
                  </span>
                  <textarea
                    value={updatedMemo}
                    onChange={(e) => setUpdatedMemo(e.target.value)}
                    rows={5}
                    className={styles.textarea}
                  />
                </div>
              )}
            </div>
            <br />
          </>
        ) : null}
      </div>{" "}
    </div>
  );
};

export default ClientPage;
