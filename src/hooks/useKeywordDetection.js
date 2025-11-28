//src/hooks/useKeywordDetection.js

import { useMemo } from "react";

export const useKeywordDetection = (
  searchTerm,
  depositKeywords,
  realEstateKeywords,
  businessKeywords
) => {
  return useMemo(() => {
    if (!searchTerm) {
      return {
        showDepositForm: false,
        showRealEstateForm: false,
        showBusinessForm: false,
      };
    }

    const searchLower = searchTerm.toLowerCase();

    const showDepositForm = depositKeywords.some((keyword) =>
      searchLower.includes(keyword.toLowerCase())
    );
    const showRealEstateForm = realEstateKeywords.some((keyword) =>
      searchLower.includes(keyword.toLowerCase())
    );
    const showBusinessForm = businessKeywords.some((keyword) =>
      searchLower.includes(keyword.toLowerCase())
    );

    return {
      showDepositForm,
      showRealEstateForm,
      showBusinessForm,
    };
  }, [searchTerm, depositKeywords, realEstateKeywords, businessKeywords]);
};
