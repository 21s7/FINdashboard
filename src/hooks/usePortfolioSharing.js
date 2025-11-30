//src/hooks/usePortfolioSharing.js

import { useState, useEffect, useCallback } from "react";

// Функции для кодирования/декодирования данных портфеля
const encodePortfolioData = (assets) => {
  try {
    const simplifiedAssets = assets.map((asset) => ({
      t: asset.type,
      n: asset.name,
      q: asset.quantity,
      p: asset.price || asset.value,
      tp: asset.pricePercent,
      ycp: asset.yearChangePercent,
      ticker: asset.ticker,
      code: asset.code,
      id: asset.id,
      // Для специальных типов
      rt: asset.rate,
      tm: asset.termMonths,
      cat: asset.category,
      addr: asset.address,
      yp: asset.yieldPercent,
      bt: asset.businessType,
      mp: asset.monthlyProfit,
      pm: asset.profitMargin,
    }));

    const jsonString = JSON.stringify(simplifiedAssets);
    // Используем более надежное кодирование
    const base64 = btoa(encodeURIComponent(jsonString));
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch (error) {
    console.error("Error encoding portfolio:", error);
    return null;
  }
};

const decodePortfolioData = (encodedString) => {
  try {
    if (!encodedString) return [];

    // Добавляем padding если нужно
    let base64 = encodedString.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }

    const jsonString = decodeURIComponent(atob(base64));
    const simplifiedAssets = JSON.parse(jsonString);

    // Восстанавливаем полные объекты активов
    return simplifiedAssets.map((asset) => ({
      type: asset.t,
      name: asset.n,
      quantity: asset.q || 1,
      price: asset.p,
      pricePercent: asset.tp,
      yearChangePercent: asset.ycp || 0,
      ticker: asset.ticker,
      code: asset.code,
      id: asset.id,
      portfolioId: `${asset.t}-${asset.ticker || asset.code || asset.id}-${Date.now()}-${Math.random()}`,
      // Восстанавливаем специальные поля
      rate: asset.rt,
      termMonths: asset.tm,
      category: asset.cat,
      address: asset.addr,
      yieldPercent: asset.yp,
      businessType: asset.bt,
      monthlyProfit: asset.mp,
      profitMargin: asset.pm,
      value: asset.p, // Для депозитов, недвижимости, бизнеса
    }));
  } catch (error) {
    console.error("Error decoding portfolio:", error);
    return [];
  }
};

// Генерация случайного ID
const generatePortfolioId = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const usePortfolioSharing = () => {
  const [portfolioId, setPortfolioId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Получить данные портфеля из URL
  const getPortfolioFromUrl = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const data = urlParams.get("data");

    if (!id && !data) {
      setIsLoading(false);
      return { id: null, assets: [] };
    }

    let assets = [];

    // Приоритет: данные из параметра data
    if (data) {
      assets = decodePortfolioData(data);
    }
    // Или загрузка из localStorage по ID (для обратной совместимости)
    else if (id) {
      const savedData = localStorage.getItem(`portfolio_${id}`);
      if (savedData) {
        assets = decodePortfolioData(savedData);
      }
    }

    setIsLoading(false);
    return { id, assets };
  }, []);

  // Сохранение портфеля в URL
  const savePortfolio = useCallback((assets) => {
    const encodedData = encodePortfolioData(assets);
    if (!encodedData) {
      alert("Ошибка при сохранении портфеля");
      return null;
    }

    const newPortfolioId = generatePortfolioId();

    // Создаем URL с данными прямо в параметре
    const newUrl = `${window.location.origin}${window.location.pathname}?id=${newPortfolioId}&data=${encodedData}`;

    // Обновляем URL
    window.history.replaceState({}, "", newUrl);
    setPortfolioId(newPortfolioId);

    // Копируем в буфер обмена
    navigator.clipboard
      .writeText(newUrl)
      .then(() => {
        alert("Портфель сохранен! Ссылка скопирована в буфер обмена.");
      })
      .catch(() => {
        alert(`Портфель сохранен! Ссылка: ${newUrl}`);
      });

    return newPortfolioId;
  }, []);

  // Создание новой ссылки для шаринга
  const createShareableLink = useCallback(
    (assets) => {
      const encodedData = encodePortfolioData(assets);
      if (!encodedData) return null;

      const shareId = portfolioId || generatePortfolioId();
      return `${window.location.origin}${window.location.pathname}?id=${shareId}&data=${encodedData}`;
    },
    [portfolioId]
  );

  // Очистка ID портфеля (возврат к новому портфелю)
  const clearPortfolioId = useCallback(() => {
    setPortfolioId(null);
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  return {
    portfolioId,
    isLoading,
    getPortfolioFromUrl,
    savePortfolio,
    createShareableLink,
    clearPortfolioId,
  };
};
