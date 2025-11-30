//src/components/search/AssetSearchItem.jsx

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addAsset } from "../../slices/portfolioSlice";
import AssetIcon from "../portfolio/AssetIcon";

const formatPercentage = (value) => {
  if (value === undefined || value === null) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
};

const getAssetTypeInRussian = (type) => {
  const types = {
    share: "Акции",
    bond: "Облигации",
    currency: "Валюты",
    crypto: "Криптовалюты",
    metal: "Драгоценные металлы",
    business: "Бизнес",
  };
  return types[type] || type;
};

const formatPrice = (asset) => {
  if (!asset) return "не торгуется";
  const price =
    asset.type === "bond"
      ? asset.pricePercent
      : ["share", "crypto", "metal"].includes(asset.type)
        ? asset.price
        : asset.type === "currency"
          ? asset.value
          : null;

  if (price === null || price === "—") return "не торгуется";

  return asset.type === "bond"
    ? `${price.toFixed(2)}%`
    : `${price} ₽${asset.type === "metal" ? "/г" : ""}`;
};

export const AssetSearchItem = ({
  asset,
  quantity,
  onQuantityChange,
  onAddAsset,
}) => {
  const [hovered, setHovered] = useState(false);
  const displayPrice = formatPrice(asset);
  const typeRussian = getAssetTypeInRussian(asset.type);
  const quantityKey = `${asset.type}-${asset.ticker || asset.code || asset.id}`;

  return (
    <div
      className="assetItem smooth-appear"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="assetInfo">
        <div className="assetHeader">
          <AssetIcon asset={asset} className="assetIcon" />
          <div className="assetName truncate">
            {asset.name} ({asset.ticker || asset.code || asset.id})
          </div>
        </div>
        <div className="assetType">{typeRussian}</div>
        <div className="assetPrice">{displayPrice}</div>
        <div
          className={`assetChange ${asset.yearChangePercent >= 0 ? "positive" : "negative"}`}
        >
          {asset.type === "bond" ? "доходность" : "за день"}{" "}
          {formatPercentage(asset.yearChangePercent)}
        </div>
      </div>

      {displayPrice !== "не торгуется" && hovered && (
        <div className="assetControls">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => onQuantityChange(quantityKey, e.target.value)}
            className="quantityInput"
          />
          <button onClick={() => onAddAsset(asset)} className="addButton">
            Добавить
          </button>
        </div>
      )}
    </div>
  );
};
