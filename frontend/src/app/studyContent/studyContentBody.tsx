import React, {useEffect, useState} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {useRouter} from "next/navigation";
import styles from "../styles/studyContent.module.css";

const DEFAULT_CATEGORY = {
    firstCategory: "OperatingSystem",
    secondCategory: "운영체제란?",
};

const StudyContentBody = ({selectedCategory}: { selectedCategory: any }) => {
    const [memo, setMemo] = useState<string | "">("");
    const [selectedContentId, setSelectedContentId] = useState<bigint | null>(
        null
    );
    const [category, setCategory] = useState(
        selectedCategory || DEFAULT_CATEGORY
    );
    const [studyContents, setStudyContents] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const router = useRouter();
    useEffect(() => {
        if (selectedCategory) {
            setCategory(selectedCategory);
            setPage(0);
        } else {
            setCategory(DEFAULT_CATEGORY);
            setPage(0);
        }
    }, [selectedCategory]);
    useEffect(() => {
        const fetchStudyContents = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `http://localhost:8080/api/v1/study/${category.firstCategory}/${category.secondCategory}?page=${page}&size=1`
                );
                const data = await response.json();
                setStudyContents(data.content);
                setSelectedContentId(data.content[0].id);
                setTotalPages(data.totalPages);
            } catch (err) {
                setError("데이터를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchStudyContents();
    }, [category, page]);
    const handleNextPage = () => {
        if (page < totalPages - 1) setPage(page + 1);
    };
    const handlePreviousPage = () => {
        if (page > 0) setPage(page - 1);
    };
    const handleMemoChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMemo(event.target.value);
    };
    const handleMemoCheck = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/studyMemo/${selectedContentId}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    alert("로그인 후 이용해주세요.");
                    router.push("http://localhost:3000/login");
                    return;
                }
            }
            const data = await response.json();
            if (data.memoContent) {
                setMemo(data.memoContent); // 가져온 메모 내용으로 상태 업데이트
            } else {
                alert("메모가 없습니다.");
            }

        } catch (error) {
            console.error("사용자 정보를 가져오는 데 실패했습니다:", error);
            return null;
        }
    };

    const handleMemoCreate = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/v1/studyMemo/create/${selectedContentId}`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        content: memo,
                    }),
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    alert("로그인 후 이용해주세요.");
                    router.push("http://localhost:3000/login");
                    return;
                }
            }
            if (response.ok) {
                alert("메모가 저장되었습니다.");
                setMemo("");
            }
        } catch (error) {
            alert("서버와 연결할 수 없습니다.");
        }
    };
    if (loading) {
        return <div>로딩 중...</div>;
    }
    if (error) {
        return <div>{error}</div>;
    }
    return (
        <div className={styles.content}>
            <div className={styles.contentHeader}>
                <div className={styles.categoryInfo}>
                    <p className={styles.firstCategory}>{category.firstCategory}</p>
                    <p className={styles.secondCategory}>{category.secondCategory}</p>
                </div>
                <div className={styles.paginationWrapper}>
                    <div className={styles.pagination}>
                        <button
                            onClick={handlePreviousPage}
                            disabled={page === 0}
                            className={styles.paginationButton}
                        >
                            이전
                        </button>
                        <span className={styles.pageNumber}>
                        {page + 1} / {totalPages}
                    </span>
                        <button
                            onClick={handleNextPage}
                            disabled={page === totalPages - 1}
                            className={styles.paginationButton}
                        >
                            다음
                        </button>
                    </div>
                </div>
            </div>
            <div className={styles.studyContents}>
                {studyContents.length > 0 ? (
                    studyContents.map((content: any, index: number) => (
                        <div key={index}>
                            <input type="hidden" value={content.id}/>
                            <h4 className={styles.contentTitle}>{content.title}</h4>
                            {/** 부모 div에 className을 주어, 안쪽의 ReactMarkdown을 스타일링합니다. */}
                            <div className={styles.contentBody}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {content.body.replace(/<br\s*\/?>/gi, "")}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={styles.noResults}>결과가 없습니다.</p>
                )}
            </div>
            <div className={styles.memoContainer}>
                <p> 나의 메모</p>
                <textarea
                    className={styles.memoInput}
                    placeholder="메모를 입력하세요..."
                    value={memo}
                    onChange={handleMemoChange}
                />
                <div className={styles.memoBtnBox}>
                    <button onClick={handleMemoCreate} className={styles.memoSaveBtn}>
                        저장
                    </button>
                    <button onClick={handleMemoCheck} className={styles.memoSaveBtn}>
                        나의 메모 조회
                    </button>
                </div>
            </div>
        </div>
    );
};
export default StudyContentBody;