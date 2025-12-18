// src/components/TotalValue.jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";

const CURRENCY_SYMBOLS = {
  rub: "₽",
  usd: "$",
  eur: "€",
  cny: "¥", // Добавили юань
};

const CURRENCY_ORDER = ["rub", "usd", "eur", "cny"]; // Добавили юань в порядок

// Функция для форматирования больших чисел (только для сумм больше 10 млн)
const formatCurrencyWithThreshold = (num, currency, threshold = 10000000) => {
  if (typeof num !== "number" || isNaN(num)) return "—";

  const absNum = Math.abs(num);
  const symbol = CURRENCY_SYMBOLS[currency] || "";
  const isNegative = num < 0;
  const sign = isNegative ? "-" : "";

  // Применяем компактное форматирование только если сумма больше порога (10 млн)
  if (absNum >= threshold) {
    // Триллионы (1 000 000 000 000+)
    if (absNum >= 1000000000000) {
      const value = absNum / 1000000000000;
      return `${sign}${formatCompactValue(value)} трлн ${symbol}`;
    }

    // Миллиарды (1 000 000 000 - 999 999 999 999)
    if (absNum >= 1000000000) {
      const value = absNum / 1000000000;
      return `${sign}${formatCompactValue(value)} млрд ${symbol}`;
    }

    // Миллионы (10 000 000 - 999 999 999)
    if (absNum >= 1000000) {
      const value = absNum / 1000000;
      return `${sign}${formatCompactValue(value)} млн ${symbol}`;
    }

    // Тысячи (только если порог меньше 1000, но у нас порог 10 млн, так что этот кейс не сработает)
    if (absNum >= 1000) {
      const value = absNum / 1000;
      return `${sign}${formatCompactValue(value)} тыс ${symbol}`;
    }
  }

  // Стандартное форматирование для сумм меньше порога
  return `${sign}${absNum.toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${symbol}`;
};

