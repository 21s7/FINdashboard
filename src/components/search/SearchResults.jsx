//src/components/search/SearchResults.jsx

import React from "react";
import { AssetSearchItem } from "./AssetSearchItem";

export const SearchResults = ({
  filteredAssets,
  isLoading,
  quantities,
  onQuantityChange,
  onAddAsset,
}) => {
  if (isLoading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (filteredAssets.length === 0) {
    return <p>Активы не найдены</p>;
  }

  return (
    <div className="searchResults">
      {filteredAssets.map((asset, index) => {
        const quantityKey = `${asset.type}-${asset.ticker || asset.code || asset.id}`;
        const quantity = quantities[quantityKey] || 1;

        return (
          <AssetSearchItem
            key={`${asset.type}-${asset.ticker || asset.code || asset.id}-${index}`}
            asset={asset}
            quantity={quantity}
            onQuantityChange={onQuantityChange}
            onAddAsset={onAddAsset}
          />
        );
      })}
    </div>
  );
};
