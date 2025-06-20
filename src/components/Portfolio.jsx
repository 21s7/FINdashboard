import React, { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeAsset } from "../slices/portfolioSlice";
import styles from "../assets/styles/Portfolio.module.scss";

// Форматирование чисел и процентов
const formatCurrency = (num, suffix = "₽") =>
  typeof num === "number"
    ? num.toLocaleString("ru-RU", { minimumFractionDigits: 2 }) + ` ${suffix}`
    : "—";

const formatPercentage = (value) =>
  `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;

// Группировка активов по типу
const groupByType = (assets) => {
  const groups = {};
  assets.forEach((a) => {
    if (!groups[a.type]) groups[a.type] = [];
    groups[a.type].push(a);
  });
  return groups;
};

// Названия типов на русском
const typeNames = {
  share: "Акции",
  bond: "Облигации",
  currency: "Валюты",
  crypto: "Криптовалюты",
  metal: "Драгоценные металлы",
};

// Иконки для типов активов
const typeIcons = {
  share: "📈",
  bond: "📊",
  currency: "💱",
  crypto: "₿",
  metal: "🥇",
};

const Portfolio = () => {
  const dispatch = useDispatch();
  const portfolioAssets = useSelector((state) => state.portfolio.assets);

  const grouped = useMemo(
    () => groupByType(portfolioAssets),
    [portfolioAssets]
  );

  // Подсчет общей стоимости портфеля
  const totalPortfolioValue = useMemo(() => {
    return portfolioAssets.reduce((total, asset) => {
      const unitPrice =
        asset.type === "bond"
          ? asset.pricePercent
          : asset.price || asset.value || 0;

      const assetTotal =
        asset.type === "bond"
          ? (unitPrice / 100) * asset.quantity * 1000
          : unitPrice * asset.quantity;

      return total + assetTotal;
    }, 0);
  }, [portfolioAssets]);

  return (
    <div className={styles.portfolioView}>
      <div className={styles.header}>
        <h1 className={styles.title}>Мой Портфель</h1>
        <div className={styles.totalValue}>
          <span className={styles.totalLabel}>Общая стоимость</span>
          <span className={styles.totalAmount}>
            {formatCurrency(totalPortfolioValue)}
          </span>
        </div>
      </div>

      <div className={styles.portfolioGrid}>
        {Object.entries(grouped).map(([type, assets]) => {
          const groupTotal = assets.reduce((sum, asset) => {
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
            <div key={type} className={styles.assetGroup}>
              <div className={styles.groupHeader}>
                <div className={styles.groupInfo}>
                  <span className={styles.groupIcon}>{typeIcons[type]}</span>
                  <h3 className={styles.groupTitle}>
                    {typeNames[type] || type}
                  </h3>
                </div>
                <div className={styles.groupTotal}>
                  <span className={styles.groupTotalAmount}>
                    {formatCurrency(groupTotal)}
                  </span>
                  <span className={styles.groupCount}>
                    {assets.length} позиций
                  </span>
                </div>
              </div>

              <div className={styles.assetList}>
                {assets.map((asset) => {
                  const unitPrice =
                    asset.type === "bond"
                      ? asset.pricePercent
                      : asset.price || asset.value || 0;

                  const total =
                    asset.type === "bond"
                      ? (unitPrice / 100) * asset.quantity * 1000
                      : unitPrice * asset.quantity;

                  const isPositive = asset.yearChangePercent > 0;
                  const isNegative = asset.yearChangePercent < 0;

                  return (
                    <div key={asset.portfolioId} className={styles.assetCard}>
                      <div className={styles.assetInfo}>
                        <div className={styles.assetName}>{asset.name}</div>
                        <div className={styles.assetDetails}>
                          <span className={styles.quantity}>
                            {asset.quantity}{" "}
                            {asset.type === "metal"
                              ? "г"
                              : asset.type === "currency"
                                ? "ед."
                                : "шт"}
                          </span>
                          <span className={styles.separator}>•</span>
                          <span className={styles.unitPrice}>
                            {asset.type === "bond"
                              ? `${unitPrice.toFixed(3)}%`
                              : formatCurrency(unitPrice)}
                          </span>
                        </div>
                      </div>

                      <div className={styles.assetValues}>
                        <div className={styles.totalValue}>
                          {formatCurrency(total)}
                        </div>
                        {asset.yearChangeValue !== undefined &&
                        asset.yearChangePercent !== undefined ? (
                          <div
                            className={`${styles.change} ${
                              isPositive
                                ? styles.positive
                                : isNegative
                                  ? styles.negative
                                  : styles.neutral
                            }`}
                          >
                            <span className={styles.changeValue}>
                              {formatCurrency(asset.yearChangeValue)}
                            </span>
                            <span className={styles.changePercent}>
                              ({formatPercentage(asset.yearChangePercent)})
                            </span>
                          </div>
                        ) : (
                          <div className={styles.noChange}>—</div>
                        )}
                      </div>

                      <button
                        className={styles.removeButton}
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
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <h3 className={styles.emptyTitle}>Портфель пуст</h3>
          <p className={styles.emptyMessage}>
            Добавьте свои первые активы, чтобы начать отслеживать инвестиции
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(Portfolio);
