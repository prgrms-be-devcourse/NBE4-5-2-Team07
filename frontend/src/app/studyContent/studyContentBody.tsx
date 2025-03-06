import React, { useState, useEffect } from "react";
import styles from "@/app/styles/studyContent.module.css";
const DEFAULT_CATEGORY = { firstCategory: "OperatingSystem", secondCategory: "운영체제란?" };

const StudyContentBody = ({ selectedCategory }: { selectedCategory: any }) => {
    const [memo, setMemo] = useState<string | "">("");
    const [selectedContentId, setSelectedContentId] = useState<string | null>(null); // 선택된 content.id 상태
    const [category, setCategory] = useState(selectedCategory || DEFAULT_CATEGORY);
    const [studyContents, setStudyContents] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0); // 페이지 상태
    const [totalPages, setTotalPages] = useState<number>(0); // 전체 페이지 수

    useEffect(() => {
        if (selectedCategory) {
            setCategory(selectedCategory); // selectedCategory가 있으면 설정
            setPage(0); // 페이지를 1로 초기화 (0부터 시작)
        } else {
            setCategory(DEFAULT_CATEGORY);
            setPage(0); // 기본 카테고리일 때 페이지를 1로 초기화
        }
    }, [selectedCategory]); // selectedCategory가 변경될 때만 실행

    useEffect(() => {
        const fetchStudyContents = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `http://localhost:8080/api/v1/study/${category.firstCategory}/${category.secondCategory}?page=${page}&size=1`
                );
                const data = await response.json();
                setStudyContents(data.content); // 받은 데이터 설정
                setTotalPages(data.totalPages); // 전체 페이지 수 설정
            } catch (err) {
                setError("데이터를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchStudyContents();
    }, [category, page]); // selectedCategory 또는 page가 변경되면 데이터 다시 불러옴

    // 페이지 이동 함수
    const handleNextPage = () => {
        if (page < totalPages - 1) setPage(page + 1);
    };

    const handlePreviousPage = () => {
        if (page > 0) setPage(page - 1);
    };

    // 메모 내용 변경 시 상태 업데이트
    const handleMemoChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {

        setMemo(event.target.value);
        console.log(memo);
    };

    // 저장 버튼 클릭 시 호출되는 함수
    const handleMemoCreate = async () => {
        console.log(selectedContentId , memo)
        if (selectedContentId && memo) {
            try {
                const response = await fetch(`http://localhost:8080/api/v1/studyMemo/create/${selectedContentId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        content: memo, // 작성된 메모
                    }),
                });

                if (response.ok) {
                    alert("메모가 저장되었습니다.");
                    setMemo(""); // 메모 저장 후 초기화
                } else {
                    alert("메모 저장에 실패했습니다.");
                }
            } catch (error) {
                alert("서버와 연결할 수 없습니다.");
            }
        } else {
            alert("메모와 콘텐츠를 모두 입력해주세요.");
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
                        <div
                            key={index}
                            className={styles.studyContent}
                            onClick={() => {
                                console.log("Clicked content id:", content.id); // 클릭 시 id가 제대로 전달되는지 확인
                                setSelectedContentId(content.id); // 콘텐츠 클릭 시 선택된 id 설정
                            }} // 콘텐츠 클릭 시 선택된 id 설정
                        >
                            <input type="hidden" value={content.id}/>
                            <h4 className={styles.contentTitle}>{content.title}</h4>
                            <p className={styles.contentBody}>{content.body}</p>
                        </div>
                    ))
                ) : (
                    <p className={styles.noResults}>결과가 없습니다.</p>
                )}
            </div>

            <div className={styles.paginationWrapper}>
                <div className={styles.pagination}>
                    <button onClick={handlePreviousPage} disabled={page === 0} className={styles.paginationButton}>
                        이전
                    </button>
                    <span className={styles.pageNumber}>
                        {page + 1} / {totalPages}
                    </span>
                    <button onClick={handleNextPage} disabled={page === totalPages - 1}
                            className={styles.paginationButton}>
                        다음
                    </button>
                </div>
            </div>

            <div className={styles.memoContainer}>
                <p> 나의 메모</p>
                <textarea
                    className={styles.memoInput}
                    placeholder="메모를 입력하세요..."
                    value={memo} // textarea와 memo 상태 연결
                    onChange={handleMemoChange} // 텍스트 변경 시 상태 업데이트
                />
                <button onClick={handleMemoCreate} className={styles.memoSaveBtn}>
                    저장
                </button>
            </div>
        </div>
    );
};

export default StudyContentBody;
