// src/App.js

import React, { useState, useEffect, useRef } from "react";
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
import {
  loadPortfolio,
  clearPortfolio,
  addAsset,
  removeAsset,
} from "./slices/portfolioSlice";

// Импорты стилей
import "./assets/styles/App.css";

function App() {
  const [currency, setCurrency] = useState("rub");
  const [chartType, setChartType] = useState("pie");
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [savedPortfolioId, setSavedPortfolioId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalAssetsHash, setOriginalAssetsHash] = useState("");

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
  const portfolioAssetsRef = useRef(portfolioAssets);

  const {
    portfolioId,
    isLoading: sharingLoading,
    getPortfolioFromUrl,
    savePortfolio,
    updatePortfolio,
    createShareableLink,
    clearPortfolioId,
  } = usePortfolioSharing();

  // Обновляем ref при изменении активов
  useEffect(() => {
    portfolioAssetsRef.current = portfolioAssets;
  }, [portfolioAssets]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Функция для создания хеша активов
  const createAssetsHash = (assets) => {
    if (!assets || assets.length === 0) return "";

    const simplified = assets.map((asset) => ({
      type: asset.type,
      name: asset.name,
      quantity: asset.quantity,
      price: asset.price || asset.value,
      ticker: asset.ticker,
      id: asset.id,
      portfolioId: asset.portfolioId,
    }));

    return JSON.stringify(simplified);
  };

  // Загрузка портфеля из URL при монтировании
  useEffect(() => {
    const { id, assets } = getPortfolioFromUrl();

    if (assets && assets.length > 0) {
      dispatch(loadPortfolio(assets));
      setSavedPortfolioId(id);
      setHasUnsavedChanges(false);
      // Сохраняем хеш оригинального портфеля
      setOriginalAssetsHash(createAssetsHash(assets));
    }
  }, [getPortfolioFromUrl, dispatch]);

  // Отслеживаем изменения в портфеле
  useEffect(() => {
    if (savedPortfolioId && portfolioAssets.length > 0) {
      const currentHash = createAssetsHash(portfolioAssets);
      // Сравниваем с оригинальным хешом
      if (currentHash !== originalAssetsHash) {
        setHasUnsavedChanges(true);
      } else {
        setHasUnsavedChanges(false);
      }
    } else if (!savedPortfolioId && portfolioAssets.length > 0) {
      // Для нового портфеля изменения есть если есть активы
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [portfolioAssets, savedPortfolioId, originalAssetsHash]);

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

  // Функция сохранения нового портфеля
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
      setHasUnsavedChanges(false);
      // Обновляем хеш оригинального портфеля
      setOriginalAssetsHash(createAssetsHash(portfolioAssets));

      // Копируем ссылку в буфер обмена
      try {
        await navigator.clipboard.writeText(result.shareUrl);

        showModal({
          type: "success",
          title: "Портфель сохранен!",
          message: "Ссылка на портфель скопирована в буфер обмена.",
          showCancel: false,
          icon: "✅",
          autoCloseDelay: 3000,
        });
      } catch (copyError) {
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

  // Функция сохранения изменений в существующем портфеле
  const handleSaveChanges = async () => {
    if (portfolioAssets.length === 0) {
      showModal({
        type: "warning",
        title: "Портфель пуст",
        message: "Нет активов для сохранения.",
        showCancel: false,
        icon: "📂",
      });
      return;
    }

    if (!savedPortfolioId) {
      handleSavePortfolio();
      return;
    }

    // Обновляем существующий портфель
    const result = await updatePortfolio(portfolioAssets, savedPortfolioId);

    if (result.success) {
      setHasUnsavedChanges(false);
      // Обновляем хеш оригинального портфеля
      setOriginalAssetsHash(createAssetsHash(portfolioAssets));

      // Копируем обновленную ссылку в буфер обмена
      try {
        await navigator.clipboard.writeText(result.shareUrl);

        showModal({
          type: "success",
          title: "Изменения сохранены!",
          message: "Новая ссылка на портфель скопирована в буфер обмена.",
          showCancel: false,
          icon: "✅",
          autoCloseDelay: 3000,
        });
      } catch (copyError) {
        showModal({
          type: "info",
          title: "Изменения сохранены!",
          message: `Новая ссылка на портфель: ${result.shareUrl}`,
          showCancel: false,
          icon: "📋",
        });
      }
    } else {
      showModal({
        type: "error",
        title: "Ошибка сохранения",
        message: result.error || "Не удалось сохранить изменения.",
        showCancel: false,
        icon: "❌",
      });
    }
  };

  // Функция для открытия диалога создания нового портфеля
  const openNewPortfolioDialog = () => {
    if (hasUnsavedChanges && savedPortfolioId) {
      showModal({
        type: "confirm",
        title: "Несохраненные изменения",
        message:
          "У вас есть несохраненные изменения. Создать новый портфель без сохранения?",
        icon: "⚠️",
        onConfirm: () => {
          dispatch(clearPortfolio());
          clearPortfolioId();
          setSavedPortfolioId(null);
          setHasUnsavedChanges(false);
          setOriginalAssetsHash("");

          if (window.history.replaceState) {
            const newUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, "", newUrl);
          }

          window.dispatchEvent(new Event("popstate"));

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
    } else {
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
          setHasUnsavedChanges(false);
          setOriginalAssetsHash("");

          if (window.history.replaceState) {
            const newUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, "", newUrl);
          }

          window.dispatchEvent(new Event("popstate"));

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
    }
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
            <Portfolio
              savedPortfolioId={savedPortfolioId}
              hasUnsavedChanges={hasUnsavedChanges}
              onSaveChanges={handleSaveChanges}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
