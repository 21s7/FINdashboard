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
  if (
    asset.type === "deposit" ||
    asset.type === "realestate" ||
    asset.type === "business"
  ) {
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

  return `Портфель_${safeName}_${dateStr}_${timeStr}.pdf`;
};
