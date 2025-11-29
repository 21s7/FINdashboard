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

import { usePortfolioSharing } from "./hooks/usePortfolioSharing";
import { useDispatch, useSelector } from "react-redux";
import { loadPortfolio, clearPortfolio } from "./slices/portfolioSlice";

// Импорты стилей
import "./assets/styles/App.css";

function App() {
  const [currency, setCurrency] = useState("rub");
  const [chartType, setChartType] = useState("pie");
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [savedPortfolioId, setSavedPortfolioId] = useState(null);

  const dispatch = useDispatch();
  const portfolioAssets = useSelector((state) => state.portfolio.assets);

  const {
    portfolioId,
    isLoading: sharingLoading,
    getPortfolioFromUrl,
    savePortfolio,
    createShareableLink,
    clearPortfolioId,
  } = usePortfolioSharing();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Загрузка портфеля из URL при монтировании
  useEffect(() => {
    const { id, assets } = getPortfolioFromUrl();

    if (assets && assets.length > 0) {
      // Очищаем текущий портфель и загружаем из URL
      dispatch(loadPortfolio(assets));
      setSavedPortfolioId(id);
    }
  }, [getPortfolioFromUrl, dispatch]);

  // Функция переключения темы
  const toggleTheme = () => {
    setIsDarkTheme((prev) => !prev);
  };

  // Функция сохранения портфеля
  const handleSavePortfolio = () => {
    if (portfolioAssets.length === 0) {
      alert("Портфель пуст. Добавьте активы перед сохранением.");
      return;
    }

    const newPortfolioId = savePortfolio(portfolioAssets);
    setSavedPortfolioId(newPortfolioId);
  };

  // Функция создания нового портфеля
  const handleNewPortfolio = () => {
    if (
      window.confirm("Создать новый портфель? Текущие данные будут очищены.")
    ) {
      dispatch(clearPortfolio());
      clearPortfolioId();
      setSavedPortfolioId(null);
      window.location.href = window.location.origin + window.location.pathname;
    }
  };

  // Функция копирования ссылки
  const handleCopyLink = () => {
    const shareLink = createShareableLink(portfolioAssets);
    if (shareLink) {
      navigator.clipboard
        .writeText(shareLink)
        .then(() => {
          alert("Ссылка на портфель скопирована в буфер обмена!");
        })
        .catch(() => {
          alert(`Ссылка на портфель: ${shareLink}`);
        });
    }
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
      <LoadingScreen isLoading={isLoading || sharingLoading} />

      {/* Основное приложение */}
      <div
        className="App"
        style={{ display: isLoading || sharingLoading ? "none" : "block" }}
      >
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

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {savedPortfolioId && (
                <div className="portfolio-indicator">
                  📁 Портфель:{" "}
                  <span className="portfolio-id">{savedPortfolioId}</span>
                </div>
              )}
              <div className="header-buttons">
                <button className="header-button" onClick={handleSavePortfolio}>
                  💾 Сохранить
                </button>
                {savedPortfolioId && (
                  <button className="header-button" onClick={handleCopyLink}>
                    🔗 Копировать ссылку
                  </button>
                )}
                {(savedPortfolioId || portfolioAssets.length > 0) && (
                  <button
                    className="header-button"
                    onClick={handleNewPortfolio}
                  >
                    📄 Новый портфель
                  </button>
                )}
              </div>
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
