// src/components/Portfolio.jsx

import React, { useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeAsset, updateAssetStats } from "../slices/portfolioSlice";

// Импортируем все иконки
import defaultIcon from "../assets/img/defoultIcon.png";
import defaultBusiness from "../assets/img/defoultBuisnes.png";
import defaultDeposit from "../assets/img/defoultDeposit.png";
import defaultRealEstate from "../assets/img/defoultRealEstate.png";
import goldIcon from "../assets/img/gold.png";
import silverIcon from "../assets/img/silver.png";
import platinumIcon from "../assets/img/platinum.png";
import palladiumIcon from "../assets/img/palladium.png";
import ruBondsIcon from "../assets/img/RuBonds.png";

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
  // Для облигаций ОФЗ используем специальную иконку
  if (asset.type === "bond") {
    // Проверяем, является ли это ОФЗ
    const isOFZ =
      asset.name?.includes("ОФЗ") ||
      asset.ticker?.includes("OFZ") ||
      asset.name?.toLowerCase().includes("федерал");

    if (isOFZ) {
      return (
        <div className={`asset-icon-default bond-ofz-icon ${className}`}>
          <img src={ruBondsIcon} alt="OFZ Bond" className="default-icon-img" />
        </div>
      );
    }

    // Для остальных облигаций - дефолтная иконка
    return (
      <div className={`asset-icon-default ${className}`}>
        <img src={defaultIcon} alt="Bond" className="default-icon-img" />
      </div>
    );
  }

  // Для металлов используем специальные иконки
  if (asset.type === "metal") {
    const metalIcons = {
      XAU: goldIcon,
      XAG: silverIcon,
      XPT: platinumIcon,
      XPD: palladiumIcon,
    };

    const metalIcon = metalIcons[asset.ticker];
    if (metalIcon) {
      return (
        <div className={`asset-icon-default metal-icon ${className}`}>
          <img src={metalIcon} alt={asset.name} className="default-icon-img" />
        </div>
      );
    }
  }

  // Для депозитов, недвижимости и бизнеса используем специальные иконки
  const customIcons = {
    deposit: defaultDeposit,
    realestate: defaultRealEstate,
    business: defaultBusiness,
  };

  if (customIcons[asset.type]) {
    return (
      <div className={`asset-icon-default ${className}`}>
        <img
          src={customIcons[asset.type]}
          alt={asset.type}
          className="default-icon-img"
        />
      </div>
    );
  }

  // Для остальных активов проверяем наличие иконки
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
    const parent = e.target.parentElement;
    const defaultIconDiv = parent.querySelector(".asset-icon-default");
    if (defaultIconDiv) {
      defaultIconDiv.style.display = "flex";
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
