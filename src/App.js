// src/App.js

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
import Modal from "./components/Modal";
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

  // Состояния для модальных окон
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "confirm",
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
    showCancel: true,
  });

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
      dispatch(loadPortfolio(assets));
      setSavedPortfolioId(id);
    }
  }, [getPortfolioFromUrl, dispatch]);

  // Функция переключения темы
  const toggleTheme = () => {
    setIsDarkTheme((prev) => !prev);
  };

  // Универсальная функция для показа модального окна
  const showModal = (config) => {
    setModalConfig({
      isOpen: true,
      type: config.type || "confirm",
      title: config.title || "",
      message: config.message || "",
      onConfirm: () => {
        if (config.onConfirm) config.onConfirm();
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
      onCancel: () => {
        if (config.onCancel) config.onCancel();
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
      showCancel: config.showCancel !== false,
      icon: config.icon,
      autoCloseDelay: config.autoCloseDelay,
    });
  };

  // Функция сохранения портфеля
  const handleSavePortfolio = async () => {
    if (portfolioAssets.length === 0) {
      showModal({
        type: "warning",
        title: "Портфель пуст",
        message: "Добавьте активы перед сохранением.",
        showCancel: false,
        icon: "📂",
      });
      return;
    }

    // Сохраняем портфель и получаем результат
    const result = await savePortfolio(portfolioAssets);

    if (result.success) {
      setSavedPortfolioId(result.portfolioId);

      // Копируем ссылку в буфер обмена
      try {
        await navigator.clipboard.writeText(result.shareUrl);

        // Показываем сообщение об успешном сохранении
        showModal({
          type: "success",
          title: "Портфель сохранен!",
          message: "Ссылка на портфель скопирована в буфер обмена.",
          showCancel: false,
          icon: "✅",
          autoCloseDelay: 3000,
        });
      } catch (copyError) {
        // Если не удалось скопировать, показываем ссылку
        showModal({
          type: "info",
          title: "Портфель сохранен!",
          message: `Ссылка на портфель: ${result.shareUrl}`,
          showCancel: false,
          icon: "📋",
        });
      }
    } else {
      showModal({
        type: "error",
        title: "Ошибка сохранения",
        message: result.error || "Не удалось сохранить портфель.",
        showCancel: false,
        icon: "❌",
      });
    }
  };

  // Функция для открытия диалога создания нового портфеля
  const openNewPortfolioDialog = () => {
    showModal({
      type: "confirm",
      title: "Создать новый портфель?",
      message:
        "Текущие данные будут очищены. Вы уверены, что хотите создать новый портфель?",
      icon: "📄",
      onConfirm: () => {
        dispatch(clearPortfolio());
        clearPortfolioId();
        setSavedPortfolioId(null);

        if (window.history.replaceState) {
          const newUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, "", newUrl);
        }

        window.dispatchEvent(new Event("popstate"));

        // Показываем сообщение об успешном создании
        showModal({
          type: "success",
          title: "Новый портфель создан",
          message: "Теперь вы можете добавить новые активы.",
          showCancel: false,
          icon: "✨",
          autoCloseDelay: 2000,
        });
      },
    });
  };

  // Функция копирования ссылки
  const handleCopyLink = () => {
    const shareLink = createShareableLink(portfolioAssets);
    if (shareLink) {
      navigator.clipboard
        .writeText(shareLink)
        .then(() => {
          showModal({
            type: "success",
            title: "Ссылка скопирована",
            message: "Ссылка на портфель скопирована в буфер обмена.",
            showCancel: false,
            icon: "🔗",
            autoCloseDelay: 2000,
          });
        })
        .catch(() => {
          showModal({
            type: "info",
            title: "Ссылка на портфель",
            message: `Скопируйте ссылку: ${shareLink}`,
            showCancel: false,
            icon: "📋",
          });
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
              <div className="header-buttons">
                {!savedPortfolioId && (
                  <button
                    className="header-button"
                    onClick={handleSavePortfolio}
                  >
                    💾 Сохранить
                  </button>
                )}
                {savedPortfolioId && (
                  <>
                    <button className="header-button" onClick={handleCopyLink}>
                      🔗 Копировать ссылку
                    </button>
                    <button
                      className="header-button"
                      onClick={openNewPortfolioDialog}
                    >
                      📄 Новый портфель
                    </button>
                  </>
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
            <Portfolio savedPortfolioId={savedPortfolioId} />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
