import React from "react";
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
import "./assets/styles/App.css";

function App() {
  return (
    <div className="App">
      {/* Это компоненты для рендера активов без визуала */}
      <Currency />
      <Cryptocurrencies />
      <Bonds />
      <Shares />
      <PreciousMetals />

      <div className="блок">
        <div className="перваяСекция">
          <PortfolioStats />
        </div>
        <div className="втораяСекция">
          <div className="леваяЧастьВторойСекции">
            <Portfolio />
          </div>
          <div className="праваяЧастьВторойСекции">
            <PortfolioSearch />
            <DepositForm />
            <RealEstateForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
