"use client";

import { useEffect, useState } from "react";
import styles from "../../styles/admin/sidebar.module.css";

const API_URL = "http://localhost:8080/api/v1/admin/interview";

interface SidebarProps {
  selectedCategory: string | null;
  setSelectedCategory: (category: string) => void;
  selectedKeyword: string | null;
  setSelectedKeyword: (keyword: string | null) => void;
}

export default function Sidebar({
  selectedCategory,
  setSelectedCategory,
  selectedKeyword,
  setSelectedKeyword,
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
        if (firstCategoryKeys.length > 0 && !selectedCategory) {
          setSelectedCategory(firstCategoryKeys[0]);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <aside className={styles.sidebar}>
      <ul className={styles.categoryList}>
        {Object.keys(categories).map((category) => (
          <div key={category} className={styles.categoryWrapper}>
            <li className={styles.categoryItem}>
              <button
                className={`${styles.categoryButton} ${category === selectedCategory ? styles.active : ""
                  }`}
                onClick={() => {
                  if (openCategory === category) {
                    setOpenCategory(null);
                  } else {
                    setSelectedCategory(category);
                    setSelectedKeyword(null);
                    setOpenCategory(category);
                  }
                }}
              >
                {category}
                <span className={styles.arrowIcon}>
                  {openCategory === category ? "▲" : "▼"}
                </span>
              </button>
            </li>
            {openCategory === category && categories[category].length > 0 && (
              <ul className={styles.dropdownMenu}>
                {categories[category].map((keyword) => (
                  <li
                    key={keyword}
                    className={styles.dropdownItem}
                    onClick={() => setSelectedKeyword(keyword)}
                  >
                    {keyword}
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