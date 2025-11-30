// src/components/Portfolio.jsx

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeAsset, updateAssetStats } from "../slices/portfolioSlice";
import { usePortfolioGroups } from "../hooks/usePortfolioGroups";
import { AssetGroup } from "./portfolio/AssetGroup";

const Portfolio = ({ savedPortfolioId }) => {
  const dispatch = useDispatch();
  const portfolioAssets = useSelector((state) => state.portfolio.assets);
  const sharesData = useSelector((state) => state.shares.items);

  const groupedAssets = usePortfolioGroups(portfolioAssets);

  // Обновляем статистику для акций при изменении данных
  useEffect(() => {
    portfolioAssets.forEach((asset) => {
      if (asset.type === "share") {
        const shareData = sharesData.find((s) => s.ticker === asset.ticker);
        if (
          shareData &&
          (shareData.yearChangePercent !== asset.yearChangePercent ||
            shareData.yearChangeValue !== asset.yearChangeValue)
        ) {
          dispatch(
            updateAssetStats({
              portfolioId: asset.portfolioId,
              yearChangeValue: shareData.yearChangeValue,
              yearChangePercent: shareData.yearChangePercent,
            })
          );
        }
      }
    });
  }, [sharesData, portfolioAssets, dispatch]);

  return (
    <div className="portfolioView">
      <div className="header">
        <h1 className="title">
          {savedPortfolioId
            ? `📁 Портфель:${savedPortfolioId}`
            : "Мой Портфель"}
        </h1>
      </div>

      <div className="portfolioGrid">
        {Object.entries(groupedAssets).map(([type, groupData]) => (
          <AssetGroup
            key={type}
            type={type}
            assets={groupData.assets}
            groupTotal={groupData.groupTotal}
            groupName={groupData.groupName}
          />
        ))}
      </div>

      {portfolioAssets.length === 0 && (
        <div className="emptyState">
          <div className="emptyIcon">📊</div>
          <h3 className="emptyTitle">Портфель пуст</h3>
          <p className="emptyMessage">
            Добавьте свои первые активы или депозиты, чтобы начать отслеживать
            инвестиции
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(Portfolio);
