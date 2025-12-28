//src/utils/pdfGenerator.js

/**
 * Утилиты для генерации PDF отчетов
 */

// Цвета для различных типов активов
export const ASSET_TYPE_COLORS = {
  share: "#3b82f6",
  bond: "#8b5cf6",
  currency: "#10b981",
  crypto: "#f59e0b",
  metal: "#f97316",
  deposit: "#06b6d4",
  realestate: "#ec4899",
  business: "#8b5cf6",
};

// Иконки для типов активов (emoji)
export const ASSET_TYPE_ICONS = {
  share: "📈",
  bond: "📋",
  currency: "💵",
  crypto: "₿",
  metal: "🥇",
  deposit: "🏦",
  realestate: "🏠",
  business: "🏢",
};

// Русские названия типов активов
export const ASSET_TYPE_NAMES = {
  share: "Акции",
  bond: "Облигации",
  currency: "Валюты",
  crypto: "Криптовалюты",
  metal: "Металлы",
  deposit: "Депозиты",
  realestate: "Недвижимость",
  business: "Бизнес",
};

/**
 * Форматирует число как валюту
 */
export const formatCurrency = (num, suffix = "₽") => {
  if (typeof num !== "number" || isNaN(num)) return "—";

  // Для больших чисел используем сокращения
  const absNum = Math.abs(num);
  if (absNum >= 1000000000000) {
    return `${(num / 1000000000000).toFixed(2)} трлн ${suffix}`;
  }
  if (absNum >= 1000000000) {
    return `${(num / 1000000000).toFixed(2)} млрд ${suffix}`;
  }
  if (absNum >= 1000000) {
    return `${(num / 1000000).toFixed(2)} млн ${suffix}`;
  }

  return `${num.toLocaleString("ru-RU", { minimumFractionDigits: 2 })} ${suffix}`;
};

/**
 * Форматирует проценты
 */
export const formatPercentage = (value) => {
  if (value === undefined || value === null) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
};

/**
 * Рассчитывает стоимость актива
 */
export const calculateAssetValue = (asset) => {
  if (asset.type === "deposit") {
    return asset.value || 0;
  }

  const unitPrice =
    asset.type === "bond"
      ? asset.pricePercent
      : asset.price || asset.value || 0;

  return asset.type === "bond"
    ? (unitPrice / 100) * asset.quantity * 1000
    : unitPrice * asset.quantity;
};

/**
 * Группирует активы по типам
 */
export const groupAssetsByType = (assets) => {
  const groups = {};

  assets.forEach((asset) => {
    if (!groups[asset.type]) {
      groups[asset.type] = [];
    }
    groups[asset.type].push(asset);
  });

  return groups;
};

/**
 * Рассчитывает общую стоимость портфеля
 */
export const calculatePortfolioValue = (assets) => {
  return assets.reduce((sum, asset) => sum + calculateAssetValue(asset), 0);
};

/**
 * Рассчитывает общую доходность портфеля
 */
export const calculatePortfolioReturn = (assets) => {
  const totalValue = calculatePortfolioValue(assets);
  if (totalValue === 0) return 0;

  const totalProfit = assets.reduce((sum, asset) => {
    const assetValue = calculateAssetValue(asset);
    const profit = (assetValue * (asset.yearChangePercent || 0)) / 100;
    return sum + profit;
  }, 0);

  return (totalProfit / totalValue) * 100;
};

/**
 * Генерирует уникальное имя файла для PDF
 */
export const generatePDFFileName = (portfolioName) => {
  const date = new Date();
  const dateStr = date.toISOString().split("T")[0];
  const timeStr =
    date.getHours().toString().padStart(2, "0") +
    date.getMinutes().toString().padStart(2, "0");

  const safeName = (portfolioName || "Портфель")
    .replace(/[^a-zA-Z0-9а-яА-ЯёЁ]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  return `${safeName}_${dateStr}_${timeStr}.pdf`;
};

/**
 * Преобразует цвет в hex формате в RGB объект
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Создает градиентный цвет для PDF
 */
export const createGradientColor = (color1, color2, percentage = 50) => {
  const rgb1 = hexToRgb(color1) || { r: 59, g: 130, b: 246 };
  const rgb2 = hexToRgb(color2) || { r: 29, g: 78, b: 216 };

  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * (percentage / 100));
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * (percentage / 100));
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * (percentage / 100));

  return `rgb(${r}, ${g}, ${b})`;
};
