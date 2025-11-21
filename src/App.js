import React, { useState, useEffect } from "react";
import Bonds from "./services/Bonds";
import Shares from "./services/Shares";
import Currency from "./services/Сurrency";
import Cryptocurrencies from "./services/Сryptocurrencies";
import PreciousMetals from "./services/PreciousMetals";
import PortfolioSearch from "./components/PortfolioSearch";
import Portfolio from "./components/Portfolio";
import TotalValue from "./components/TotalValue";
import Diagram from "./components/Diagram";
import logo from "./assets/img/logo.png";
import LoadingScreen from "./components/LoadingScreen";

// Импорты стилей
import "./assets/styles/App.css";

function App() {
  const [currency, setCurrency] = useState("rub");
  const [chartType, setChartType] = useState("pie");
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Функция переключения темы
  const toggleTheme = () => {
    setIsDarkTheme((prev) => !prev);
  };

  // Применяем тему к body
  useEffect(() => {
    if (isDarkTheme) {
      document.body.classList.remove("light-theme");
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
      document.body.classList.add("light-theme");
    }
  }, [isDarkTheme]);

  return (
    <>
      {/* Загрузочный экран */}
      <LoadingScreen isLoading={isLoading} />

      {/* Основное приложение */}
      <div className="App" style={{ display: isLoading ? "none" : "block" }}>
        {/* Это компоненты для рендера активов без визуала */}
        <Currency />
        <Cryptocurrencies />
        <Bonds />
        <Shares />
        <PreciousMetals />

        <div className="блок">
          <header className="ВерхняяСекция">
            <div
              className="logo"
              onClick={toggleTheme}
              style={{ cursor: "pointer" }}
            >
              <img src={logo} alt="Logo" className="logo-image" />
              <span
                style={{
                  marginLeft: "10px",
                  fontSize: "12px",
                  color: "var(--dark-text-secondary)",
                  transition: "var(--transition)",
                }}
              >
                {isDarkTheme ? "🌙 Тёмная тема" : "☀️ Светлая тема"}
              </span>
            </div>
            <div className="header-buttons">
              <button className="header-button">Сохранить</button>
              <button className="header-button">Экспорт</button>
            </div>
          </header>
          <div className="перваяСекция">
            <PortfolioSearch />
          </div>

          <div className="втораяСекция">
            <div className="леваяЧастьВторойСекции">
              <TotalValue currency={currency} onCurrencyChange={setCurrency} />
            </div>
            <div className="праваяЧастьВторойСекции">
              <Diagram
                currency={currency}
                chartType={chartType}
                onChartTypeChange={setChartType}
              />
            </div>
          </div>
          <div className="третьяСекция">
            <Portfolio />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
