//src/components/charts/PieChartComponent.jsx

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { PieCustomTooltip } from "./PieCustomTooltip";
import { PieLegend } from "./PieLegend";

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

export const PieChartComponent = ({ chartData }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={false}
          outerRadius={100}
          innerRadius={40}
          dataKey="value"
          isAnimationActive={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<PieCustomTooltip />} />
        <Legend content={<PieLegend chartData={chartData} />} />
      </PieChart>
    </ResponsiveContainer>
  );
};
