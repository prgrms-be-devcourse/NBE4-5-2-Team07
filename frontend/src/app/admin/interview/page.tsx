"use client";

import { useState } from "react";
import styles from "../../styles/admin/page.module.css";
import Header from "./header";
import Sidebar from "./sidebar";
import Content from "./content";

export default function InterviewContentPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [interviewContents, setInterviewContents] = useState<any[]>([]);

  const handleCreateInterview = (newInterview: any) => {
    setInterviewContents((prev) => [newInterview, ...prev]);
  };

  return (
    <div className={styles.adminContainer}>
      <Header onCreate={handleCreateInterview} />

      <div className={styles.mainContainer}>
        <Sidebar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedKeyword={selectedKeyword}
          setSelectedKeyword={setSelectedKeyword}
        />
        <Content
          selectedCategory={selectedCategory}
          selectedKeyword={selectedKeyword}
        />
      </div>
    </div>
  );
}