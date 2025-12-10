// src/components/Portfolio.jsx

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeAsset, updateAssetStats } from "../slices/portfolioSlice";
import { usePortfolioGroups } from "../hooks/usePortfolioGroups";
import { AssetGroup } from "./portfolio/AssetGroup";

const Portfolio = ({ savedPortfolioId, hasUnsavedChanges, onSaveChanges }) => {
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
        <div style={{ flex: 1 }}>
          <h1 className="title">
            {savedPortfolioId ? (
              <>
                <span style={{ marginRight: "0.5rem" }}>📁</span>
                Портфель: {savedPortfolioId}
                {hasUnsavedChanges && (
                  <span
                    style={{
                      marginLeft: "0.75rem",
                      fontSize: "0.75rem",
                      color: "var(--warning-color)",
                      background: "rgba(245, 158, 11, 0.1)",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "var(--border-radius)",
                      fontWeight: "500",
                    }}
                  >
                    ● Есть изменения
                  </span>
                )}
              </>
            ) : (
              "Мой Портфель"
            )}
          </h1>
        </div>

        {savedPortfolioId && hasUnsavedChanges && onSaveChanges && (
          <div style={{ flexShrink: 0 }}>
            <button
              onClick={onSaveChanges}
              style={{
                padding: "0.625rem 1.25rem",
                background: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                color: "var(--primary-color)",
                borderRadius: "var(--border-radius)",
                fontSize: "0.9rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "var(--transition)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(59, 130, 246, 0.15)";
                e.target.style.borderColor = "rgba(59, 130, 246, 0.5)";
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(59, 130, 246, 0.1)";
                e.target.style.borderColor = "rgba(59, 130, 246, 0.3)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              💾 Сохранить изменения
            </button>
          </div>
        )}
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
