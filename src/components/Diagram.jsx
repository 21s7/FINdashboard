import React from "react";
import { useChartData } from "../hooks/useChartData";
import { PieChartComponent } from "./charts/PieChartComponent";
import { BarChartComponent } from "./charts/BarChartComponent";

const CHART_TYPES = ["pie", "bar"];

const Diagram = ({ currency, chartType, onChartTypeChange }) => {
  const { chartData } = useChartData(currency);

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
            <PieChartComponent chartData={chartData} />
          ) : (
            <BarChartComponent chartData={chartData} />
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
