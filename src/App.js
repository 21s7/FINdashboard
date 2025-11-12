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
import styles from "./assets/styles/main.scss";

function App() {
  return (
    <div className="App">
      <Currency />
      <Cryptocurrencies />
      <Bonds />
      <Shares />
      <PreciousMetals />

      <PortfolioSearch />
      <DepositForm />
      <RealEstateForm />
      <Portfolio />
    </div>
  );
}

export default App;
