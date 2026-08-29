"use client";

import { useState, useMemo, useCallback } from "react";

export interface FilterableEvent {
  id: string;
  title: string;
  clientName?: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  color: string;
  category?: string;
  tags?: string[];
  attendees?: string[];
  rawAppointment?: any;
}

export function useCalendarFilters<T extends FilterableEvent>(events: T[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(query);
        const matchesDesc = event.description?.toLowerCase().includes(query);
        const matchesCat = event.category?.toLowerCase().includes(query);
        const matchesClient = event.clientName?.toLowerCase().includes(query);
        const matchesTag = event.tags?.some((t) => t.toLowerCase().includes(query));

        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesClient && !matchesTag) {
          return false;
        }
      }

      // 2. Color Filter
      if (selectedColors.length > 0 && !selectedColors.includes(event.color)) {
        return false;
      }

      // 3. Tag Filter
      if (selectedTags.length > 0) {
        const hasMatchingTag = event.tags?.some((tag) => selectedTags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      // 4. Category Filter
      if (selectedCategories.length > 0 && event.category && !selectedCategories.includes(event.category)) {
        return false;
      }

      return true;
    });
  }, [events, searchQuery, selectedColors, selectedTags, selectedCategories]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedColors.length > 0 ||
    selectedTags.length > 0 ||
    selectedCategories.length > 0;

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedColors([]);
    setSelectedTags([]);
    setSelectedCategories([]);
  }, []);

  const toggleColor = useCallback((colorValue: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorValue) ? prev.filter((c) => c !== colorValue) : [...prev, colorValue]
    );
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    selectedColors,
    setSelectedColors,
    selectedTags,
    setSelectedTags,
    selectedCategories,
    setSelectedCategories,
    filteredEvents,
    hasActiveFilters,
    clearFilters,
    toggleColor,
    toggleTag,
    toggleCategory,
  };
}
