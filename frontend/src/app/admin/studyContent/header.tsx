"use client";

import { useState } from "react";
import styles from "../../styles/admin/header.module.css";
import ContentCreateModal from "./modal/contentCreateModal";

export default function Header({ onCreate }: { onCreate: (newContent: any) => void }) {
    const [selectedCreate, setSelectedCreate] = useState<boolean>(false);

    return (
        <div className={styles.headerContainer}>
            <button
                className={styles.createButton}
                onClick={() => setSelectedCreate(true)}
            >
                콘텐츠 등록
            </button>

            {selectedCreate && (
                <ContentCreateModal
                    onClose={() => setSelectedCreate(false)}
                    onCreate={onCreate}
                />
            )}
        </div>
    );
}
