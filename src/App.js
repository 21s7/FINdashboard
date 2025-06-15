import React from "react";
import Bonds from "./services/Bonds";
import Shares from "./services/Shares";
import Currency from "./services/Сurrency";
import Cryptocurrencies from "./services/Сryptocurrencies";
import PortfolioStats from "./components/PortfolioStats";
import PortfolioBuilder from "./components/PortfolioBuilder";
import "./styles/App.css";
import PreciousMetals from "./services/PreciousMetals";

function App() {
  return (
    <div className="App">
      <Currency />
      <Cryptocurrencies />
      <Bonds />
      <Shares />
      <PreciousMetals />

      <hr />
      <PortfolioBuilder />
      <PortfolioStats />
    </div>
  );
}

export default App;
