//src/components/portfolio/AssetCard.jsx

import React from "react";
import { useDispatch } from "react-redux";
import { removeAsset } from "../../slices/portfolioSlice";
import AssetIcon from "./AssetIcon";

const formatCurrency = (num, suffix = "₽") =>
  typeof num === "number"
    ? num.toLocaleString("ru-RU", { minimumFractionDigits: 2 }) + ` ${suffix}`
    : "—";

const formatPercentage = (value) => {
  if (value === undefined || value === null) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
};

export const AssetCard = ({ asset }) => {
  const dispatch = useDispatch();

  let total = 0;
  if (["deposit", "realestate", "business"].includes(asset.type)) {
    total = asset.value || 0;
  } else {
    const unitPrice =
      asset.type === "bond"
        ? asset.pricePercent
        : asset.price || asset.value || 0;
    total =
      asset.type === "bond"
        ? (unitPrice / 100) * asset.quantity * 1000
        : unitPrice * asset.quantity;
  }

  const renderDetails = () => {
    switch (asset.type) {
      case "deposit":
        return (
          <div className="depositDetails">
            <div>Ставка: {asset.rate}%</div>
            <div>Срок: {asset.termMonths} мес.</div>
          </div>
        );
      case "realestate":
        return (
          <div className="realestateDetails">
            <div>Тип: {asset.category}</div>
            {asset.address && asset.address !== "Не указан" && (
              <div>Адрес: {asset.address}</div>
            )}
            {asset.yieldPercent > 0 && (
              <div>Доходность: {asset.yieldPercent}%</div>
            )}
          </div>
        );
      case "business":
        return (
          <div className="businessDetails">
            <div>Тип: {asset.businessType}</div>
            {asset.monthlyProfit > 0 && (
              <div>Прибыль: {formatCurrency(asset.monthlyProfit)}/мес</div>
            )}
            {asset.profitMargin > 0 && (
              <div>Маржинальность: {asset.profitMargin}%</div>
            )}
          </div>
        );
      default:
        return (
          <div className="assetDetails">
            <span className="quantity">
              {asset.quantity}{" "}
              {asset.type === "metal"
                ? "г"
                : asset.type === "currency"
                  ? "ед."
                  : "шт"}
            </span>
            <span className="separator">•</span>
            <span className="unitPrice">
              {asset.type === "bond"
                ? `${asset.pricePercent.toFixed(3)}%`
                : formatCurrency(asset.price || asset.value)}
            </span>
          </div>
        );
    }
  };

  return (
    <div className="assetCard">
      <div className="assetInfo">
        <div className="assetHeader">
          <AssetIcon asset={asset} className="assetIcon" />
          <div className="assetName">{asset.name}</div>
        </div>
        {renderDetails()}
      </div>

      <div className="assetValues">
        <div className="totalValue">{formatCurrency(total)}</div>
        <div
          className={`change ${asset.yearChangePercent >= 0 ? "positive" : "negative"}`}
        >
          доход {formatPercentage(asset.yearChangePercent)}
        </div>
      </div>

      <button
        className="removeButton"
        onClick={() =>
          dispatch(removeAsset({ portfolioId: asset.portfolioId }))
        }
        aria-label="Удалить актив"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </button>
    </div>
  );
};
