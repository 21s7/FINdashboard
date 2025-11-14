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
    <div
      style={{
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
          marginBottom: "15px",
        }}
      >
        <h3 style={{ margin: 0 }}>Распределение активов</h3>
        <div
          style={{
            fontSize: "20px",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "4px",
            transition: "background-color 0.2s ease",
          }}
          onClick={handleChartClick}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#f0f0f0";
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
          cursor: "pointer",
          borderRadius: "8px",
          transition: "background-color 0.2s ease",
        }}
        onClick={handleChartClick}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "#f8f9fa";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "transparent";
        }}
        title="Нажмите для смены типа диаграммы"
      >
        {chartType === "pie" ? (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={110}
                innerRadius={50}
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
                  fontSize: "14px",
                  maxWidth: "90%",
                  margin: "0 auto",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, bottom: 60, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                interval={0}
                angle={-30}
                textAnchor="end"
                tick={{ fontSize: 12 }}
                height={60}
              />
              <YAxis />
              <Tooltip formatter={(val) => formatCurrency(val)} />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div
        style={{
          fontSize: "12px",
          color: "#666",
          textAlign: "center",
          marginTop: "10px",
        }}
      >
        Нажмите на диаграмму для смены типа
      </div>
    </div>
  );
};

export default React.memo(Diagram);
