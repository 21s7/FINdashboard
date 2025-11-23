// src/components/Portfolio.jsx

import React, { useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeAsset, updateAssetStats } from "../slices/portfolioSlice";

// Импортируем дефолтную иконку
import defaultIcon from "../assets/img/defoult.png";

const formatCurrency = (num, suffix = "₽") =>
  typeof num === "number"
    ? num.toLocaleString("ru-RU", { minimumFractionDigits: 2 }) + ` ${suffix}`
    : "—";

const formatPercentage = (value) => {
  if (value === undefined || value === null) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
};

const groupByType = (assets) => {
  const groups = {};
  assets.forEach((a) => {
    if (!groups[a.type]) groups[a.type] = [];
    groups[a.type].push(a);
  });
  return groups;
};

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

// Компонент для отображения иконки актива
const AssetIcon = ({ asset, className = "" }) => {
  // Для облигаций используем дефолтную иконку России
  if (asset.type === "bond") {
    return (
      <div className={`asset-icon-default ${className}`}>
        <img
          src="https://commons.wikimedia.org/wiki/Special:FilePath/Coat_of_Arms_of_the_Russian_Federation.svg"
          alt="Russian Federation"
          className="default-icon-img"
        />
      </div>
    );
  }
  const showDefaultIcon =
    !asset.iconUrl || asset.iconUrl === "—" || asset.iconUrl === "";

  if (showDefaultIcon) {
    return (
      <div className={`asset-icon-default ${className}`}>
        <img src={defaultIcon} alt="Default" className="default-icon-img" />
      </div>
    );
  }

  const handleImageError = (e) => {
    // Если иконка не загружается, заменяем на дефолтную
    e.target.style.display = "none";
    const nextSibling = e.target.nextSibling;
    if (nextSibling) {
      nextSibling.style.display = "block";
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <img
        src={asset.iconUrl}
        alt={asset.name}
        className={`asset-icon ${className}`}
        onError={handleImageError}
      />
      <div
        className={`asset-icon-default ${className}`}
        style={{ display: "none" }}
      >
        <img src={defaultIcon} alt="Default" className="default-icon-img" />
      </div>
    </div>
  );
};

const Portfolio = () => {
  const dispatch = useDispatch();
  const portfolioAssets = useSelector((state) => state.portfolio.assets);
  const sharesData = useSelector((state) => state.shares.items);

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

  const grouped = useMemo(
    () => groupByType(portfolioAssets),
    [portfolioAssets]
  );

  return (
    <div className="portfolioView">
      <div className="header">
        <h1 className="title">Мой Портфель</h1>
      </div>

      <div className="portfolioGrid">
        {Object.entries(grouped).map(([type, assets]) => {
          const groupTotal = assets.reduce((sum, asset) => {
            if (
              asset.type === "deposit" ||
              asset.type === "realestate" ||
              asset.type === "business"
            ) {
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

          return (
            <div key={type} className="assetGroup">
              <div className="groupHeader">
                <div className="groupInfo">
                  <h3 className="groupTitle">{typeNames[type] || type}</h3>
                </div>
                <div className="groupTotal">
                  <span className="groupTotalAmount">
                    {formatCurrency(groupTotal)}
                  </span>
                  <span className="groupCount">{assets.length} позиций</span>
                </div>
              </div>

              <div className="assetList">
                {assets.map((asset) => {
                  let total = 0;
                  if (
                    asset.type === "deposit" ||
                    asset.type === "realestate" ||
                    asset.type === "business"
                  ) {
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

                  return (
                    <div key={asset.portfolioId} className="assetCard">
                      <div className="assetInfo">
                        {/* Добавляем иконку для всех активов */}
                        <div className="assetHeader">
                          <AssetIcon asset={asset} className="assetIcon" />
                          <div className="assetName">{asset.name}</div>
                        </div>

                        {asset.type === "deposit" ? (
                          <div className="depositDetails">
                            <div>Ставка: {asset.rate}%</div>
                            <div>Срок: {asset.termMonths} мес.</div>
                          </div>
                        ) : asset.type === "realestate" ? (
                          <div className="realestateDetails">
                            <div>Тип: {asset.category}</div>
                            {asset.address && asset.address !== "Не указан" && (
                              <div>Адрес: {asset.address}</div>
                            )}
                            {asset.yieldPercent > 0 && (
                              <div>Доходность: {asset.yieldPercent}%</div>
                            )}
                          </div>
                        ) : asset.type === "business" ? (
                          <div className="businessDetails">
                            <div>Тип: {asset.businessType}</div>
                            {asset.monthlyProfit > 0 && (
                              <div>
                                Прибыль: {formatCurrency(asset.monthlyProfit)}
                                /мес
                              </div>
                            )}
                            {asset.profitMargin > 0 && (
                              <div>Маржинальность: {asset.profitMargin}%</div>
                            )}
                          </div>
                        ) : (
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
                        )}
                      </div>

                      <div className="assetValues">
                        <div className="totalValue">
                          {formatCurrency(total)}
                        </div>
                        <div
                          className={`change ${asset.yearChangePercent >= 0 ? "positive" : "negative"}`}
                        >
                          доход {formatPercentage(asset.yearChangePercent)}
                        </div>
                      </div>

                      <button
                        className="removeButton"
                        onClick={() =>
                          dispatch(
                            removeAsset({ portfolioId: asset.portfolioId })
                          )
                        }
                        aria-label="Удалить актив"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
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
