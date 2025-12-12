"use client";

import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Filters = {
  search: string;
  level: string;
  category: string;
  isPublished: string;
};

type Props = {
  filters: Filters;
  onChange: React.Dispatch<React.SetStateAction<Filters>>;
};

const statusOptions = [
  { label: "All status", value: "all" },
  { label: "Published", value: "true" },
  { label: "Draft", value: "false" },
];

const levelOptions = [
  { label: "All levels", value: "all" },
  { label: "Beginner", value: "BEGINNER" },
  { label: "Intermediate", value: "INTERMEDIATE" },
  { label: "Advanced", value: "ADVANCED" },
];

export function CourseFilters({ filters, onChange }: Props) {
  const memoizedOnChange = useMemo(() => onChange, [onChange]);

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <Input
        placeholder="Search"
        className="md:w-48"
        value={filters.search}
        onChange={(event) =>
          memoizedOnChange((previous) => ({
            ...previous,
            search: event.target.value,
          }))
        }
      />
      <Select
        value={filters.isPublished || "all"}
        onValueChange={(value) =>
          memoizedOnChange((previous) => ({
            ...previous,
            isPublished: value === "all" ? "" : value,
          }))
        }
      >
        <SelectTrigger className="md:w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder="Category"
        className="md:w-36"
        value={filters.category}
        onChange={(event) =>
          memoizedOnChange((previous) => ({
            ...previous,
            category: event.target.value,
          }))
        }
      />
      <Select
        value={filters.level || "all"}
        onValueChange={(value) =>
          memoizedOnChange((previous) => ({
            ...previous,
            level: value === "all" ? "" : value,
          }))
        }
      >
        <SelectTrigger className="md:w-36">
          <SelectValue placeholder="Level" />
        </SelectTrigger>
        <SelectContent>
          {levelOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
