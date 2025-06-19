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

const Portfolio = () => {
  const dispatch = useDispatch();
  const portfolioAssets = useSelector((state) => state.portfolio.assets);

  const grouped = useMemo(
    () => groupByType(portfolioAssets),
    [portfolioAssets]
  );

  return (
    <div className={styles.portfolioView}>
      <h2 className={styles.title}>Мой Портфель</h2>

      {Object.entries(grouped).map(([type, assets]) => (
        <div key={type} className={styles.assetGroup}>
          <h3 className={styles.groupTitle}>{typeNames[type] || type}</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Компания</th>
                <th>Кол-во</th>
                <th>Цена за шт</th>
                <th>Общая цена</th>
                <th>Статистика за год</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => {
                const unitPrice =
                  asset.type === "bond"
                    ? asset.pricePercent
                    : asset.price || asset.value || 0;

                const total =
                  asset.type === "bond"
                    ? (unitPrice / 100) * asset.quantity * 1000
                    : unitPrice * asset.quantity;

                return (
                  <tr key={asset.portfolioId} className={styles.row}>
                    <td>{asset.name}</td>
                    <td>
                      {asset.quantity}{" "}
                      {asset.type === "metal"
                        ? "г"
                        : asset.type === "currency"
                          ? "ед."
                          : "шт"}
                    </td>
                    <td>
                      {asset.type === "bond"
                        ? `${unitPrice.toFixed(3)}%`
                        : formatCurrency(unitPrice)}
                    </td>
                    <td>{formatCurrency(total)}</td>
                    <td>
                      {asset.yearChangeValue !== undefined &&
                      asset.yearChangePercent !== undefined
                        ? `${formatCurrency(asset.yearChangeValue)} (${formatPercentage(
                            asset.yearChangePercent
                          )})`
                        : "—"}
                    </td>
                    <td>
                      <button
                        className={styles.removeButton}
                        onClick={() =>
                          dispatch(
                            removeAsset({ portfolioId: asset.portfolioId })
                          )
                        }
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      {portfolioAssets.length === 0 && (
        <p className={styles.emptyMessage}>Портфель пуст.</p>
      )}
    </div>
  );
};

export default React.memo(Portfolio);
