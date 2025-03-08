"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import styles from "../../../styles/admin/modal/contentDetailModal.module.css";

interface ContentDetailModalProps {
  content: {
    title: string;
    firstCategory: string;
    secondCategory: string;
    body: string;
  };
  onClose: () => void;
}

const ContentDetailModal: React.FC<ContentDetailModalProps> = ({ content, onClose }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>{content.title}</h2>
        <p className={styles.modalCategory}>
          {content.firstCategory} / {content.secondCategory}
        </p>

        <div className={styles.modalBody}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {content.body}
          </ReactMarkdown>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.closeButton} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentDetailModal;