"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "../styles/mypage.module.css";
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
  // activeCategory: "note", "post", "memo", "interview"
  const [activeCategory, setActiveCategory] = useState("note");

  // 기존 상태들
  const [notes, setNotes] = useState<Note[]>([]);
  const [memoData, setMemoData] = useState<MemoData>({});
  const [interviewData, setInterviewData] = useState<InterviewData>({});
  const [selectedNoteItem, setSelectedNoteItem] = useState<Note | null>(null);
  const [selectedMemoItem, setSelectedMemoItem] = useState<Memo | null>(null);
  const [selectedCommentItem, setSelectedCommentItem] =
    useState<Comment | null>(null);
  const [updatedComment, setUpdatedComment] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  // 내 글 상태
  const [myPosts, setMyPosts] = useState<PostListResponseDto[]>([]);
  const [selectedPostItem, setSelectedPostItem] =
    useState<PostResponseDto | null>(null);
  const [editingPost, setEditingPost] = useState(false);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editPostContent, setEditPostContent] = useState("");

  // 드롭다운 상태 (메모, 면접)
  const [memoDropdownOpen, setMemoDropdownOpen] = useState(false);
  const [answerDropdownOpen, setAnswerDropdownOpen] = useState(false);
  const [selectedMemoCategory, setSelectedMemoCategory] = useState("");
  const [selectedCommentCategory, setSelectedCommentCategory] = useState("");

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

  // -------------------------------
  // API 호출 함수들
  // -------------------------------

  // 노트 조회 API
  const fetchNoteList = async () => {
    try {
      const response = await fetch(`http://localhost:8080/interview/bookmark`, {
        method: "GET",
        credentials: "include",
      });
      const responseData: Note[] = await response.json();
      setNotes(responseData || []);
    } catch (error) {
      console.error("Error fetching notes: ", error);
    }
  };

  // 내 글 조회 API
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

  // 메모 조회 API
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
      const updatedCategoryItems = responseData.reduce(
        (acc: MemoData, memo: Memo) => {
          const memoCat = memo.firstCategory as string;
          if (!acc[memoCat]) acc[memoCat] = [];
          acc[memoCat].push(memo);
          return acc;
        },
        {}
      );
      setMemoData(updatedCategoryItems);
    } catch (error) {
      console.error("Error fetching memos: ", error);
    }
  };

  // 기술 면접 조회 API
  const fetchInterviewComment = async (category: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/interview/comment?category=${category}`,
        { method: "GET", credentials: "include" }
      );
      const responseData: Comment[] = await response.json();
      setInterviewData((prev) => ({ ...prev, [category]: responseData }));
    } catch (error) {
      console.error("Error fetching interview comments: ", error);
    }
  };

  // 내 글 상세 조회 API (수정/삭제 위해)
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

  // -------------------------------
  // 핸들러
  // -------------------------------
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setSelectedNoteItem(null);
    setSelectedMemoItem(null);
    setSelectedCommentItem(null);
    setSelectedPostItem(null);
    if (category === "note") fetchNoteList();
    if (category === "post") fetchMyPosts();
  };

  // 내 글 선택
  const handlePostItemSelect = async (postId: number) => {
    const data = await fetchPostDetails(postId);
    if (data) {
      setSelectedPostItem(data);
      setEditingPost(false);
    }
  };

  // 내 글 수정 버튼 클릭
  const handleEditPostClick = async (postId: number) => {
    const data = await fetchPostDetails(postId);
    if (data) {
      setSelectedPostItem(data);
      setEditPostTitle(data.title);
      setEditPostContent(data.content);
      setEditingPost(true);
    }
  };

  // 내 글 수정 저장 (수정 후 새로고침)
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

  // 내 글 삭제 (삭제 후 새로고침)
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

  useEffect(() => {
    if (activeCategory === "note") fetchNoteList();
    if (activeCategory === "post") fetchMyPosts();
  }, [activeCategory]);

  // -------------------------------
  // 렌더링
  // -------------------------------
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

  return (
    <div className={styles.container}>
      {/* 상단 메뉴 */}
      <div className={`${styles.card} ${styles.small}`}>
        <button
          className={`${styles.btn} ${
            activeCategory === "note" ? styles.selectedBtn : ""
          }`}
          onClick={() => handleCategoryChange("note")}
        >
          내 노트
        </button>
        <button
          className={`${styles.btn} ${
            activeCategory === "post" ? styles.selectedBtn : ""
          }`}
          onClick={() => handleCategoryChange("post")}
        >
          내 글
        </button>
        <button
          className={`${styles.btn} ${
            memoDropdownOpen ? styles.selectedBtn : ""
          }`}
          onClick={() => {
            setMemoDropdownOpen((prev) => !prev);
            setActiveCategory("memo");
          }}
        >
          작성한 학습 메모 {memoDropdownOpen ? "▲" : "▼"}
        </button>
        <button
          className={`${styles.btn} ${
            answerDropdownOpen ? styles.selectedBtn : ""
          }`}
          onClick={() => {
            setAnswerDropdownOpen((prev) => !prev);
            setActiveCategory("interview");
          }}
        >
          작성한 기술 면접 답변 {answerDropdownOpen ? "▲" : "▼"}
        </button>
      </div>

      {/* 왼쪽 목록 영역 */}
      <div className={`${styles.card} ${styles.small}`}>
        {activeCategory === "note" ? (
          notes.length > 0 ? (
            <ul>
              {notes.map((note) => (
                <li
                  key={note.contentId}
                  onClick={() => setSelectedNoteItem(note)}
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
          ) : (
            <p className={styles.noItems}>항목이 없습니다.</p>
          )
        ) : activeCategory === "post" ? (
          myPosts.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {myPosts.map((post) => (
                <li
                  key={post.postId}
                  onClick={() => handlePostItemSelect(post.postId)}
                  className={`${styles.listItem} ${
                    selectedPostItem && selectedPostItem.id === post.postId
                      ? styles.selected
                      : ""
                  }`}
                >
                  {post.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noItems}>작성한 글이 없습니다.</p>
          )
        ) : activeCategory === "memo" &&
          selectedMemoCategory &&
          memoData[selectedMemoCategory] ? (
          memoData[selectedMemoCategory].map((memo) => (
            <li
              key={memo.memoId}
              onClick={() => setSelectedMemoItem(memo)}
              className={`${styles.listItem} ${
                selectedMemoItem?.memoId === memo.memoId ? styles.selected : ""
              }`}
            >
              {memo.title}
            </li>
          ))
        ) : activeCategory === "interview" &&
          selectedCommentCategory &&
          interviewData[selectedCommentCategory] ? (
          interviewData[selectedCommentCategory].length > 0 ? (
            interviewData[selectedCommentCategory].map((comment) => (
              <li
                key={comment.commentId}
                onClick={() => setSelectedCommentItem(comment)}
                className={`${styles.listItem} ${
                  selectedCommentItem?.commentId === comment.commentId
                    ? styles.selected
                    : ""
                }`}
              >
                {comment.interviewContentTitle}
              </li>
            ))
          ) : (
            <p className={styles.noItems}>항목이 없습니다.</p>
          )
        ) : (
          <p className={styles.noItems}>항목이 없습니다.</p>
        )}
      </div>

      {/* 오른쪽 상세 내용 영역 */}
      <div className={`${styles.card} ${styles.large}`}>
        {activeCategory === "note" && selectedNoteItem ? (
          <>
            <div className={styles.largeText}>
              <strong>{selectedNoteItem.question}</strong>
              <button
                className={styles.noteDeleteButton}
                onClick={() => {
                  /* 노트 삭제 함수 호출 */
                }}
              >
                내 노트에서 삭제
              </button>
            </div>
            <br />
            <div className={styles.text}>{selectedNoteItem.answer}</div>
          </>
        ) : activeCategory === "memo" && selectedMemoItem ? (
          <>
            <strong className={styles.largeText}>
              {selectedMemoItem.title}
            </strong>
            <br />
            <span className={styles.text}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedMemoItem?.body?.replace(/<br\s*\/?>/gi, "")}
              </ReactMarkdown>
            </span>
            <br />
            <div className={styles.bottom}>
              <div>
                <strong className={styles.text}>내 메모</strong>
                <span className={styles.actionButtons}>
                  <button
                    className={styles.updateButton}
                    onClick={() => {
                      /* 메모 수정 함수 */
                    }}
                  >
                    수정
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => {
                      /* 메모 삭제 함수 */
                    }}
                  >
                    삭제
                  </button>
                </span>
                <textarea
                  value={"" /* updatedMemo 상태 */}
                  onChange={(e) => {
                    /* setUpdatedMemo(e.target.value) */
                  }}
                  rows={5}
                  className={styles.textarea}
                />
              </div>
            </div>
          </>
        ) : activeCategory === "interview" && selectedCommentItem ? (
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
              <span className={styles.actionButtons}>
                <button
                  className={styles.updateButton}
                  onClick={() => {
                    /* 기술면접 댓글 수정 함수 */
                  }}
                >
                  수정
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => {
                    /* 기술면접 댓글 삭제 함수 */
                  }}
                >
                  삭제
                </button>
              </span>
              <textarea
                value={"" /* updatedComment 상태 */}
                onChange={(e) => {
                  /* setUpdatedComment(e.target.value) */
                }}
                rows={5}
                className={styles.textarea}
              />
            </div>
          </>
        ) : activeCategory === "post" && selectedPostItem ? (
          <>
            {editingPost ? (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">게시글 수정</h2>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    제목
                  </label>
                  <input
                    type="text"
                    value={editPostTitle}
                    onChange={(e) => setEditPostTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    내용
                  </label>
                  <textarea
                    value={editPostContent}
                    onChange={(e) => setEditPostContent(e.target.value)}
                    rows={6}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleSavePostEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setEditingPost(false);
                      setSelectedPostItem(null);
                      window.location.reload();
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  {selectedPostItem.title}
                </h1>
                <p className="text-sm text-gray-500 mb-4">
                  {formatDate(selectedPostItem.postTime)}
                </p>
                <div className="prose max-w-none text-gray-800">
                  {selectedPostItem.content}
                </div>
                <div className="mt-4 flex gap-4">
                  <button
                    className="px-3 py-1 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors"
                    onClick={() => handleEditPostClick(selectedPostItem.id)}
                  >
                    수정
                  </button>
                  <button
                    className="px-3 py-1 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    onClick={() => handleDeletePost(selectedPostItem.id)}
                  >
                    삭제
                  </button>
                </div>
              </>
            )}
          </>
        ) : activeCategory === "post" ? (
          myPosts.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {myPosts.map((post) => (
                <li
                  key={post.postId}
                  onClick={() => handlePostItemSelect(post.postId)}
                  className="py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h3 className="text-xl font-medium text-gray-800">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(post.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noItems}>작성한 게시글이 없습니다.</p>
          )
        ) : (
          <p className={styles.noItems}>항목이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default ClientPage;
