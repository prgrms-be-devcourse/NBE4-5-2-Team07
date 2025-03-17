// export default CommunityDetailPage;
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface CommentResponseDto {
  articleId: number;
  commentId: number;
  commentAuthorName: string;
  commentTime: string;
  comment: string;
  reCommentCount: number;
  myComment: boolean;
}

interface PostResponseDto {
  id: number;
  authorName: string;
  postTime: string;
  title: string;
  content: string;
  like: number;
  comments: CommentResponseDto[];
  myPost?: boolean;
}

interface AddCommentRequestDto {
  articleId: number;
  comment: string;
  parentId: number | null; // top-level이면 null
}

interface EditCommentRequestDto {
  commentId: number;
  comment: string;
}

const CommunityDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { postId } = params;
  const [post, setPost] = useState<PostResponseDto | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [like, setLike] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [replyComment, setReplyComment] = useState<{ [key: number]: string }>(
    {}
  );
  const [refresh, setRefresh] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState<{
    [key: number]: boolean;
  }>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // 대댓글들을 저장하는 상태 (댓글ID별)
  const [replies, setReplies] = useState<{
    [key: number]: CommentResponseDto[];
  }>({});
  // 대댓글 보기 토글 상태
  const [showReplies, setShowReplies] = useState<{ [key: number]: boolean }>(
    {}
  );
  // 수정 모드 관련 상태 (댓글과 대댓글 모두 동일하게 처리)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const fetchPostDetail = async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://devapi.store/community/article?id=${postId}`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("게시글 상세 정보를 불러오는데 실패했습니다.");
      }
      const data = await response.json();
      setPost(data);
      setLike(data.like);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      // 1) /member/me로 요청, 사용자 id 가져오기
      const meResponse = await fetch("https://devapi.store/member/me", {
        credentials: "include",
      });
      if (!meResponse.ok) throw new Error("Unauthorized");
      const meData = await meResponse.json();
      // meData.data.id ← 사용자 PK

      // 2) /member/{id}/isAdmin 으로 요청, 관리자 여부 확인
      const isAdminResponse = await fetch(
        `https://devapi.store/member/${meData.data.id}/isAdmin`,
        { credentials: "include" }
      );
      if (!isAdminResponse.ok) throw new Error("Unauthorized");
      const isAdminData = await isAdminResponse.json();
      // isAdminData.data ← true or false

      // 상태 업데이트
      setUserId(meData.data.id);
      setIsAdmin(isAdminData.data === true);
    } catch (error) {
      router.push("/login");
    }
  };

  useEffect(() => {
    fetchPostDetail();
    checkAuth();
  }, [postId, refresh]);

  // 게시글 삭제
  const handleDeletePost = async () => {
    try {
      const response = await fetch(
        `https://devapi.store/community/article/delete?postId=${postId}`,
        { method: "POST", credentials: "include" }
      );
      if (!response.ok) {
        throw new Error("게시글 삭제에 실패했습니다.");
      }
      router.push("/community");
    } catch (error) {
      console.error(error);
    }
  };

  // 좋아요 기능
  const handleLike = async () => {
    try {
      const response = await fetch(
        `https://devapi.store/community/post/like?postId=${postId}`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("좋아요에 실패했습니다.");
      }
      const data = await response.json();
      setLike(data.likeCount);
    } catch (error) {
      console.error(error);
    }
  };

  // 댓글 추가 (top-level)
  const handleAddComment = async () => {
    if (!post || !newComment.trim()) return;
    setErrorMsg(null);
    const dto: AddCommentRequestDto = {
      articleId: post.id,
      comment: newComment,
      parentId: null,
    };

    try {
      const response = await fetch(
        "https://devapi.store/community/comment/add",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(dto),
        }
      );
      if (!response.ok) {
        throw new Error("댓글 추가에 실패했습니다.");
      }
      setNewComment("");
      setRefresh((prev) => !prev);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message);
    }
  };

  // 대댓글(답글) 추가
  const handleAddReply = async (parentId: number) => {
    if (!post || !replyComment[parentId]?.trim()) return;
    setErrorMsg(null);
    const dto: AddCommentRequestDto = {
      articleId: post.id,
      comment: replyComment[parentId],
      parentId: parentId,
    };

    try {
      const response = await fetch(
        "https://devapi.store/community/comment/add",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(dto),
        }
      );
      if (!response.ok) {
        throw new Error("대댓글 추가에 실패했습니다.");
      }
      setReplyComment((prev) => ({ ...prev, [parentId]: "" }));
      setShowReplyInput((prev) => ({ ...prev, [parentId]: false }));
      setRefresh((prev) => !prev);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message);
    }
  };

  // 댓글 수정 (부모 댓글 및 대댓글 모두 동일)
  const handleEditComment = async (commentId: number) => {
    if (!editingText.trim()) return;
    setErrorMsg(null);
    const dto: EditCommentRequestDto = {
      commentId,
      comment: editingText,
    };

    try {
      const response = await fetch(
        "https://devapi.store/community/comment/edit",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(dto),
        }
      );
      if (!response.ok) {
        throw new Error("댓글 수정에 실패했습니다.");
      }
      setEditingCommentId(null);
      setEditingText("");
      setRefresh((prev) => !prev);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message);
    }
  };

  // 댓글 삭제 (부모 댓글 및 대댓글 모두 동일)
  const handleDeleteComment = async (commentId: number) => {
    setErrorMsg(null);
    try {
      const response = await fetch(
        `https://devapi.store/community/comment/delete?commentId=${commentId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("댓글 삭제에 실패했습니다.");
      }
      setRefresh((prev) => !prev);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message);
    }
  };

  // 대댓글 보기/숨기기 토글 및 데이터 불러오기
  const toggleReplies = async (commentId: number) => {
    if (showReplies[commentId]) {
      setShowReplies((prev) => ({ ...prev, [commentId]: false }));
    } else {
      if (!replies[commentId]) {
        try {
          const response = await fetch(
            `https://devapi.store/community/comment/re?commentId=${commentId}`,
            {
              credentials: "include",
            }
          );
          if (!response.ok) {
            throw new Error("대댓글을 불러오는데 실패했습니다.");
          }
          const data = await response.json();
          setReplies((prev) => ({ ...prev, [commentId]: data }));
        } catch (error) {
          console.error(error);
        }
      }
      setShowReplies((prev) => ({ ...prev, [commentId]: true }));
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

  // 댓글 UI 렌더링
  const renderComments = () => {
    if (!post || !post.comments || post.comments.length === 0)
      return (
        <div className="py-10 text-center bg-gray-50 rounded-lg">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="https://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            ></path>
          </svg>
          <p className="text-gray-600 font-medium">
            댓글이 없습니다. 첫 댓글을 작성해보세요!
          </p>
        </div>
      );

    return (
      <ul className="divide-y divide-indigo-100 dark:divide-indigo-800">
        {post.comments.map((comment) => (
          <li key={comment.commentId} className="py-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold mr-3">
                {comment.commentAuthorName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-grow">
                <div className="flex items-center">
                  <span className="font-medium mr-2">
                    {comment.commentAuthorName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(comment.commentTime)}
                  </span>
                </div>
                {editingCommentId === comment.commentId ? (
                  <div className="mt-1">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full bg-indigo-50 dark:bg-indigo-900 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleEditComment(comment.commentId)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm shadow-lg shadow-indigo-500/20"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditingText("");
                        }}
                        className="px-3 py-1 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-400 dark:hover:bg-gray-600"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 text-gray-800 dark:text-gray-200">
                    {comment.comment}
                  </div>
                )}
                <div className="mt-2 flex items-center text-sm">
                  <button
                    className="mr-4 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium flex items-center"
                    onClick={() =>
                      setShowReplyInput((prev) => ({
                        ...prev,
                        [comment.commentId]: !prev[comment.commentId],
                      }))
                    }
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="https://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                      ></path>
                    </svg>
                    {showReplyInput[comment.commentId] ? "취소" : "답글"}
                  </button>

                  <button
                    className="mr-4 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium flex items-center"
                    onClick={() => toggleReplies(comment.commentId)}
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="https://www.w3.org/2000/svg"
                    >
                      {showReplies[comment.commentId] ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 15l7-7 7 7"
                        ></path>
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      )}
                    </svg>
                    {comment.reCommentCount}개의 답글
                  </button>

                  {(isAdmin || comment.myComment) &&
                    editingCommentId !== comment.commentId && (
                      <>
                        <button
                          className="mr-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-medium"
                          onClick={() => {
                            setEditingCommentId(comment.commentId);
                            setEditingText(comment.comment);
                          }}
                        >
                          수정
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                          onClick={() => handleDeleteComment(comment.commentId)}
                        >
                          삭제
                        </button>
                      </>
                    )}
                </div>

                {showReplyInput[comment.commentId] && (
                  <div className="mt-3 flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold mr-3">
                      {comment.commentAuthorName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-grow relative">
                      <input
                        type="text"
                        placeholder="답글 추가..."
                        value={replyComment[comment.commentId] || ""}
                        onChange={(e) =>
                          setReplyComment((prev) => ({
                            ...prev,
                            [comment.commentId]: e.target.value,
                          }))
                        }
                        className="w-full bg-indigo-50 dark:bg-indigo-900 rounded-full py-2 px-4 pr-16 focus:outline-none focus:ring-2 focus:ring-indigo-500 border-none dark:text-white"
                      />
                      <button
                        onClick={() => handleAddReply(comment.commentId)}
                        disabled={!replyComment[comment.commentId]?.trim()}
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded-full font-medium text-sm ${
                          replyComment[comment.commentId]?.trim()
                            ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
                            : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        게시
                      </button>
                    </div>
                  </div>
                )}

                {showReplies[comment.commentId] &&
                  replies[comment.commentId] && (
                    <div className="mt-3 ml-8 border-l-2 border-indigo-200 dark:border-indigo-700 pl-4 space-y-4">
                      {replies[comment.commentId].map((reply) => (
                        <div key={reply.commentId} className="flex flex-col">
                          <div className="flex items-center w-full">
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold mr-3">
                              {reply.commentAuthorName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center">
                                <span className="font-medium mr-2">
                                  {reply.commentAuthorName}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(reply.commentTime)}
                                </span>
                              </div>
                              {editingCommentId === reply.commentId ? (
                                <div className="mt-1">
                                  <input
                                    type="text"
                                    value={editingText}
                                    onChange={(e) =>
                                      setEditingText(e.target.value)
                                    }
                                    className="w-full bg-indigo-50 dark:bg-indigo-900 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                  />
                                  <div className="mt-2 flex gap-2">
                                    <button
                                      onClick={() =>
                                        handleEditComment(reply.commentId)
                                      }
                                      className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
                                    >
                                      저장
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingCommentId(null);
                                        setEditingText("");
                                      }}
                                      className="px-3 py-1 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-400 dark:hover:bg-gray-600"
                                    >
                                      취소
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-1 text-gray-800 dark:text-gray-200">
                                  {reply.comment}
                                </div>
                              )}
                            </div>
                            {reply.myComment &&
                              editingCommentId !== reply.commentId && (
                                <div className="flex flex-col ml-2">
                                  <button
                                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-medium mb-1"
                                    onClick={() => {
                                      setEditingCommentId(reply.commentId);
                                      setEditingText(reply.comment);
                                    }}
                                  >
                                    수정
                                  </button>
                                  <button
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                                    onClick={() =>
                                      handleDeleteComment(reply.commentId)
                                    }
                                  >
                                    삭제
                                  </button>
                                </div>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 overflow-hidden relative">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-blue-300 dark:bg-blue-600 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-indigo-300 dark:bg-indigo-700 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-purple-300 dark:bg-purple-700 blur-3xl"></div>
      </div>

      {/* Code particles decoration */}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="mb-4">
          <Link
            href="/community"
            className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-indigo-200 dark:border-indigo-700 rounded-full text-indigo-600 dark:text-indigo-400 transition-colors duration-200 font-medium text-sm shadow-lg"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="https://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            목록으로 돌아가기
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : post ? (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
              <div className="p-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text mb-4">
                  {post.title}
                </h1>

                <div className="flex items-center justify-between mb-6 pb-4 border-b border-indigo-100 dark:border-indigo-800">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold mr-3">
                      {post.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {post.authorName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(post.postTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <button
                      onClick={handleLike}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-white dark:bg-gray-700 border border-indigo-200 dark:border-indigo-700 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors shadow-lg"
                    >
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill={like > 0 ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="https://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        ></path>
                      </svg>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {like}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="prose max-w-none text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {post.content}
                </div>

                {/* 게시글  삭제 버튼 (관리자 또는 본인 게시글인 경우) */}
                {(isAdmin || post.myPost) && (
                  <div className="flex gap-2 mt-4">
                    <button
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                      onClick={handleDeletePost}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </div>

            {errorMsg && (
              <div className="mt-4 bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-lg shadow-lg">
                <p className="font-medium">오류</p>
                <p>{errorMsg}</p>
              </div>
            )}

            <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text mb-6">
                  댓글 {post.comments?.length || 0}개
                </h2>

                <div className="mb-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold mr-3">
                      U
                    </div>
                    <div className="flex-grow relative">
                      <input
                        type="text"
                        placeholder="댓글 추가..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full bg-indigo-50 dark:bg-indigo-900 rounded-full py-2 px-4 pr-16 focus:outline-none focus:ring-2 focus:ring-indigo-500 border-none dark:text-white"
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded-full font-medium text-sm ${
                          newComment.trim()
                            ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
                            : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        게시
                      </button>
                    </div>
                  </div>
                </div>

                {renderComments()}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-indigo-50 dark:bg-indigo-900 rounded-lg p-8 text-center shadow-xl">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
            <p className="text-lg font-medium text-indigo-600 dark:text-indigo-300">
              게시글 정보를 불러오는데 실패했습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityDetailPage;
