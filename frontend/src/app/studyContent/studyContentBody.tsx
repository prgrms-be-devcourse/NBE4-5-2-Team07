import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "../styles/studyContent.module.css";
const DEFAULT_CATEGORY = {
    firstCategory: "OperatingSystem",
    secondCategory: "운영체제란?",
};
const StudyContentBody = ({ selectedCategory }: { selectedCategory: any }) => {
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
    const handleMemoCreate = async () => {
        if (selectedContentId && memo) {
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
                if (response.ok) {
                    alert("메모가 저장되었습니다.");
                    setMemo("");
                } else {
                    alert("메모 저장에 실패했습니다.");
                }
            } catch (error) {
                alert("서버와 연결할 수 없습니다.");
            }
        } else {
            alert("메모를 입력해주세요.");
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
            <div className={styles.categoryInfo}>
                <p className={styles.firstCategory}>{category.firstCategory}</p>
                <p className={styles.secondCategory}>{category.secondCategory}</p>
            </div>
            <div className={styles.studyContents}>
                {studyContents.length > 0 ? (
                    studyContents.map((content: any, index: number) => (
                        <div key={index}>
                            <input type="hidden" value={content.id} />
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
            <div className={styles.memoContainer}>
                <p> 나의 메모</p>
                <textarea
                    className={styles.memoInput}
                    placeholder="메모를 입력하세요..."
                    value={memo}
                    onChange={handleMemoChange}
                />
                <button onClick={handleMemoCreate} className={styles.memoSaveBtn}>
                    저장
                </button>
            </div>
        </div>
    );
};
export default StudyContentBody;