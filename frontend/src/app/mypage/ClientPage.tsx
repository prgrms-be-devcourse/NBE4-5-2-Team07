"use client";

import React, { useEffect, useState, CSSProperties } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { components } from "@/lib/backend/apiV1/schema";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

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
      const response = await fetch(`https://devapi.store/interview/bookmark`, {
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
        `https://devapi.store/interview/bookmark/${selectedNoteItem.contentId}`,
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
        `https://devapi.store/api/v1/studyMemo?category=${category}`,
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
        `https://devapi.store/api/v1/studyMemo/${selectedMemoItem.memoId}`,
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
        `https://devapi.store/api/v1/studyMemo/${selectedMemoItem.memoId}`,
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
        `https://devapi.store/api/v1/interview/comment?category=${category}`,
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
        `https://devapi.store/api/v1/interview/comment/${selectedCommentItem.commentId}`,
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
        `https://devapi.store/api/v1/interview/comment/${selectedCommentItem.commentId}`,
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
        `https://devapi.store/community/post/my?page=0&size=10`,
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
        `https://devapi.store/community/article?id=${postId}`,
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
        `https://devapi.store/community/article/edit`,
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
        `https://devapi.store/community/article/delete?postId=${postId}`,
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

  const handleSubcriptionList = () => {
    router.push("/payment");
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
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 overflow-hidden relative">
      {/* 배경 장식 요소 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-blue-300 dark:bg-blue-600 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-indigo-300 dark:bg-indigo-700 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-purple-300 dark:bg-purple-700 blur-3xl"></div>
      </div>

      {/* 코드 파티클 배경 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-gray-800 dark:text-gray-200 text-opacity-30 font-mono text-sm"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 90 - 45}deg)`,
            }}
          >
            {
              [
                "function()",
                "const data = []",
                "for(let i=0;)",
                "if(isValid)",
                "return result",
                "{ }",
                "=> {}",
                "import",
                "export",
                "class",
              ][Math.floor(Math.random() * 10)]
            }
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 relative z-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text mb-8">
          내 학습 페이지
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {/* Navigation Sidebar */}
          <div className="md:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 flex flex-col gap-4">
              <button
                className={`px-4 py-3 rounded-lg transition-colors text-left ${
                  showNoteList
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => {
                  handleShowNoteList();
                  fetchNoteList();
                }}
              >
                내 노트
              </button>

              <button
                className={`px-4 py-3 rounded-lg transition-colors text-left ${
                  showPostList
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => {
                  handleShowPostList();
                  fetchMyPosts();
                }}
              >
                내 글
              </button>

              <div className="relative">
                <button
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex justify-between items-center text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => setMemoDropdownOpen(!memoDropdownOpen)}
                >
                  <span>작성한 학습 메모</span>
                  <span>{memoDropdownOpen ? "▲" : "▼"}</span>
                </button>
                {memoDropdownOpen && (
                  <div className="mt-2 ml-4 space-y-2">
                    {memoCategory.map((category, index) => (
                      <button
                        key={index}
                        onClick={() => handleMemoCategorySelect(category)}
                        className={`w-full px-4 py-2 rounded-lg text-left ${
                          selectedMemoCategory === category
                            ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
                            : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex justify-between items-center text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => setAnswerDropdownOpen(!answerDropdownOpen)}
                >
                  <span>작성한 기술 면접 답변</span>
                  <span>{answerDropdownOpen ? "▲" : "▼"}</span>
                </button>
                {answerDropdownOpen && (
                  <div className="mt-2 ml-4 space-y-2">
                    {answerCategory.map((category, index) => (
                      <button
                        key={index}
                        onClick={() => handleCommentCategorySelect(category)}
                        className={`w-full px-4 py-2 rounded-lg text-left ${
                          selectedCommentCategory === category
                            ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
                            : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                className="px-4 py-3 rounded-lg transition-colors text-left bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={handleSubcriptionList}
              >
                구독 현황
              </button>
            </div>
          </div>

          {/* Item List */}
          <div className="md:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 h-[600px] overflow-y-auto">
              {/* 내 노트 목록 */}
              {showNoteList ? (
                notes.length > 0 ? (
                  <div className="space-y-2">
                    {notes.map((note) => (
                      <button
                        key={note.contentId}
                        onClick={() => handleNoteItemSelect(note)}
                        className={`w-full px-4 py-3 rounded-lg text-left transition-colors ${
                          selectedNoteItem?.contentId === note.contentId
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {note.question}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      항목이 없습니다.
                    </p>
                  </div>
                )
              ) : showPostList ? (
                myPosts.length > 0 ? (
                  <div className="space-y-2">
                    {myPosts.map((post) => (
                      <button
                        key={post.postId}
                        onClick={() => handlePostItemSelect(post.postId)}
                        className={`w-full px-4 py-3 rounded-lg text-left transition-colors ${
                          selectedPostItem &&
                          selectedPostItem.id === post.postId
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {post.title}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      작성한 글이 없습니다.
                    </p>
                  </div>
                )
              ) : selectedMemoCategory && memoData[selectedMemoCategory] ? (
                <div className="space-y-2">
                  {memoData[selectedMemoCategory].map((memo) => (
                    <button
                      key={memo.memoId}
                      onClick={() => handleMemoItemSelect(memo)}
                      className={`w-full px-4 py-3 rounded-lg text-left transition-colors ${
                        selectedMemoItem?.memoId === memo.memoId
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {memo.title}
                    </button>
                  ))}
                </div>
              ) : selectedCommentCategory &&
                interviewData[selectedCommentCategory] ? (
                interviewData[selectedCommentCategory].length > 0 ? (
                  <div className="space-y-2">
                    {interviewData[selectedCommentCategory].map((comment) => (
                      <button
                        key={comment.commentId}
                        onClick={() => handleCommentItemSelect(comment)}
                        className={`w-full px-4 py-3 rounded-lg text-left transition-colors ${
                          selectedCommentItem?.commentId === comment.commentId
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {comment.interviewContentTitle}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      항목이 없습니다.
                    </p>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    카테고리를 선택해주세요.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Content Detail */}
          <div className="md:col-span-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 h-[600px] overflow-y-auto">
              {selectedNoteItem ? (
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text mb-4">
                    {selectedNoteItem.question}
                  </h2>
                  <div className="flex mb-4">
                    <button
                      onClick={deleteNote}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md shadow-red-500/20 transition-colors"
                    >
                      내 노트에서 삭제
                    </button>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-xl shadow-inner">
                    {selectedNoteItem.answer}
                  </div>
                </div>
              ) : selectedPostItem ? (
                editingPost ? (
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text mb-4">
                      게시글 수정
                    </h2>
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                        제목
                      </label>
                      <input
                        type="text"
                        value={editPostTitle}
                        onChange={(e) => setEditPostTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                        내용
                      </label>
                      <textarea
                        value={editPostContent}
                        onChange={(e) => setEditPostContent(e.target.value)}
                        rows={10}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white resize-none"
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={handleSavePostEdit}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md shadow-indigo-500/20 transition-colors"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => {
                          setEditingPost(false);
                          setSelectedPostItem(null);
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text mb-2">
                      {selectedPostItem.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      {formatDate(selectedPostItem.postTime)}
                    </p>
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-xl shadow-inner min-h-[300px] mb-6">
                      {selectedPostItem.content}
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleEditPostClick(selectedPostItem.id)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md shadow-indigo-500/20 transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeletePost(selectedPostItem.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md shadow-red-500/20 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                )
              ) : selectedMemoItem ? (
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text mb-4">
                    {selectedMemoItem.title}
                  </h2>
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-xl shadow-inner mb-6">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ node, ...props }) => (
                          <p
                            className="text-gray-800 dark:text-gray-200 text-base leading-relaxed mb-4"
                            {...props}
                          />
                        ),
                        h1: ({ node, ...props }) => (
                          <h1
                            className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4"
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2
                            className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3"
                            {...props}
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3
                            className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2"
                            {...props}
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc pl-6 mb-4" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal pl-6 mb-4" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="mb-1" {...props} />
                        ),
                        a: ({ node, ...props }) => (
                          <a
                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                            {...props}
                          />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote
                            className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic my-4"
                            {...props}
                          />
                        ),
                        code: ({
                          node,
                          inline,
                          ...props
                        }: {
                          node?: any;
                          inline?: boolean;
                          [key: string]: any;
                        }) =>
                          inline ? (
                            <code
                              className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm"
                              {...props}
                            />
                          ) : (
                            <code
                              className="block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-auto my-4"
                              {...props}
                            />
                          ),
                      }}
                    >
                      {selectedMemoItem?.body?.replace(/<br\s*\/?>/gi, "") ||
                        ""}
                    </ReactMarkdown>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      내 메모
                    </h3>
                    <textarea
                      value={updatedMemo}
                      onChange={(e) => setUpdatedMemo(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white min-h-[120px] resize-none mb-4"
                    />
                    <div className="flex gap-4">
                      <button
                        onClick={updateMemo}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md shadow-indigo-500/20 transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={deleteMemo}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md shadow-red-500/20 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ) : selectedCommentItem ? (
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text mb-4">
                    {selectedCommentItem.interviewContentTitle}
                  </h2>
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-xl shadow-inner mb-6">
                    {selectedCommentItem.modelAnswer}
                  </div>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      내 답변
                    </h3>
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={isPublic}
                        onChange={() => setIsPublic(!isPublic)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2"
                      />
                      <label
                        htmlFor="isPublic"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        공개
                      </label>
                    </div>
                    <textarea
                      value={updatedComment}
                      onChange={(e) => setUpdatedComment(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white min-h-[120px] resize-none mb-4"
                    />
                    <div className="flex gap-4">
                      <button
                        onClick={updateComment}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md shadow-indigo-500/20 transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={deleteComment}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md shadow-red-500/20 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 text-indigo-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="https://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      ></path>
                    </svg>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      왼쪽 메뉴에서 항목을 선택해주세요.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPage;
