//src/hooks/useAssetSearch.js

import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "./useDebounce";
import { useKeywordDetection } from "./useKeywordDetection";

export const useAssetSearch = (
  allAssets,
  depositKeywords,
  realEstateKeywords,
  businessKeywords
) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filteredAssets, setFilteredAssets] = useState([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { showDepositForm, showRealEstateForm, showBusinessForm } =
    useKeywordDetection(
      debouncedSearchTerm,
      depositKeywords,
      realEstateKeywords,
      businessKeywords
    );

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setFilteredAssets([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(() => {
      const searchLower = debouncedSearchTerm.toLowerCase();

      const results = allAssets
        .filter((asset) => {
          const matches = [
            asset.name?.toLowerCase().includes(searchLower),
            asset.ticker?.toLowerCase().includes(searchLower),
            asset.code?.toLowerCase().includes(searchLower),
            asset.id?.toLowerCase().includes(searchLower),
          ];
          return matches.some(Boolean);
        })
        .slice(0, 50);

      setFilteredAssets(results);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timeout);
  }, [debouncedSearchTerm, allAssets]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setIsLoading(true);
  }, []);

  return {
    searchTerm,
    filteredAssets,
    isLoading,
    showDepositForm,
    showRealEstateForm,
    showBusinessForm,
    handleSearchChange,
    setSearchTerm,
  };
};
