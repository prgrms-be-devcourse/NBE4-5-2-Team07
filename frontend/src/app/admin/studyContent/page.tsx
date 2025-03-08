"use client";

import { useState } from "react";
import styles from "../../styles/admin/page.module.css";
import Sidebar from "./sidebar";
import Content from "./content";

export default function AdminContentPage() {
  const [selectedFirstCategory, setSelectedFirstCategory] = useState<string | null>(null);
  const [selectedSecondCategory, setSelectedSecondCategory] = useState<string | null>(null);

  return (
    <div className={styles.adminContainer}>
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
  );
}