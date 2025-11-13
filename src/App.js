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

function App() {
  return (
    <div className="App">
      <Currency />
      <Cryptocurrencies />
      <Bonds />
      <Shares />
      <PreciousMetals />

      <PortfolioStats />
      <PortfolioSearch />
      <DepositForm />
      <RealEstateForm />
      <Portfolio />
    </div>
  );
}

export default App;
