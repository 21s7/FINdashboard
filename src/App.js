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
import "./assets/styles/App.css";
import logo from "./assets/img/logo.png";
import LoadingScreen from "./components/LoadingScreen";

function App() {
  const [currency, setCurrency] = useState("rub");
  const [chartType, setChartType] = useState("pie");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

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
            <div className="logo">
              <img src={logo} alt="Logo" className="logo-image" />
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
            </div>{" "}
            <div className="праваяЧастьВторойСекции">
              {" "}
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
