//src/components/charts/PieCustomTooltip.jsx

import React from "react";

const formatPercentage = (value) => {
  if (value === undefined || value === null) return "—";
  return `${value.toFixed(1)}%`;
};

const formatCurrency = (num) =>
  typeof num === "number"
    ? num.toLocaleString("ru-RU", { minimumFractionDigits: 2 }) + " ₽"
    : "—";

export const PieCustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
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
          {data.name}
        </p>
        <p style={{ margin: "0 0 0.25rem 0", color: "var(--primary-color)" }}>
          Доля: <strong>{formatPercentage(data.value)}</strong>
        </p>
        <p style={{ margin: 0, color: "var(--dark-text-secondary)" }}>
          Стоимость: <strong>{formatCurrency(data.absoluteValue)}</strong>
        </p>
      </div>
    );
  }
  return null;
};
