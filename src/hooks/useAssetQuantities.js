//src/hooks/useAssetQuantities.js
import { useState, useCallback } from "react";

export const useAssetQuantities = () => {
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = useCallback((key, value) => {
    setQuantities((prev) => ({
      ...prev,
      [key]: Math.max(1, Number(value) || 1),
    }));
  }, []);

  const initializeQuantity = useCallback(
    (key) => {
      if (!quantities[key]) {
        setQuantities((prev) => ({
          ...prev,
          [key]: 1,
        }));
      }
    },
    [quantities]
  );

  return {
    quantities,
    handleQuantityChange,
    initializeQuantity,
  };
};