// Вспомогательная функция для форматирования значения с правильным количеством знаков
const formatCompactValue = (value) => {
  // Определяем количество знаков после запятой
  if (value >= 1000) {
    // Если значение само по себе больше 1000 (например, 1234 тыс = 1.234 млн)
    return value.toLocaleString("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  } else if (value >= 100) {
    // От 100 до 999 - без десятичных знаков
    return value.toLocaleString("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  } else if (value >= 10) {
    // От 10 до 99.99 - 1 знак после запятой
    return value.toLocaleString("ru-RU", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  } else {
    // Меньше 10 - 2 знака после запятой
    return value.toLocaleString("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
};

// Функция для конвертации в разные валюты
const convertToCurrency = (rubAmount, targetCurrency, exchangeRates) => {
  if (targetCurrency === "rub") return rubAmount;

  const rate = getRateToRub(targetCurrency.toUpperCase(), exchangeRates);
  return rate ? rubAmount / rate : rubAmount;
};

const getRateToRub = (code, exchangeRates) => {
  const found = exchangeRates.find((c) => c.code === code);
  return found ? found.price / found.nominal : null;
};

const TotalValue = ({ currency, onCurrencyChange }) => {
  const assets = useSelector((state) => state.portfolio.assets);
  const exchangeRates = useSelector((state) => state.currency.items);

  const totalValue = useMemo(() => {
    return assets.reduce((sum, asset) => {
      if (asset.type === "deposit") {
        return sum + (asset.value || 0);
      }

      const unitPrice =
        asset.type === "bond"
          ? asset.pricePercent
          : asset.price || asset.value || 0;
      const total =
        asset.type === "bond"
          ? (unitPrice / 100) * asset.quantity * 1000
          : unitPrice * asset.quantity;
      return sum + total;
    }, 0);
  }, [assets]);

  const convertedTotal = useMemo(
    () => convertToCurrency(totalValue, currency, exchangeRates),
    [totalValue, currency, exchangeRates]
  );

  // Форматируем сумму с порогом в 10 миллионов
  const formattedTotal = formatCurrencyWithThreshold(
    convertedTotal,
    currency,
    10000000
  );

  const handleTotalClick = () => {
    const currentIndex = CURRENCY_ORDER.indexOf(currency);
    const nextIndex = (currentIndex + 1) % CURRENCY_ORDER.length;
    onCurrencyChange(CURRENCY_ORDER[nextIndex]);
  };

  // Определяем, нужно ли применять компактный стиль
  const shouldUseCompactStyle = formattedTotal.length > 25;
  const shouldUseVeryCompactStyle = formattedTotal.length > 35;

  // Определяем текущий курс для отображения в подсказке
  const getCurrencyInfo = () => {
    switch (currency) {
      case "rub":
        return { name: "Российский рубль", symbol: "₽" };
      case "usd":
        return { name: "Доллар США", symbol: "$" };
      case "eur":
        return { name: "Евро", symbol: "€" };
      case "cny":
        return { name: "Китайский юань", symbol: "¥" };
      default:
        return { name: "Российский рубль", symbol: "₽" };
    }
  };

  const currencyInfo = getCurrencyInfo();

  return (
    <div className="card-shadow" style={{ height: "100%" }}>
      <div
        style={{
          padding: "1.5rem",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <span
            style={{
              fontSize: "1rem",
              color: "var(--dark-text-secondary)",
              fontWeight: "500",
            }}
          >
            Общая стоимость портфеля
          </span>
        </div>

        <div className="total-value-wrapper">
          <span
            className={`total-amount ${shouldUseCompactStyle ? "compact" : ""} ${shouldUseVeryCompactStyle ? "very-compact" : ""}`}
            onClick={handleTotalClick}
            style={{
              cursor: "pointer",
              padding: shouldUseCompactStyle ? "0.75rem" : "1rem",
              borderRadius: "var(--border-radius)",
              transition: "var(--transition)",
              fontSize: shouldUseVeryCompactStyle
                ? "clamp(0.9rem, 3vw, 1.2rem)"
                : shouldUseCompactStyle
                  ? "clamp(1.2rem, 4vw, 2rem)"
                  : "clamp(1.5rem, 5vw, 3rem)",
              ...(shouldUseCompactStyle
                ? {
                    backgroundColor: "var(--dark-surface)",
                    border: "1px solid var(--dark-border)",
                    color: "var(--dark-text-primary)",
                    WebkitTextFillColor: "initial",
                    backgroundClip: "border-box",
                  }
                : {}),
            }}
            onMouseEnter={(e) => {
              if (!shouldUseCompactStyle) {
                e.target.style.backgroundColor = "var(--dark-surface-hover)";
              }
            }}
            onMouseLeave={(e) => {
              if (!shouldUseCompactStyle) {
                e.target.style.backgroundColor = "transparent";
              }
            }}
            title={`${currencyInfo.name}. Нажмите для смены валюты (${CURRENCY_ORDER.map((c) => CURRENCY_SYMBOLS[c]).join(" → ")})`}
          >
            {formattedTotal}
          </span>
        </div>

        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--dark-text-tertiary)",
            marginTop: "1rem",
            textAlign: "center",
          }}
        >
          <div>Нажмите для смены валюты</div>
          <div
            style={{
              fontSize: "0.65rem",
              marginTop: "0.25rem",
              opacity: 0.7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.25rem",
            }}
          >
            <span>{currencyInfo.name}</span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span>Текущая: {currencyInfo.symbol}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Функция для тестирования форматирования с порогом
export const testFormattingWithThreshold = () => {
  const testCases = [
    // Меньше порога (10 млн) - стандартное форматирование
    { value: 9999999.99, expected: "9 999 999,99 ₽" },
    { value: 10000000, expected: "10,00 млн ₽" }, // Порог
    { value: 10000000.01, expected: "10,00 млн ₽" },
    { value: 12345678, expected: "12,35 млн ₽" },
    { value: 99999999.99, expected: "100,00 млн ₽" },
    { value: 100000000, expected: "100,00 млн ₽" },
    { value: 123456789, expected: "123,46 млн ₽" },
    { value: 999999999.99, expected: "1 000,00 млн ₽" },
    { value: 1000000000, expected: "1,00 млрд ₽" },
    { value: 1500000000, expected: "1,50 млрд ₽" },

    // Тестирование разных валют
    { value: 50000000, currency: "usd", expected: "50,00 млн $" },
    { value: 50000000, currency: "eur", expected: "50,00 млн €" },
    { value: 50000000, currency: "cny", expected: "50,00 млн ¥" },

    // Меньше порога в разных валютах
    { value: 5000000, currency: "usd", expected: "5 000 000,00 $" },
    { value: 5000000, currency: "eur", expected: "5 000 000,00 €" },
    { value: 5000000, currency: "cny", expected: "5 000 000,00 ¥" },
  ];

  return testCases.map(({ value, currency = "rub", expected }) => {
    const result = formatCurrencyWithThreshold(value, currency, 10000000);
    return {
      value,
      currency,
      expected,
      result,
      matches: result === expected,
    };
  });
};

export default React.memo(TotalValue);
