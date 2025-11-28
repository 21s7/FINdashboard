//src/hooks/usePortfolioGroups.js

import { useMemo } from "react";

const typeNames = {
  share: "Акции",
  bond: "Облигации",
  currency: "Валюты",
  crypto: "Криптовалюты",
  metal: "Драгоценные металлы",
  deposit: "Депозиты",
  realestate: "Недвижимость",
  business: "Бизнес",
};

export const usePortfolioGroups = (assets) => {
  return useMemo(() => {
    const groups = {};

    // Сначала группируем активы по типам
    assets.forEach((a) => {
      if (!groups[a.type]) groups[a.type] = [];
      groups[a.type].push(a);
    });

    // Затем добавляем метаданные для каждой группы
    Object.entries(groups).forEach(([type, groupAssets]) => {
      const groupTotal = groupAssets.reduce((sum, asset) => {
        if (["deposit", "realestate", "business"].includes(asset.type)) {
          return sum + (asset.value || 0);
        }

        const unitPrice =
          asset.type === "bond"
            ? asset.pricePercent
            : asset.price || asset.value || 0;
        const assetTotal =
          asset.type === "bond"
            ? (unitPrice / 100) * asset.quantity * 1000
            : unitPrice * asset.quantity;
        return sum + assetTotal;
      }, 0);

      // Сохраняем активы и метаданные
      groups[type] = {
        assets: groupAssets,
        groupTotal,
        groupName: typeNames[type] || type,
      };
    });

    return groups;
  }, [assets]);
};
