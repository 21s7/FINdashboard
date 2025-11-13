// src/components/Portfolio.jsx
import React, { useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeAsset, updateAssetStats } from "../slices/portfolioSlice";

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
};

const typeIcons = {
  share: "📈",
  bond: "📊",
  currency: "💱",
  crypto: "₿",
  metal: "🥇",
  deposit: "🏦",
  realestate: "🏠",
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
    <div>
      <div>
        <h1>Мой Портфель</h1>
        {/* PortfolioStats теперь будет вставляться в App.js отдельно */}
      </div>

      <div>
        {Object.entries(grouped).map(([type, assets]) => {
          const groupTotal = assets.reduce((sum, asset) => {
            if (asset.type === "deposit") return sum + (asset.value || 0);

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
            <div key={type}>
              <div>
                <div>
                  <span>{typeIcons[type]}</span>
                  <h3>{typeNames[type] || type}</h3>
                </div>
                <div>
                  <span>{formatCurrency(groupTotal)}</span>
                  <span>{assets.length} позиций</span>
                </div>
              </div>

              <div>
                {assets.map((asset) => {
                  let total = 0;
                  if (asset.type === "deposit") {
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
                    <div key={asset.portfolioId}>
                      <div>
                        <div>{asset.name}</div>

                        {asset.type !== "deposit" ? (
                          <div>
                            <span>
                              {asset.quantity}{" "}
                              {asset.type === "metal"
                                ? "г"
                                : asset.type === "currency"
                                  ? "ед."
                                  : "шт"}
                            </span>
                            <span>•</span>
                            <span>
                              {asset.type === "bond"
                                ? `${asset.pricePercent.toFixed(3)}%`
                                : formatCurrency(asset.price || asset.value)}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <div>Ставка: {asset.rate}%</div>
                            <div>Срок: {asset.termMonths} мес.</div>
                          </div>
                        )}
                      </div>

                      <div>
                        <div>{formatCurrency(total)}</div>
                        <div>
                          доход {formatPercentage(asset.yearChangePercent)}
                        </div>
                      </div>

                      <button
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
        <div>
          <div>📊</div>
          <h3>Портфель пуст</h3>
          <p>
            Добавьте свои первые активы или депозиты, чтобы начать отслеживать
            инвестиции
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(Portfolio);
