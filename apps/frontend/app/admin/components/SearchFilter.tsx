"use client";

import { Search } from "lucide-react";
import styles from "./SearchFilter.module.css";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  resultCount?: number;
}

export default function SearchFilter({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters = [],
  filterValues = {},
  onFilterChange,
  resultCount,
}: SearchFilterProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.searchBox}>
        <span className={styles.searchIcon}>
          <Search size={14} />
        </span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label={searchPlaceholder}
        />
      </div>

      {filters.map((filter) => (
        <select
          key={filter.key}
          className={styles.filterSelect}
          value={filterValues[filter.key] || ""}
          onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
          aria-label={filter.label}
        >
          <option value="">{filter.label}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}

      {resultCount !== undefined && (
        <span className={styles.resultCount}>
          {resultCount} resultado{resultCount !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
