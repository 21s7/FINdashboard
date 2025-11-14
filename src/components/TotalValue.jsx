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

  const formatCurrency = (num) =>
    typeof num === "number"
      ? num.toLocaleString("ru-RU", { minimumFractionDigits: 2 }) +
        ` ${CURRENCY_SYMBOLS[currency] || ""}`
      : "—";

  const handleTotalClick = () => {
    const currentIndex = CURRENCY_ORDER.indexOf(currency);
    const nextIndex = (currentIndex + 1) % CURRENCY_ORDER.length;
    onCurrencyChange(CURRENCY_ORDER[nextIndex]);
  };

  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "15px",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <span style={{ fontSize: "16px", fontWeight: "bold" }}>
          Общая стоимость портфеля
        </span>
        <span
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#3b82f6",
            cursor: "pointer",
            padding: "8px 12px",
            borderRadius: "4px",
            transition: "background-color 0.2s ease",
          }}
          onClick={handleTotalClick}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#f0f0f0";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
          }}
          title="Нажмите для смены валюты"
        >
          {formatCurrency(convertedTotal)}
        </span>
      </div>

      <div style={{ fontSize: "12px", color: "#666", textAlign: "right" }}>
        Нажмите на сумму для смены валюты
      </div>
    </div>
  );
};

export default React.memo(TotalValue);
