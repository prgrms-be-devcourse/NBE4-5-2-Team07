"use client";

import { useEffect, useState } from "react";
import styles from "../../styles/admin/sidebar.module.css";

const API_URL = "http://localhost:8080/api/v1/admin/study";

interface SidebarProps {
  selectedFirstCategory: string | null;
  setSelectedFirstCategory: (category: string) => void;
  selectedSecondCategory: string | null;
  setSelectedSecondCategory: (category: string | null) => void;
}

export default function Sidebar({
  selectedFirstCategory,
  setSelectedFirstCategory,
  selectedSecondCategory,
  setSelectedSecondCategory,
}: SidebarProps) {
  const [categories, setCategories] = useState<{ [key: string]: string[] }>({});
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/all`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("카테고리 목록을 불러오지 못했습니다.");
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        const firstCategoryKeys = Object.keys(data);
        if (firstCategoryKeys.length > 0 && !selectedFirstCategory) {
          setSelectedFirstCategory(firstCategoryKeys[0]);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <aside className={styles.sidebar}>
      <ul className={styles.categoryList}>
        {Object.keys(categories).map((firstCategory) => (
          <div key={firstCategory} className={styles.categoryWrapper}>
            <li className={styles.categoryItem}>
              <button
                className={`${styles.categoryButton} ${firstCategory === selectedFirstCategory ? styles.active : ""
                  }`}
                onClick={() => {
                  if (openCategory === firstCategory) {
                    setOpenCategory(null);
                  } else {
                    setSelectedFirstCategory(firstCategory);
                    setSelectedSecondCategory(null);
                    setOpenCategory(firstCategory);
                  }
                }}
              >
                {firstCategory}
                <span className={styles.arrowIcon}>
                  {openCategory === firstCategory ? "▲" : "▼"}
                </span>
              </button>
            </li>
            {openCategory === firstCategory && categories[firstCategory].length > 0 && (
              <ul className={styles.dropdownMenu}>
                {categories[firstCategory].map((secondCategory) => (
                  <li
                    key={secondCategory}
                    className={styles.dropdownItem}
                    onClick={() => setSelectedSecondCategory(secondCategory)}
                  >
                    {secondCategory}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </ul>
    </aside>
  );
}