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
}

interface PostResponseDto {
  id: number;
  authorName: string;
  postTime: string;
  title: string;
  content: string;
  like: number;
  comments: CommentResponseDto[];
}

interface AddCommentRequestDto {
  articleId: number;
  comment: string;
  parentId: number | null; // top-level이면 null
}

const CommunityDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { postId } = params;
  const [post, setPost] = useState<PostResponseDto | null>(null);
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

  const fetchPostDetail = async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/community/article?id=${postId}`,
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

  useEffect(() => {
    fetchPostDetail();
  }, [postId, refresh]);

  // 좋아요 기능
  const handleLike = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/community/post/like?postId=${postId}`,
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
        "http://localhost:8080/community/comment/add",
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
        "http://localhost:8080/community/comment/add",
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

  // 대댓글 보기/숨기기 토글 및 데이터 불러오기
  const toggleReplies = async (commentId: number) => {
    if (showReplies[commentId]) {
      // 이미 표시중이면 숨김
      setShowReplies((prev) => ({ ...prev, [commentId]: false }));
    } else {
      // 아직 대댓글이 로드되지 않았다면 불러오기
      if (!replies[commentId]) {
        try {
          const response = await fetch(
            `http://localhost:8080/community/comment/re?commentId=${commentId}`,
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
    const date = new Date(dateString);
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
            xmlns="http://www.w3.org/2000/svg"
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
      <ul className="divide-y divide-gray-200">
        {post.comments.map((comment) => (
          <li key={comment.commentId} className="py-4">
            <div className="flex items-start">
              {/* 아바타 아이콘 */}
              <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold mr-3">
                {comment.commentAuthorName.charAt(0).toUpperCase()}
              </div>

              <div className="flex-grow">
                <div className="flex items-center">
                  <span className="font-medium mr-2">
                    {comment.commentAuthorName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.commentTime)}
                  </span>
                </div>

                <div className="mt-1 text-gray-800">{comment.comment}</div>

                <div className="mt-2 flex items-center text-sm">
                  <button
                    className="mr-4 text-gray-600 hover:text-blue-600 font-medium flex items-center"
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
                      xmlns="http://www.w3.org/2000/svg"
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
                    className="text-gray-600 hover:text-blue-600 font-medium flex items-center"
                    onClick={() => toggleReplies(comment.commentId)}
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
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
                </div>

                {/* 답글 작성 폼 */}
                {showReplyInput[comment.commentId] && (
                  <div className="mt-3 flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold mr-3">
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
                        className="w-full bg-gray-100 rounded-full py-2 px-4 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500 border-none"
                      />
                      <button
                        onClick={() => handleAddReply(comment.commentId)}
                        disabled={!replyComment[comment.commentId]?.trim()}
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded-full font-medium text-sm ${
                          replyComment[comment.commentId]?.trim()
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        게시
                      </button>
                    </div>
                  </div>
                )}

                {/* 대댓글 목록 */}
                {showReplies[comment.commentId] &&
                  replies[comment.commentId] && (
                    <div className="mt-3 ml-8 border-l-2 border-gray-200 pl-4 space-y-4">
                      {replies[comment.commentId].map((reply) => (
                        <div key={reply.commentId} className="flex items-start">
                          <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold mr-3">
                            {reply.commentAuthorName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center">
                              <span className="font-medium mr-2">
                                {reply.commentAuthorName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(reply.commentTime)}
                              </span>
                            </div>
                            <div className="mt-1 text-gray-800">
                              {reply.comment}
                            </div>
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
    <div className="w-[1200px] mx-auto px-4 py-8">
      <div className="mb-4">
        <Link
          href="/community"
          className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md text-blue-600 hover:bg-blue-50 transition-colors duration-200 font-medium text-sm"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
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
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : post ? (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {post.title}
              </h1>

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
                    {post.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {post.authorName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(post.postTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <button
                    onClick={handleLike}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill={like > 0 ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      ></path>
                    </svg>
                    <span className="font-medium">{like}</span>
                  </button>
                </div>
              </div>

              <div className="prose max-w-none text-gray-800">
                {post.content}
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p className="font-medium">오류</p>
              <p>{errorMsg}</p>
            </div>
          )}

          <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                댓글 {post.comments?.length || 0}개
              </h2>

              <div className="mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold mr-3">
                    U
                  </div>
                  <div className="flex-grow relative">
                    <input
                      type="text"
                      placeholder="댓글 추가..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full bg-gray-100 rounded-full py-2 px-4 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500 border-none"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded-full font-medium text-sm ${
                        newComment.trim()
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
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
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
          <p className="text-lg font-medium text-gray-600">
            게시글 정보를 불러오는데 실패했습니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default CommunityDetailPage;
