// src/components/TotalValue.jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";

const CURRENCY_SYMBOLS = {
  rub: "₽",
  usd: "$",
  eur: "€",
};

const CURRENCY_ORDER = ["rub", "usd", "eur"];

const TotalValue = ({ currency, onCurrencyChange }) => {
  const assets = useSelector((state) => state.portfolio.assets);
  const exchangeRates = useSelector((state) => state.currency.items);

  const getRateToRub = (code) => {
    const found = exchangeRates.find((c) => c.code === code);
    return found ? found.price / found.nominal : null;
  };

  const convertToCurrency = (rubAmount) => {
    if (currency === "rub") return rubAmount;
    const rate = getRateToRub(currency.toUpperCase());
    return rate ? rubAmount / rate : rubAmount;
  };

  const totalValue = useMemo(() => {
    return assets.reduce((sum, asset) => {
      if (asset.type === "deposit") {
        return sum + (asset.value || 0);
      }

      const unitPrice =
        asset.type === "bond"
          ? asset.pricePercent
          : asset.price || asset.value || 0;
      const total =
        asset.type === "bond"
          ? (unitPrice / 100) * asset.quantity * 1000
          : unitPrice * asset.quantity;
      return sum + total;
    }, 0);
  }, [assets]);

  const convertedTotal = useMemo(
    () => convertToCurrency(totalValue),
    [totalValue, currency, exchangeRates]
  );

  const formatCurrency = (num) => {
    if (typeof num !== "number") return "—";

    const formattedNum = num.toLocaleString("ru-RU", {
      minimumFractionDigits: 2,
    });
    const symbol = CURRENCY_SYMBOLS[currency] || "";

    return `${formattedNum} ${symbol}`;
  };

  const handleTotalClick = () => {
    const currentIndex = CURRENCY_ORDER.indexOf(currency);
    const nextIndex = (currentIndex + 1) % CURRENCY_ORDER.length;
    onCurrencyChange(CURRENCY_ORDER[nextIndex]);
  };

  return (
    <div className="card-shadow" style={{ height: "100%" }}>
      <div
        style={{
          padding: "1.5rem",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <span
            style={{
              fontSize: "1rem",
              color: "var(--dark-text-secondary)",
              fontWeight: "500",
            }}
          >
            Общая стоимость портфеля
          </span>
        </div>

        <div className="total-value-wrapper">
          <span
            className="total-amount"
            onClick={handleTotalClick}
            style={{
              cursor: "pointer",
              padding: "1rem",
              borderRadius: "var(--border-radius)",
              transition: "var(--transition)",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "var(--dark-surface-hover)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
            title="Нажмите для смены валюты"
          >
            {formatCurrency(convertedTotal)}
          </span>
        </div>

        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--dark-text-tertiary)",
            marginTop: "1rem",
          }}
        >
          Нажмите на сумму для смены валюты
        </div>
      </div>
    </div>
  );
};

export default React.memo(TotalValue);
