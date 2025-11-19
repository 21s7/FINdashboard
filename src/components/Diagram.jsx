// src/components/Diagram.jsx

import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

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

const CURRENCY_SYMBOLS = {
  rub: "₽",
  usd: "$",
  eur: "€",
};

const typeLabels = {
  share: "Акции",
  bond: "Облигации",
  currency: "Валюты",
  crypto: "Криптовалюты",
  metal: "Металлы",
  deposit: "Депозиты",
  realestate: "Недвижимость",
  business: "Бизнес",
};

const CHART_TYPES = ["pie", "bar"];

const Diagram = ({ currency, chartType, onChartTypeChange }) => {
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

  const formatCurrency = (num) =>
    typeof num === "number"
      ? num.toLocaleString("ru-RU", { minimumFractionDigits: 2 }) +
        ` ${CURRENCY_SYMBOLS[currency] || ""}`
      : "—";

  const chartData = useMemo(() => {
    const sums = {};
    assets.forEach((asset) => {
      let total = 0;
      if (asset.type === "deposit") {
        total = asset.value || 0;
      } else {
        const price =
          asset.type === "bond"
            ? asset.pricePercent
            : asset.price || asset.value || 0;
        total =
          asset.type === "bond"
            ? (price / 100) * asset.quantity * 1000
            : price * asset.quantity;
      }

      if (!sums[asset.type]) sums[asset.type] = 0;
      sums[asset.type] += total;
    });

    return Object.entries(sums).map(([type, value]) => ({
      name: typeLabels[type] || type,
      value: convertToCurrency(value),
    }));
  }, [assets, currency, exchangeRates]);

  const handleChartClick = () => {
    const currentIndex = CHART_TYPES.indexOf(chartType);
    const nextIndex = (currentIndex + 1) % CHART_TYPES.length;
    onChartTypeChange(CHART_TYPES[nextIndex]);
  };

  const getChartIcon = () => {
    return chartType === "pie" ? "📊" : "📈";
  };

  return (
    <div className="card-shadow" style={{ height: "100%" }}>
      <div
        style={{
          padding: "1.5rem",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="diagram-header">
          <h3 style={{ margin: 0 }}>Распределение активов</h3>
          <div
            className="diagram-type-toggle"
            onClick={handleChartClick}
            style={{
              fontSize: "1.25rem",
              cursor: "pointer",
              padding: "0.5rem",
              borderRadius: "var(--border-radius)",
              transition: "var(--transition)",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "var(--dark-surface-hover)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
            title="Нажмите для смены типа диаграммы"
          >
            {getChartIcon()}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            cursor: "pointer",
            borderRadius: "var(--border-radius)",
            transition: "var(--transition)",
          }}
          onClick={handleChartClick}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "var(--dark-surface-hover)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
          }}
          title="Нажмите для смены типа диаграммы"
        >
          {chartType === "pie" ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  innerRadius={40}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  layout="horizontal"
                  wrapperStyle={{
                    fontSize: "12px",
                    maxWidth: "90%",
                    margin: "0 auto",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, bottom: 60, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--dark-divider)"
                />
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
                />
                <Tooltip
                  formatter={(val) => formatCurrency(val)}
                  contentStyle={{
                    backgroundColor: "var(--dark-surface)",
                    border: "1px solid var(--dark-border)",
                    borderRadius: "var(--border-radius)",
                    color: "var(--dark-text-primary)",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="var(--primary-color)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--dark-text-tertiary)",
            textAlign: "center",
            marginTop: "0.5rem",
          }}
        >
          Нажмите на диаграмму для смены типа
        </div>
      </div>
    </div>
  );
};

export default React.memo(Diagram);
