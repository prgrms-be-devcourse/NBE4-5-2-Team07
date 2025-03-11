"use client";

import React, { useEffect, useState, CSSProperties } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { components } from "@/lib/backend/apiV1/schema";

type Note = components["schemas"]["BookmarkResponseDto"];
type Comment = components["schemas"]["MyPageInterviewCommentResponseDto"];
type Memo = components["schemas"]["StudyMemoResponseDto"];

interface InterviewData {
  [category: string]: Comment[];
}

interface MemoData {
  [category: string]: Memo[];
}

interface PostListResponseDto {
  postId: number;
  title: string;
  author: string;
  createdAt: string;
}

interface PostResponseDto {
  id: number;
  authorName: string;
  postTime: string;
  title: string;
  content: string;
  like: number;
  comments: any[];
}

const ClientPage = () => {
  const [showNoteList, setShowNoteList] = useState(false);
  const [showPostList, setShowPostList] = useState(false);
  const [memoDropdownOpen, setMemoDropdownOpen] = useState(false);
  const [answerDropdownOpen, setAnswerDropdownOpen] = useState(false);
  const [selectedMemoCategory, setSelectedMemoCategory] = useState("");
  const [selectedCommentCategory, setSelectedCommentCategory] = useState("");
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

  // New states for My Posts functionality
  const [myPosts, setMyPosts] = useState<PostListResponseDto[]>([]);
  const [selectedPostItem, setSelectedPostItem] =
    useState<PostResponseDto | null>(null);
  const [editingPost, setEditingPost] = useState(false);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editPostContent, setEditPostContent] = useState("");

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

  // API functions remain unchanged
  const fetchNoteList = async () => {
    try {
      const response = await fetch(`http://localhost:8080/interview/bookmark`, {
        method: "GET",
        credentials: "include",
      });

      const responseData: Note[] = await response.json();

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
        `http://localhost:8080/interview/bookmark/${selectedNoteItem.contentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.error("노트 삭제에 실패했습니다.");
      }

      setSelectedNoteItem(null);
      alert("노트가 삭제되었습니다.");
      window.location.reload();
    } catch (error) {
      console.error("노트 삭제 중 오류가 발생했습니다.", error);
    }
  };

  const fetchStudyMemo = async (category: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/studyMemo?category=${category}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const responseData: Memo[] = await response.json();

      if (!responseData || responseData.length === 0) {
        console.log("No memos available for this category.");
      }

      const updatedCategoryItems = responseData.reduce(
        (acc: MemoData, memo: Memo) => {
          const memoCategory = memo.firstCategory as string;
          if (!acc[memoCategory]) acc[memoCategory] = [];
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

      if (!response.ok) {
        console.error("메모 수정에 실패했습니다.");
        return;
      }

      const updatedData = await response.json();
      const memoCategory = selectedMemoItem.firstCategory as string;
      setMemoData((prevData) => ({
        ...prevData,
        [memoCategory]: prevData[memoCategory].map((memo) =>
          memo.memoId === selectedMemoItem.memoId
            ? { ...memo, memoContent: updatedData.memoContent }
            : memo
        ),
      }));

      alert("메모가 수정되었습니다.");
      window.location.reload();
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

      if (!response.ok) {
        console.error("메모 삭제에 실패했습니다.");
        return;
      }
      const memoCategory = selectedMemoItem.firstCategory as string;
      setMemoData((prevData) => ({
        ...prevData,
        [memoCategory]: prevData[memoCategory].filter(
          (memo) => memo.memoId !== selectedMemoItem.memoId
        ),
      }));

      setSelectedMemoItem(null);
      alert("메모가 삭제되었습니다.");
      window.location.reload();
    } catch (error) {
      console.error("메모 삭제 중 오류가 발생했습니다.", error);
    }
  };

  const fetchInterviewComment = async (category: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/interview/comment?category=${category}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const responseData: Comment[] = await response.json();

      if (!responseData || responseData.length === 0) {
        console.log("No comments available for this category.");
      }

      setInterviewData((prevData) => ({
        ...prevData,
        [category]: responseData,
      }));
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

      if (!response.ok) {
        console.error("댓글 수정에 실패했습니다.");
        return;
      }

      const updatedData = await response.json();
      const updatedCategory = selectedCommentItem.category as string;

      setInterviewData((prevData) => ({
        ...prevData,
        [updatedCategory]: prevData[updatedCategory].map((comment) =>
          comment.commentId === selectedCommentItem.commentId
            ? {
                ...comment,
                comment: updatedData.comment,
                public: updatedData.isPublic,
              }
            : comment
        ),
      }));

      alert("댓글이 수정되었습니다.");
      window.location.reload();
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

      if (!response.ok) {
        console.error("댓글 삭제에 실패했습니다.");
        return;
      }

      const commentCategory = selectedCommentItem.category as string;
      setInterviewData((prevData) => ({
        ...prevData,
        [commentCategory]: prevData[commentCategory].filter(
          (comment) => comment.commentId !== selectedCommentItem.commentId
        ),
      }));

      setSelectedCommentItem(null);
      alert("댓글이 삭제되었습니다.");
      window.location.reload();
    } catch (error) {
      console.error("댓글 삭제 중 오류가 발생했습니다.", error);
    }
  };

  const fetchMyPosts = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/community/post/my?page=0&size=10`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const responseData: PostListResponseDto[] = await response.json();
      setMyPosts(responseData || []);
    } catch (error) {
      console.error("Error fetching my posts: ", error);
    }
  };

  const fetchPostDetails = async (postId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8080/community/article?id=${postId}`,
        {
          credentials: "include",
        }
      );
      if (!response.ok)
        throw new Error("게시글 상세 정보를 불러오는데 실패했습니다.");
      const data: PostResponseDto = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const handleSavePostEdit = async () => {
    if (!selectedPostItem) return;
    const dto = {
      postId: selectedPostItem.id,
      title: editPostTitle,
      content: editPostContent,
    };
    try {
      const response = await fetch(
        `http://localhost:8080/community/article/edit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(dto),
        }
      );
      if (!response.ok) throw new Error("게시글 수정에 실패했습니다.");
      alert("게시글이 수정되었습니다.");
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePost = async (postId: number) => {
    const confirmed = window.confirm("해당 게시글을 삭제하시겠습니까?");
    if (!confirmed) return;
    try {
      const response = await fetch(
        `http://localhost:8080/community/article/delete?postId=${postId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("게시글 삭제에 실패했습니다.");
      alert("게시글이 삭제되었습니다.");
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  // Event handlers remain unchanged
  const handleNoteItemSelect = (note: Note) => {
    setSelectedNoteItem(note);
    setSelectedCommentItem(null);
    setSelectedMemoItem(null);
    setSelectedPostItem(null);
  };

  const handleShowNoteList = () => {
    if (!showNoteList) {
      setShowNoteList(true);
      setShowPostList(false);
      setSelectedCommentCategory("");
      setSelectedMemoCategory("");
      setSelectedCommentItem(null);
      setSelectedMemoItem(null);
      setSelectedPostItem(null);
    }
  };

  const handleShowPostList = () => {
    if (!showPostList) {
      setShowPostList(true);
      setShowNoteList(false);
      setSelectedCommentCategory("");
      setSelectedMemoCategory("");
      setSelectedNoteItem(null);
      setSelectedCommentItem(null);
      setSelectedMemoItem(null);
    }
  };

  const handleMemoCategorySelect = (category: string) => {
    setSelectedMemoCategory(category);
    setSelectedCommentCategory("");
    setSelectedNoteItem(null);
    setSelectedCommentItem(null);
    setSelectedMemoItem(null);
    setSelectedPostItem(null);
    setShowNoteList(false);
    setShowPostList(false);

    fetchStudyMemo(category);
  };

  const handleCommentCategorySelect = (category: string) => {
    setSelectedCommentCategory(category);
    setSelectedMemoCategory("");
    setSelectedCommentItem(null);
    setSelectedMemoItem(null);
    setSelectedPostItem(null);
    setShowNoteList(false);
    setShowPostList(false);

    fetchInterviewComment(category);
  };

  const handleCommentItemSelect = (comment: Comment) => {
    setSelectedNoteItem(null);
    setSelectedMemoItem(null);
    setSelectedPostItem(null);
    setSelectedCommentItem(comment);
    setUpdatedComment(comment.comment!!);
    setIsPublic(comment.public!!);
  };

  const handleMemoItemSelect = (memo: Memo) => {
    setSelectedNoteItem(null);
    setSelectedCommentItem(null);
    setSelectedPostItem(null);
    setSelectedMemoItem(memo);
    setUpdatedMemo(memo.memoContent!!);
  };

  const handlePostItemSelect = async (postId: number) => {
    const data = await fetchPostDetails(postId);
    if (data) {
      setSelectedNoteItem(null);
      setSelectedCommentItem(null);
      setSelectedMemoItem(null);
      setSelectedPostItem(data);
      setEditingPost(false);
    }
  };

  const handleEditPostClick = async (postId: number) => {
    const data = await fetchPostDetails(postId);
    if (data) {
      setSelectedPostItem(data);
      setEditPostTitle(data.title);
      setEditPostContent(data.content);
      setEditingPost(true);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("ko", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  useEffect(() => {
    if (showNoteList) {
      fetchNoteList();
    }
  }, [showNoteList]);

  useEffect(() => {
    if (showPostList) {
      fetchMyPosts();
    }
  }, [showPostList]);

  // Inline CSS for improved UI
  const styles: Record<string, CSSProperties> = {
    container: {
      display: "grid",
      gridTemplateColumns: "280px 350px 1fr",
      gap: "24px",
      padding: "32px",
      width: "1800px",
      margin: "0 auto",
      height: "100vh",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    },
    card: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 6px 16px rgba(0, 0, 0, 0.1)",
      padding: "20px",
      height: "800px", // 고정 높이
      overflowY: "auto",
    },
    navCard: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      height: "800px",
    },
    listCard: {
      height: "800px",
      overflowY: "auto",
    },
    contentCard: {
      height: "800px",
      overflowY: "auto",
      padding: "30px",
      minWidth: "800px", // 콘텐츠 영역 최소 너비 설정
    },
    button: {
      padding: "10px 16px",
      borderRadius: "6px",
      border: "none",
      backgroundColor: "#f5f5f5",
      color: "#333",
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.2s ease",
      textAlign: "left",
    },
    selectedButton: {
      backgroundColor: "#3b82f6",
      color: "white",
    },
    dropdownButton: {
      padding: "10px 16px",
      borderRadius: "6px",
      border: "none",
      backgroundColor: "#f5f5f5",
      color: "#333",
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    dropdownList: {
      marginLeft: "8px",
      listStyle: "none",
      padding: "0",
    },
    dropdownItem: {
      padding: "8px 16px",
      marginTop: "4px",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      backgroundColor: "#f0f0f0",
    },
    dropdownItemSelected: {
      backgroundColor: "#bfdbfe",
      color: "#1e40af",
    },
    listContainer: {
      listStyle: "none",
      padding: "0",
      margin: "0",
    },
    listItem: {
      padding: "12px 16px",
      borderRadius: "6px",
      marginBottom: "8px",
      cursor: "pointer",
      backgroundColor: "#f5f5f5",
      transition: "all 0.2s ease",
      color: "#333",
    },
    listItemSelected: {
      backgroundColor: "#3b82f6",
      color: "white",
    },
    noItems: {
      textAlign: "center",
      padding: "20px",
      color: "#888",
      fontStyle: "italic",
    },
    title: {
      fontSize: "1.75rem",
      fontWeight: 600,
      marginBottom: "20px",
      color: "#111",
      lineHeight: "1.3",
    },
    subtitle: {
      fontSize: "1.2rem",
      fontWeight: 600,
      marginBottom: "12px",
      color: "#333",
    },
    details: {
      marginBottom: "20px",
      lineHeight: "1.6",
    },
    meta: {
      fontSize: "0.9rem",
      color: "#666",
      marginBottom: "12px",
    },
    formGroup: {
      marginBottom: "16px",
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: 500,
      color: "#333",
    },
    input: {
      width: "100%",
      padding: "10px",
      borderRadius: "6px",
      border: "1px solid #ddd",
      fontSize: "1rem",
    },
    textarea: {
      width: "100%",
      padding: "16px",
      borderRadius: "8px",
      border: "1px solid #ddd",
      fontSize: "1rem",
      resize: "vertical",
      minHeight: "180px",
      fontFamily: "inherit",
      marginBottom: "16px",
    },
    checkbox: {
      marginRight: "8px",
    },
    checkboxLabel: {
      fontSize: "0.9rem",
      marginBottom: "16px",
      display: "inline-flex",
      alignItems: "center",
    },
    actionButtons: {
      display: "flex",
      gap: "8px",
      marginTop: "12px",
    },
    saveButton: {
      padding: "8px 16px",
      borderRadius: "6px",
      border: "none",
      backgroundColor: "#3b82f6",
      color: "white",
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    updateButton: {
      padding: "8px 16px",
      borderRadius: "6px",
      border: "none",
      backgroundColor: "#10b981",
      color: "white",
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    deleteButton: {
      padding: "8px 16px",
      borderRadius: "6px",
      border: "none",
      backgroundColor: "#ef4444",
      color: "white",
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    cancelButton: {
      padding: "8px 16px",
      borderRadius: "6px",
      border: "1px solid #ddd",
      backgroundColor: "white",
      color: "#333",
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    contentSection: {
      marginBottom: "30px",
      padding: "24px",
      backgroundColor: "#f9f9f9",
      borderRadius: "10px",
      lineHeight: "1.8",
      minHeight: "300px", // 콘텐츠 섹션 최소 높이
    },
    markdownContent: {
      lineHeight: "1.6",
    },
  };

  return (
    <div style={styles.container}>
      {/* Navigation Card */}
      <div style={{ ...styles.card, ...styles.navCard }}>
        <button
          style={{
            ...styles.button,
            ...(showNoteList ? styles.selectedButton : {}),
          }}
          onClick={() => {
            handleShowNoteList();
            fetchNoteList();
          }}
        >
          내 노트
        </button>

        <button
          style={{
            ...styles.button,
            ...(showPostList ? styles.selectedButton : {}),
          }}
          onClick={() => {
            handleShowPostList();
            fetchMyPosts();
          }}
        >
          내 글
        </button>

        <button
          style={styles.dropdownButton}
          onClick={() => setMemoDropdownOpen((prevState) => !prevState)}
        >
          작성한 학습 메모 {memoDropdownOpen ? "▲" : "▼"}
        </button>
        {memoDropdownOpen && (
          <ul style={styles.dropdownList}>
            {memoCategory.map((category, index) => (
              <li
                key={index}
                onClick={() => handleMemoCategorySelect(category)}
                style={{
                  ...styles.dropdownItem,
                  ...(selectedMemoCategory === category
                    ? styles.dropdownItemSelected
                    : {}),
                }}
              >
                {category}
              </li>
            ))}
          </ul>
        )}

        <button
          style={styles.dropdownButton}
          onClick={() => setAnswerDropdownOpen((prevState) => !prevState)}
        >
          작성한 기술 면접 답변 {answerDropdownOpen ? "▲" : "▼"}
        </button>
        {answerDropdownOpen && (
          <ul style={styles.dropdownList}>
            {answerCategory.map((category, index) => (
              <li
                key={index}
                onClick={() => handleCommentCategorySelect(category)}
                style={{
                  ...styles.dropdownItem,
                  ...(selectedCommentCategory === category
                    ? styles.dropdownItemSelected
                    : {}),
                }}
              >
                {category}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* List Card */}
      <div style={{ ...styles.card, ...styles.listCard }}>
        {/* 내 노트 목록 */}
        {showNoteList ? (
          notes.length > 0 ? (
            <ul style={styles.listContainer}>
              {notes.map((note) => (
                <li
                  key={note.contentId}
                  onClick={() => handleNoteItemSelect(note)}
                  style={{
                    ...styles.listItem,
                    ...(selectedNoteItem?.contentId === note.contentId
                      ? styles.listItemSelected
                      : {}),
                  }}
                >
                  {note.question}
                </li>
              ))}
            </ul>
          ) : (
            <p style={styles.noItems}>항목이 없습니다.</p>
          )
        ) : showPostList ? (
          myPosts.length > 0 ? (
            <ul style={styles.listContainer}>
              {myPosts.map((post) => (
                <li
                  key={post.postId}
                  onClick={() => handlePostItemSelect(post.postId)}
                  style={{
                    ...styles.listItem,
                    ...(selectedPostItem && selectedPostItem.id === post.postId
                      ? styles.listItemSelected
                      : {}),
                  }}
                >
                  {post.title}
                </li>
              ))}
            </ul>
          ) : (
            <p style={styles.noItems}>작성한 글이 없습니다.</p>
          )
        ) : /* 학습 메모 목록 */
        selectedMemoCategory && memoData[selectedMemoCategory] ? (
          <ul style={styles.listContainer}>
            {memoData[selectedMemoCategory].map((memo) => (
              <li
                key={memo.memoId}
                onClick={() => handleMemoItemSelect(memo)}
                style={{
                  ...styles.listItem,
                  ...(selectedMemoItem?.memoId === memo.memoId
                    ? styles.listItemSelected
                    : {}),
                }}
              >
                {memo.title}
              </li>
            ))}
          </ul>
        ) : /* 기술 면접 답변 목록 */
        selectedCommentCategory && interviewData[selectedCommentCategory] ? (
          interviewData[selectedCommentCategory].length > 0 ? (
            <ul style={styles.listContainer}>
              {interviewData[selectedCommentCategory].map((comment) => (
                <li
                  key={comment.commentId}
                  onClick={() => handleCommentItemSelect(comment)}
                  style={{
                    ...styles.listItem,
                    ...(selectedCommentItem?.commentId === comment.commentId
                      ? styles.listItemSelected
                      : {}),
                  }}
                >
                  {comment.interviewContentTitle}
                </li>
              ))}
            </ul>
          ) : (
            <p style={styles.noItems}>항목이 없습니다.</p>
          )
        ) : (
          <p style={styles.noItems}>항목이 없습니다.</p>
        )}
      </div>

      {/* Content Card */}
      <div style={{ ...styles.card, ...styles.contentCard }}>
        {selectedNoteItem ? (
          <>
            <h2 style={styles.title}>{selectedNoteItem.question}</h2>
            <div style={styles.actionButtons}>
              <button style={styles.deleteButton} onClick={deleteNote}>
                내 노트에서 삭제
              </button>
            </div>
            <div style={styles.contentSection}>{selectedNoteItem.answer}</div>
          </>
        ) : selectedPostItem ? (
          <>
            {editingPost ? (
              <div>
                <h2 style={styles.title}>게시글 수정</h2>
                <div style={styles.formGroup}>
                  <label style={styles.label}>제목</label>
                  <input
                    type="text"
                    value={editPostTitle}
                    onChange={(e) => setEditPostTitle(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>내용</label>
                  <textarea
                    value={editPostContent}
                    onChange={(e) => setEditPostContent(e.target.value)}
                    rows={6}
                    style={styles.textarea}
                  />
                </div>
                <div style={styles.actionButtons}>
                  <button
                    onClick={handleSavePostEdit}
                    style={styles.saveButton}
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setEditingPost(false);
                      setSelectedPostItem(null);
                      window.location.reload();
                    }}
                    style={styles.cancelButton}
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 style={styles.title}>{selectedPostItem.title}</h2>
                <p style={styles.meta}>
                  {formatDate(selectedPostItem.postTime)}
                </p>
                <div style={styles.contentSection}>
                  {selectedPostItem.content}
                </div>
                <div style={styles.actionButtons}>
                  <button
                    style={styles.updateButton}
                    onClick={() => handleEditPostClick(selectedPostItem.id)}
                  >
                    수정
                  </button>
                  <button
                    style={styles.deleteButton}
                    onClick={() => handleDeletePost(selectedPostItem.id)}
                  >
                    삭제
                  </button>
                </div>
              </>
            )}
          </>
        ) : selectedMemoItem ? (
          <>
            <h2 style={styles.title}>{selectedMemoItem.title}</h2>
            <div style={styles.contentSection}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ node, ...props }) => (
                    <p style={{ marginBottom: "16px" }} {...props} />
                  ),
                }}
              >
                {selectedMemoItem?.body?.replace(/<br\s*\/?>/gi, "") || ""}
              </ReactMarkdown>
            </div>
            <div style={styles.formGroup}>
              <h3 style={styles.subtitle}>내 메모</h3>
              <textarea
                value={updatedMemo}
                onChange={(e) => setUpdatedMemo(e.target.value)}
                rows={5}
                style={styles.textarea}
              />
              <div style={styles.actionButtons}>
                <button style={styles.updateButton} onClick={updateMemo}>
                  수정
                </button>
                <button style={styles.deleteButton} onClick={deleteMemo}>
                  삭제
                </button>
              </div>
            </div>
          </>
        ) : selectedCommentItem ? (
          <>
            <h2 style={styles.title}>
              {selectedCommentItem.interviewContentTitle}
            </h2>
            <div style={styles.contentSection}>
              {selectedCommentItem.modelAnswer}
            </div>
            <div style={styles.formGroup}>
              <h3 style={styles.subtitle}>내 답변</h3>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isPublic}
                  style={styles.checkbox}
                  onChange={() => setIsPublic((prev) => !prev)}
                />
                공개
              </label>
              <textarea
                value={updatedComment}
                onChange={(e) => setUpdatedComment(e.target.value)}
                rows={5}
                style={styles.textarea}
              />
              <div style={styles.actionButtons}>
                <button style={styles.updateButton} onClick={updateComment}>
                  수정
                </button>
                <button style={styles.deleteButton} onClick={deleteComment}>
                  삭제
                </button>
              </div>
            </div>
          </>
        ) : (
          <p style={styles.noItems}>항목을 선택해주세요.</p>
        )}
      </div>
    </div>
  );
};

export default ClientPage;
