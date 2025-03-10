"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type StudyMemoResponseDto = {
    memoId: number;
    memoContent: string;
    likeCount: number;
    createdAt?: string;
};

const MemoList = () => {
    const { selectedContentId } = useParams();
    const [memoList, setMemoList] = useState<StudyMemoResponseDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMemoList = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8080/api/v1/studyMemo/list/${selectedContentId}`,
                    {
                        method: "GET",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                if (!response.ok) throw new Error("메모 리스트를 불러오는 데 실패했습니다.");
                const data = await response.json();
                console.log(data);
                setMemoList(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMemoList();
    }, [selectedContentId]);

    const handleMemoLike = async (memoId: number) => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/studyMemo/like/${memoId}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("좋아요를 추가하는 데 실패했습니다.");
            }

            setMemoList((prevMemoList) =>
                prevMemoList.map((memo) =>
                    memo.memoId === memoId
                        ? { ...memo, likeCount: memo.likeCount + 1 }
                        : memo
                )
            );
        } catch (err: any) {
            console.error("좋아요 실패:", err.message);
        }
    };

    if (loading) return <p>메모 리스트를 불러오는 중...</p>;
    if (error) return <p>오류 발생: {error}</p>;

    return (
        <div style={{ padding: "30px 20px", fontFamily: "Arial, sans-serif", backgroundColor: "#f4f7fb" }}>
            <h1
                style={{
                    color: "#333",
                    textAlign: "center",
                    marginBottom: "30px",
                    fontSize: "2rem",
                    fontWeight: "600",
                }}
            >
                공개 메모 리스트
            </h1>
            {memoList.length > 0 ? (
                <ul style={{ listStyleType: "none", padding: 0 }}>
                    {memoList.map((memo) => (
                        <li
                            key={memo.memoId}
                            style={{
                                backgroundColor: "#fff",
                                borderRadius: "12px",
                                padding: "20px",
                                marginBottom: "20px",
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                transition: "transform 0.3s ease-in-out",
                            }}
                        >
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    color: "#333",
                                    lineHeight: "1.5",
                                }}
                            >
                                {memo.memoContent}
                            </p>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginTop: "15px",
                                    fontSize: "14px",
                                    color: "#777",
                                }}
                            >
                                <button
                                    onClick={() => handleMemoLike(memo.memoId)}
                                    style={{
                                        background: "#f2f2f2",
                                        border: "none",
                                        padding: "5px 10px",
                                        borderRadius: "50px",
                                        cursor: "pointer",
                                        fontSize: "18px",
                                        color: "#ff5c8d",
                                        transition: "background 0.2s ease",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.background = "#e1e1e1")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.background = "#f2f2f2")
                                    }
                                >
                                    🧡
                                </button>
                                <span style={{ fontWeight: "bold", color: "#333" }}>
                                    {memo.likeCount}
                                </span>
                                {memo.createdAt && (
                                    <span
                                        style={{
                                            fontSize: "12px",
                                            color: "#aaa",
                                            fontStyle: "italic",
                                        }}
                                    >
                                        {new Date(memo.createdAt).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p style={{ textAlign: "center", color: "#777", fontStyle: "italic" }}>
                    공개된 메모가 없습니다.
                </p>
            )}
        </div>
    );
};

export default MemoList;
