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

  // Функция для форматирования процентов
  const formatPercentage = (value) => {
    if (value === undefined || value === null) return "—";
    return `${value.toFixed(1)}%`;
  };

  const { chartData, totalValue } = useMemo(() => {
    const sums = {};
    let total = 0;

    // Сначала считаем общую сумму в рублях
    assets.forEach((asset) => {
      let assetValue = 0;
      if (asset.type === "deposit") {
        assetValue = asset.value || 0;
      } else {
        const price =
          asset.type === "bond"
            ? asset.pricePercent
            : asset.price || asset.value || 0;
        assetValue =
          asset.type === "bond"
            ? (price / 100) * asset.quantity * 1000
            : price * asset.quantity;
      }

      if (!sums[asset.type]) sums[asset.type] = 0;
      sums[asset.type] += assetValue;
      total += assetValue;
    });

    // Преобразуем в проценты
    const data = Object.entries(sums).map(([type, value], index) => {
      const percentage = total > 0 ? (value / total) * 100 : 0;
      return {
        name: typeLabels[type] || type,
        value: percentage, // Процент вместо абсолютного значения
        absoluteValue: convertToCurrency(value), // Абсолютное значение для тултипа
        color: COLORS[index % COLORS.length], // Добавляем цвет для каждого актива
      };
    });

    return {
      chartData: data,
      totalValue: total,
    };
  }, [assets, currency, exchangeRates]);

  const handleChartClick = () => {
    const currentIndex = CHART_TYPES.indexOf(chartType);
    const nextIndex = (currentIndex + 1) % CHART_TYPES.length;
    onChartTypeChange(CHART_TYPES[nextIndex]);
  };

  const getChartIcon = () => {
    return chartType === "pie" ? "📊" : "📈";
  };

  // Кастомный тултип для круговой диаграммы
  const PieCustomTooltip = ({ active, payload }) => {
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
            Стоимость: <strong>{data.absoluteValue}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  // Кастомный тултип для гистограммы
  const BarCustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Находим активный актив по имени (label - это имя категории на оси X)
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
            <p
              style={{ margin: "0 0 0.25rem 0", color: "var(--primary-color)" }}
            >
              Доля: <strong>{formatPercentage(activeAsset.value)}</strong>
            </p>
            <p style={{ margin: 0, color: "var(--dark-text-secondary)" }}>
              Стоимость: <strong>{activeAsset.absoluteValue}</strong>
            </p>
          </div>
        );
      }
    }
    return null;
  };

  // Кастомная легенда для круговой диаграммы
  const renderPieLegend = (props) => {
    const { payload } = props;
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

  // Кастомная легенда для гистограммы
  const renderBarLegend = (props) => {
    const { payload } = props;
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
              {entry.value} (
              {formatPercentage(
                chartData.find((item) => item.name === entry.value)?.value
              )}
              )
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Преобразуем данные для гистограммы с отдельными Bar
  const barChartData = useMemo(() => {
    // Создаем объект, где каждый актив будет иметь свое значение
    const result = chartData.map((item) => {
      const dataItem = { name: item.name };
      chartData.forEach((asset) => {
        dataItem[asset.name] = asset.name === item.name ? item.value : 0;
      });
      return dataItem;
    });
    return result;
  }, [chartData]);

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
                  // Убраны подписи рядом с секциями
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
                <Legend content={renderPieLegend} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={barChartData}
                margin={{ top: 10, right: 10, bottom: 80, left: 0 }}
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
                  tickFormatter={formatPercentage}
                />
                <Tooltip
                  content={<BarCustomTooltip />}
                  contentStyle={{
                    backgroundColor: "var(--dark-surface)",
                    border: "1px solid var(--dark-border)",
                    borderRadius: "var(--border-radius)",
                    color: "var(--dark-text-primary)",
                  }}
                />
                {/* Создаем отдельный Bar для каждого актива */}
                {chartData.map((asset, index) => (
                  <Bar
                    key={asset.name}
                    dataKey={asset.name}
                    fill={asset.color}
                    radius={[4, 4, 0, 0]}
                    name={asset.name}
                  />
                ))}
                <Legend content={renderBarLegend} />
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
