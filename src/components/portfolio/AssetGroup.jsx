//src/components/portfolio/AssetGroup.jsx

import React from "react";
import { AssetCard } from "./AssetCard";

const formatCurrency = (num, suffix = "₽") =>
  typeof num === "number"
    ? num.toLocaleString("ru-RU", { minimumFractionDigits: 2 }) + ` ${suffix}`
    : "—";

export const AssetGroup = ({ type, assets, groupTotal, groupName }) => {
  return (
    <div className="assetGroup">
      <div className="groupHeader">
        <div className="groupInfo">
          <h3 className="groupTitle">{groupName}</h3>
        </div>
        <div className="groupTotal">
          <span className="groupTotalAmount">{formatCurrency(groupTotal)}</span>
          <span className="groupCount">{assets.length} позиций</span>
        </div>
      </div>

      <div className="assetList">
        {assets.map((asset) => (
          <AssetCard key={asset.portfolioId} asset={asset} />
        ))}
      </div>
    </div>
  );
};
