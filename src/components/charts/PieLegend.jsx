//src/components/charts/PieLegend.jsx

import React from "react";

const formatPercentage = (value) => {
  if (value === undefined || value === null) return "—";
  return `${value.toFixed(1)}%`;
};

export const PieLegend = ({ payload, chartData }) => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0.75rem",
        marginTop: "1rem",
      }}
    >
      {payload.map((entry, index) => (
        <div
          key={`legend-${index}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "12px",
            color: "var(--dark-text-secondary)",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: entry.color,
              borderRadius: "2px",
            }}
          />
          <span>
            {chartData[index]?.name} (
            {formatPercentage(chartData[index]?.value)})
          </span>
        </div>
      ))}
    </div>
  );
};
