//src/compoments/charts/BarChartComponent.jsx
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { BarCustomTooltip } from "./BarCustomTooltip";
import { BarLegend } from "./BarLegend";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#a3a3a3",
  "#f87171",
];

const formatPercentage = (value) => {
  if (value === undefined || value === null) return "—";
  return `${value.toFixed(1)}%`;
};

export const BarChartComponent = ({ chartData }) => {
  const barChartData = useMemo(() => {
    return chartData.map((item) => {
      const dataItem = { name: item.name };
      chartData.forEach((asset) => {
        dataItem[asset.name] = asset.name === item.name ? item.value : 0;
      });
      return dataItem;
    });
  }, [chartData]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={barChartData}
        margin={{ top: 10, right: 10, bottom: 80, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-divider)" />
        <XAxis
          dataKey="name"
          interval={0}
          angle={-30}
          textAnchor="end"
          tick={{ fontSize: 10, fill: "var(--dark-text-secondary)" }}
          height={60}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--dark-text-secondary)" }}
          tickFormatter={formatPercentage}
        />
        <Tooltip content={<BarCustomTooltip chartData={chartData} />} />
        {chartData.map((asset, index) => (
          <Bar
            key={asset.name}
            dataKey={asset.name}
            fill={asset.color}
            radius={[4, 4, 0, 0]}
            name={asset.name}
          />
        ))}
        <Legend content={<BarLegend chartData={chartData} />} />
      </BarChart>
    </ResponsiveContainer>
  );
};
