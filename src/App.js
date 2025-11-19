import React, { useState } from "react";
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

function App() {
  const [currency, setCurrency] = useState("rub");
  const [chartType, setChartType] = useState("pie");
  return (
    <div className="App">
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
  );
}

export default App;
