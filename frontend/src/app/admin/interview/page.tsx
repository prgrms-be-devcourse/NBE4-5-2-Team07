"use client";

import { useState } from "react";
import styles from "../../styles/admin/page.module.css";
import Sidebar from "./sidebar";
import Content from "./content";

export default function InterviewContentPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);

  return (
    <div className={styles.adminContainer}>
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
  );
}