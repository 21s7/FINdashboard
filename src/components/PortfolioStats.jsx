import React, { useMemo, useState } from "react";
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
import styles from "../assets/styles/Portfolio.module.scss";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
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
};

const PortfolioStats = ({ assets }) => {
  const [currency, setCurrency] = useState("rub");
  const [chartType, setChartType] = useState("pie"); // 'pie' | 'bar'
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

  const chartData = useMemo(() => {
    const sums = {};
    assets.forEach((asset) => {
      const price =
        asset.type === "bond"
          ? asset.pricePercent
          : asset.price || asset.value || 0;

      const total =
        asset.type === "bond"
          ? (price / 100) * asset.quantity * 1000
          : price * asset.quantity;

      if (!sums[asset.type]) sums[asset.type] = 0;
      sums[asset.type] += total;
    });

    return Object.entries(sums).map(([type, value]) => ({
      name: typeLabels[type] || type,
      value: convertToCurrency(value),
    }));
  }, [assets, currency, exchangeRates]);

  return (
    <div className={styles.statsContainer}>
      <div className={styles.totalValue}>
        <span className={styles.totalLabel}>Общая стоимость</span>
        <span className={styles.totalAmount}>
          {formatCurrency(convertedTotal)}
        </span>
      </div>

      <div className={styles.controls}>
        <label>
          Валюта:
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="rub">₽ Руб</option>
            <option value="usd">$ Доллар</option>
            <option value="eur">€ Евро</option>
          </select>
        </label>

        <label>
          Тип диаграммы:
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="pie">📊 Круговая</option>
            <option value="bar">📈 Гистограмма</option>
          </select>
        </label>
      </div>

      <div className={styles.chartArea}>
        {chartType === "pie" ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => formatCurrency(val)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(val) => formatCurrency(val)} />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default React.memo(PortfolioStats);
