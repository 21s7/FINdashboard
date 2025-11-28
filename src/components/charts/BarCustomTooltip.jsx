//src/components/charts/BarCustomTooltip.jsx

import React from "react";

const formatPercentage = (value) => {
  if (value === undefined || value === null) return "—";
  return `${value.toFixed(1)}%`;
};

const formatCurrency = (num) =>
  typeof num === "number"
    ? num.toLocaleString("ru-RU", { minimumFractionDigits: 2 }) + " ₽"
    : "—";

export const BarCustomTooltip = ({ active, payload, label, chartData }) => {
  if (active && payload && payload.length) {
    const activeAsset = chartData.find((item) => item.name === label);

    if (activeAsset) {
      return (
        <div
          style={{
            backgroundColor: "var(--dark-surface)",
            border: "1px solid var(--dark-border)",
            borderRadius: "var(--border-radius)",
            padding: "0.75rem",
            color: "var(--dark-text-primary)",
          }}
        >
          <p style={{ margin: "0 0 0.25rem 0", fontWeight: "600" }}>
            {activeAsset.name}
          </p>
          <p style={{ margin: "0 0 0.25rem 0", color: "var(--primary-color)" }}>
            Доля: <strong>{formatPercentage(activeAsset.value)}</strong>
          </p>
          <p style={{ margin: 0, color: "var(--dark-text-secondary)" }}>
            Стоимость:{" "}
            <strong>{formatCurrency(activeAsset.absoluteValue)}</strong>
          </p>
        </div>
      );
    }
  }
  return null;
};
