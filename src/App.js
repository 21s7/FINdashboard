import React, { useEffect } from "react";
import Bonds from "./services/Bonds";
import Shares from "./services/Shares";
import Currency from "./services/Сurrency";
import Cryptocurrencies from "./services/Сryptocurrencies";
import PreciousMetals from "./services/PreciousMetals";
import PortfolioSearch from "./components/PortfolioSearch";
import Portfolio from "./components/Portfolio";
import TotalValue from "./components/TotalValue";
import Diagram from "./components/Diagram";
import Modal from "./components/Modal";
import LoadingScreen from "./components/LoadingScreen";
import { Header } from "./components/layout/Header";

import { useApp } from "./hooks/useApp";
import { usePortfolioOperations } from "./hooks/usePortfolioOperations";

// Импорты стилей
import "./assets/styles/App.css";

function App() {
  const {
    currency,
    setCurrency,
    chartType,
    setChartType,
    isLoading,
    isDarkTheme,
    toggleTheme,
    savedPortfolioId,
    setSavedPortfolioId,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    modalConfig,
    showModal,
    portfolioAssets,
    portfolioId,
    sharingLoading,
    savePortfolio,
    updatePortfolio,
    createShareableLink,
    clearPortfolioId,
    dispatch,
    originalAssetsHash,
    setOriginalAssetsHash,
    createAssetsHash,
  } = useApp();

  const {
    handleSavePortfolio,
    handleSaveChanges,
    openNewPortfolioDialog,
    handleCopyLink,
  } = usePortfolioOperations({
    dispatch,
    savedPortfolioId,
    setSavedPortfolioId,
    setHasUnsavedChanges,
    setOriginalAssetsHash,
    clearPortfolioId,
    showModal,
    createAssetsHash,
  });

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
      <LoadingScreen isLoading={isLoading || sharingLoading} />

      <Modal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText="ОК"
        cancelText="Отмена"
        showCancel={modalConfig.showCancel}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
        icon={modalConfig.icon}
        autoCloseDelay={modalConfig.autoCloseDelay}
      />

      <div
        className="App"
        style={{ display: isLoading || sharingLoading ? "none" : "block" }}
      >
        <Currency />
        <Cryptocurrencies />
        <Bonds />
        <Shares />
        <PreciousMetals />

        <div className="блок">
          <Header
            isDarkTheme={isDarkTheme}
            toggleTheme={toggleTheme}
            savedPortfolioId={savedPortfolioId}
            hasUnsavedChanges={hasUnsavedChanges}
            onSavePortfolio={() =>
              handleSavePortfolio(portfolioAssets, savePortfolio)
            }
            onCopyLink={() =>
              handleCopyLink(portfolioAssets, createShareableLink)
            }
            onNewPortfolio={() =>
              openNewPortfolioDialog(hasUnsavedChanges, savedPortfolioId)
            }
            onSaveChanges={() =>
              handleSaveChanges(
                portfolioAssets,
                updatePortfolio,
                savedPortfolioId
              )
            }
          />

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
            <Portfolio
              savedPortfolioId={savedPortfolioId}
              hasUnsavedChanges={hasUnsavedChanges}
              onSaveChanges={() =>
                handleSaveChanges(
                  portfolioAssets,
                  updatePortfolio,
                  savedPortfolioId
                )
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
