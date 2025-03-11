"use client";

import { useState } from "react";
import styles from "../../styles/admin/header.module.css";
import InterviewCreateModal from "./modal/interviewCreateModal";

export default function Header({ onCreate }: { onCreate: (newInterview: any) => void }) {
    const [selectedCreate, setSelectedCreate] = useState<boolean>(false);

    return (
        <div className={styles.headerContainer}>
            <button className={styles.createButton} onClick={() => setSelectedCreate(true)}>
                면접 질문 등록
            </button>

            {selectedCreate && (
                <InterviewCreateModal
                    onClose={() => setSelectedCreate(false)}
                    onCreate={onCreate}
                    headId={null}
                />
            )}
        </div>
    );
}