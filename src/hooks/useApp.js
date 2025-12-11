//src/hooks/useApp.js

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePortfolioSharing } from "./usePortfolioSharing";
import { loadPortfolio } from "../slices/portfolioSlice";

export const useApp = () => {
  const [currency, setCurrency] = useState("rub");
  const [chartType, setChartType] = useState("pie");
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [savedPortfolioId, setSavedPortfolioId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalAssetsHash, setOriginalAssetsHash] = useState("");

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
      setOriginalAssetsHash(createAssetsHash(assets));
    }
  }, [getPortfolioFromUrl, dispatch]);

  // Отслеживаем изменения в портфеле
  useEffect(() => {
    if (savedPortfolioId && portfolioAssets.length > 0) {
      const currentHash = createAssetsHash(portfolioAssets);
      if (currentHash !== originalAssetsHash) {
        setHasUnsavedChanges(true);
      } else {
        setHasUnsavedChanges(false);
      }
    } else if (!savedPortfolioId && portfolioAssets.length > 0) {
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

  return {
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
    setModalConfig,
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
  };
};
