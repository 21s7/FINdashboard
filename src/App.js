import React, { useState } from "react";
import Bonds from "./services/Bonds";
import Shares from "./services/Shares";
import Currency from "./services/Сurrency";
import Cryptocurrencies from "./services/Сryptocurrencies";
import PreciousMetals from "./services/PreciousMetals";
import PortfolioSearch from "./components/PortfolioSearch";
import Portfolio from "./components/Portfolio";
import DepositForm from "./components/DepositForm";
import RealEstateForm from "./components/RealEstateForm";
import PortfolioStats from "./components/PortfolioStats";
import TotalValue from "./components/TotalValue";
import Diagram from "./components/Diagram";
import "./assets/styles/App.css";

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

      <TotalValue currency={currency} onCurrencyChange={setCurrency} />
      <Diagram
        currency={currency}
        chartType={chartType}
        onChartTypeChange={setChartType}
      />
      {/* <PortfolioStats /> */}
      <Portfolio />
      <PortfolioSearch />
      <DepositForm />
      <RealEstateForm />
    </div>
  );
}

export default App;
