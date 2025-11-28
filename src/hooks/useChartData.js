//src/hooks/useChartData.js

import { useMemo } from "react";
import { useSelector } from "react-redux";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#a3a3a3",
  "#f87171",
];

const typeLabels = {
  share: "Акции",
  bond: "Облигации",
  currency: "Валюты",
  crypto: "Криптовалюты",
  metal: "Металлы",
  deposit: "Депозиты",
  realestate: "Недвижимость",
  business: "Бизнес",
};

export const useChartData = (currency) => {
  const assets = useSelector((state) => state.portfolio.assets);
  const exchangeRates = useSelector((state) => state.currency.items);

  const getRateToRub = (code) => {
    const found = exchangeRates.find((c) => c.code === code);
    return found ? found.price / found.nominal : null;
  };

  const convertToCurrency = (rubAmount) => {
    if (currency === "rub") return rubAmount;
    const rate = getRateToRub(currency.toUpperCase());
    return rate ? rubAmount / rate : rubAmount;
  };

  const { chartData, totalValue } = useMemo(() => {
    const sums = {};
    let total = 0;

    assets.forEach((asset) => {
      let assetValue = 0;
      if (asset.type === "deposit") {
        assetValue = asset.value || 0;
      } else {
        const price =
          asset.type === "bond"
            ? asset.pricePercent
            : asset.price || asset.value || 0;
        assetValue =
          asset.type === "bond"
            ? (price / 100) * asset.quantity * 1000
            : price * asset.quantity;
      }

      if (!sums[asset.type]) sums[asset.type] = 0;
      sums[asset.type] += assetValue;
      total += assetValue;
    });

    const data = Object.entries(sums).map(([type, value], index) => {
      const percentage = total > 0 ? (value / total) * 100 : 0;
      return {
        name: typeLabels[type] || type,
        value: percentage,
        absoluteValue: convertToCurrency(value),
        color: COLORS[index % COLORS.length],
      };
    });

    return { chartData: data, totalValue: total };
  }, [assets, currency, exchangeRates]);

  return { chartData, totalValue };
};
