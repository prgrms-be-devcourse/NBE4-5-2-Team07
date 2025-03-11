"use client";

import { useState } from "react";
import styles from "../../styles/admin/page.module.css";
import Header from "./header";
import Sidebar from "./sidebar";
import Content from "./content";

export default function AdminContentPage() {
  const [selectedFirstCategory, setSelectedFirstCategory] = useState<string | null>(null);
  const [selectedSecondCategory, setSelectedSecondCategory] = useState<string | null>(null);
  const [contents, setContents] = useState<any[]>([]);

  const handleCreateContent = (newContent: any) => {
    setContents((prev) => [newContent, ...prev]);
  };

  return (
    <div className={styles.adminContainer}>
      <Header onCreate={handleCreateContent} />

      <div className={styles.mainContainer}>
        <Sidebar
          selectedFirstCategory={selectedFirstCategory}
          setSelectedFirstCategory={setSelectedFirstCategory}
          selectedSecondCategory={selectedSecondCategory}
          setSelectedSecondCategory={setSelectedSecondCategory}
        />
        <Content
          selectedFirstCategory={selectedFirstCategory}
          selectedSecondCategory={selectedSecondCategory}
        />
      </div>
    </div>
  );
}