// src/hooks/usePortfolioSharing.js
import { useState, useEffect, useCallback } from "react";
import LZString from "lz-string";

// Функция для получения иконки на основе типа и других характеристик
const getAssetIconKey = (asset) => {
  switch (asset.type) {
    case "bond":
      // Для облигаций ОФЗ
      if (
        asset.name?.includes("ОФЗ") ||
        asset.ticker?.includes("OFZ") ||
        asset.name?.toLowerCase().includes("федерал")
      ) {
        return "bond-ofz";
      }
      return "bond-default";

    case "metal":
      // Для металлов - по тикеру
      const metalTickers = ["XAU", "XAG", "XPT", "XPD"];
      return metalTickers.includes(asset.ticker)
        ? `metal-${asset.ticker}`
        : "metal-default";

    case "deposit":
      return "deposit";

    case "realestate":
      return "realestate";

    case "business":
      return "business";

    default:
      // Для акций, валют, крипты - проверяем наличие иконки
      if (asset.iconUrl && asset.iconUrl !== "—" && asset.iconUrl !== "") {
        return "has-icon"; // Флаг, что у актива есть иконка
      }

      // Для валют и криптовалют сохраняем их оригинальные иконки
      if (asset.type === "currency" || asset.type === "crypto") {
        return "has-icon"; // Всегда сохраняем иконки для валют и крипты
      }

      return "default";
  }
};

// Более агрессивное сжатие с сохранением иконок
const encodePortfolioData = (assets) => {
  try {
    if (!assets || assets.length === 0) return "";

    // 1. Используем массивы вместо объектов для максимального сжатия
    const encodedAssets = assets.map((asset) => {
      const encoded = [];

      // Позиции в массиве:
      // 0: type (один символ)
      // 1: name (укороченное)
      // 2: quantity
      // 3: icon key (один символ)
      // 4-...: дополнительные поля

      // Кодируем тип одним символом
      const typeMap = {
        share: "s",
        bond: "b",
        currency: "c",
        crypto: "x",
        metal: "m",
        deposit: "d",
        realestate: "r",
        business: "u",
      };

      encoded.push(typeMap[asset.type] || "o"); // 0: тип
      encoded.push(asset.name.substring(0, 30)); // 1: имя (30 символов макс)
      encoded.push(asset.quantity || 1); // 2: количество

      // Кодируем ключ иконки одним символом
      const iconKey = getAssetIconKey(asset);
      const iconMap = {
        default: "0",
        "has-icon": "1",
        "bond-default": "2",
        "bond-ofz": "3",
        "metal-XAU": "4",
        "metal-XAG": "5",
        "metal-XPT": "6",
        "metal-XPD": "7",
        "metal-default": "8",
        deposit: "9",
        realestate: "a",
        business: "b",
      };
      encoded.push(iconMap[iconKey] || "0"); // 3: ключ иконки

      // Сохраняем иконку URL для всех типов, которые имеют кастомные иконки
      if (asset.iconUrl && asset.iconUrl !== "—" && asset.iconUrl !== "") {
        // Для валют и криптовалют сохраняем полный URL
        if (asset.type === "currency" || asset.type === "crypto") {
          encoded.push(asset.iconUrl); // 4: полный URL иконки
        } else {
          // Для других типов сжимаем URL
          let shortUrl = asset.iconUrl
            .replace(/^https?:\/\//, "")
            .replace(/^www\./, "")
            .split("/")
            .slice(0, 3)
            .join("/");
          encoded.push(shortUrl); // 4: короткий URL иконки
        }
      } else {
        encoded.push(""); // 4: пустая строка для иконки
      }

      // Кодируем дополнительные поля в зависимости от типа
      switch (asset.type) {
        case "share":
        case "crypto":
        case "metal":
          encoded.push(Math.round((asset.price || 0) * 100) || 0); // 5: цена в копейках
          encoded.push(asset.ticker || ""); // 6: тикер
          encoded.push(Math.round((asset.yearChangePercent || 0) * 10)); // 7: доходность *10
          // Сохраняем код для валют и крипты для восстановления иконок
          if (asset.type === "crypto" || asset.type === "currency") {
            encoded.push(asset.code || asset.ticker || ""); // 8: код/тикер для восстановления
          }
          break;

        case "bond":
          encoded.push(Math.round((asset.pricePercent || 1000) * 10)); // 5: процент *10
          encoded.push(asset.ticker || ""); // 6: тикер
          encoded.push(Math.round((asset.yearChangePercent || 0) * 10)); // 7: доходность *10
          break;

        case "currency":
          encoded.push(Math.round((asset.price || 0) * 100) || 0); // 5: цена в копейках
          encoded.push(asset.code || ""); // 6: код
          encoded.push(Math.round((asset.yearChangePercent || 0) * 10)); // 7: доходность *10
          encoded.push(asset.code || ""); // 8: код для восстановления иконки
          break;

        case "deposit":
          encoded.push(Math.round(asset.value || 0)); // 5: сумма
          encoded.push(Math.round((asset.rate || 0) * 10)); // 6: ставка *10
          encoded.push(asset.termMonths || 12); // 7: срок месяцев
          break;

        case "realestate":
          encoded.push(Math.round(asset.value || 0)); // 5: стоимость
          // Кодируем категорию одним символом
          const catMap = {
            "Жилая недвижимость": "h",
            "Коммерческая недвижимость": "c",
            "Земельные участки": "l",
            "Специального назначения": "s",
          };
          encoded.push(catMap[asset.category] || "h"); // 6: категория
          encoded.push(Math.round((asset.yieldPercent || 0) * 10)); // 7: доходность *10
          encoded.push(asset.address || ""); // 8: адрес (первые 50 символов)
          break;

        case "business":
          encoded.push(Math.round(asset.value || 0)); // 5: стоимость
          // Кодируем тип бизнеса одним символом
          const busMap = {
            "Малый бизнес": "s",
            "Средний бизнес": "m",
            "Крупный бизнес": "l",
            Стартап: "t",
            Франшиза: "f",
            "Интернет-бизнес": "i",
            "Сфера услуг": "v",
            Производство: "p",
            Торговля: "g",
            Другое: "o",
          };
          encoded.push(busMap[asset.businessType] || "s"); // 6: тип бизнеса
          encoded.push(Math.round(asset.monthlyProfit || 0)); // 7: месячная прибыль
          encoded.push(Math.round((asset.profitMargin || 0) * 10)); // 8: маржинальность *10
          break;

        default:
          encoded.push(Math.round(asset.value || 0)); // 5: значение
      }

      return encoded;
    });

    // 2. Конвертируем в компактный JSON (без пробелов)
    const jsonString = JSON.stringify(encodedAssets);

    // 3. Двойное сжатие для максимального уменьшения
    const compressed = LZString.compressToEncodedURIComponent(jsonString);

    // 4. Дополнительная оптимизация: убираем = в конце
    return compressed.replace(/=+$/, "");
  } catch (error) {
    console.error("Error encoding portfolio:", error);
    return "";
  }
};

const decodePortfolioData = (encodedString) => {
  try {
    if (!encodedString) return [];

    // 1. Восстанавливаем padding если нужно
    let compressed = encodedString;
    while (compressed.length % 4) {
      compressed += "=";
    }

    // 2. Декомпрессия
    const jsonString = LZString.decompressFromEncodedURIComponent(compressed);
    if (!jsonString) return [];

    const encodedAssets = JSON.parse(jsonString);

    // 3. Восстанавливаем объекты с иконками
    return encodedAssets.map((encoded, index) => {
      const portfolioId = `p-${index}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;

      // Базовый объект
      const base = {
        name: encoded[1] || `Актив ${index + 1}`,
        quantity: encoded[2] || 1,
        portfolioId,
      };

      // Определяем тип по первому символу
      const typeMap = {
        s: "share",
        b: "bond",
        c: "currency",
        x: "crypto",
        m: "metal",
        d: "deposit",
        r: "realestate",
        u: "business",
        o: "other",
      };

      const type = typeMap[encoded[0]] || "other";
      base.type = type;

      // Восстанавливаем ключ иконки
      const iconKeyChar = encoded[3] || "0";
      const iconReverseMap = {
        0: { key: "default", url: null },
        1: { key: "has-icon", url: encoded[4] || null },
        2: { key: "bond-default", url: null },
        3: { key: "bond-ofz", url: null },
        4: { key: "metal-XAU", url: null },
        5: { key: "metal-XAG", url: null },
        6: { key: "metal-XPT", url: null },
        7: { key: "metal-XPD", url: null },
        8: { key: "metal-default", url: null },
        9: { key: "deposit", url: null },
        a: { key: "realestate", url: null },
        b: { key: "business", url: null },
      };

      const iconInfo = iconReverseMap[iconKeyChar] || iconReverseMap["0"];

      // Восстанавливаем URL иконки
      let iconUrl = null;
      if (iconInfo.key === "has-icon" && iconInfo.url) {
        // Для валют и криптовалют URL уже полный
        if (type === "currency" || type === "crypto") {
          iconUrl = iconInfo.url;
        } else {
          // Для других типов восстанавливаем из сокращенного URL
          if (!iconInfo.url.startsWith("http")) {
            iconUrl = `https://${iconInfo.url}`;
          } else {
            iconUrl = iconInfo.url;
          }
        }
      }

      // Добавляем информацию об иконке
      base.iconInfo = iconInfo.key;
      if (iconUrl) {
        base.iconUrl = iconUrl;
      } else if (type === "currency" || type === "crypto") {
        // Для валют и крипты пытаемся восстановить иконку из кода/тикера
        const code = encoded[8] || encoded[6] || "";
        if (code) {
          // Это будет обработано компонентом AssetIcon
          base.iconInfo = "has-icon";
        }
      }

      // Восстанавливаем в зависимости от типа
      switch (type) {
        case "share":
          return {
            ...base,
            price: (encoded[5] || 0) / 100,
            ticker: encoded[6] || "",
            yearChangePercent: (encoded[7] || 0) / 10,
            hasCustomLogo: iconInfo.key === "has-icon",
          };

        case "crypto":
          return {
            ...base,
            price: (encoded[5] || 0) / 100,
            ticker: encoded[6] || "",
            code: encoded[6] || "",
            yearChangePercent: (encoded[7] || 0) / 10,
            iconInfo: "has-icon", // Всегда помечаем что есть иконка
          };

        case "metal":
          return {
            ...base,
            price: (encoded[5] || 0) / 100,
            ticker: encoded[6] || "",
            yearChangePercent: (encoded[7] || 0) / 10,
            hasCustomLogo: iconInfo.key === "has-icon",
          };

        case "bond":
          const isOFZ = iconInfo.key === "bond-ofz";
          return {
            ...base,
            pricePercent: (encoded[5] || 1000) / 10,
            ticker: encoded[6] || "",
            yearChangePercent: (encoded[7] || 0) / 10,
            isOFZ: isOFZ,
          };

        case "currency":
          return {
            ...base,
            price: (encoded[5] || 0) / 100,
            code: encoded[6] || "",
            yearChangePercent: (encoded[7] || 0) / 10,
            iconInfo: "has-icon", // Всегда помечаем что есть иконка
          };

        case "deposit":
          return {
            ...base,
            value: encoded[5] || 0,
            rate: (encoded[6] || 0) / 10,
            termMonths: encoded[7] || 12,
            yearChangePercent: (encoded[6] || 0) / 10,
          };

        case "realestate":
          const catMap = {
            h: "Жилая недвижимость",
            c: "Коммерческая недвижимость",
            l: "Земельные участки",
            s: "Специального назначения",
          };

          return {
            ...base,
            value: encoded[5] || 0,
            category: catMap[encoded[6]] || "Жилая недвижимость",
            yieldPercent: (encoded[7] || 0) / 10,
            yearChangePercent: (encoded[7] || 0) / 10,
            address: encoded[8] || "Не указан",
          };

        case "business":
          const busMap = {
            s: "Малый бизнес",
            m: "Средний бизнес",
            l: "Крупный бизнес",
            t: "Стартап",
            f: "Франшиза",
            i: "Интернет-бизнес",
            v: "Сфера услуг",
            p: "Производство",
            g: "Торговля",
            o: "Другое",
          };

          return {
            ...base,
            value: encoded[5] || 0,
            businessType: busMap[encoded[6]] || "Малый бизнес",
            monthlyProfit: encoded[7] || 0,
            profitMargin: (encoded[8] || 0) / 10,
            yearChangePercent: 0,
          };

        default:
          return {
            ...base,
            value: encoded[5] || 0,
          };
      }
    });
  } catch (error) {
    console.error("Error decoding portfolio:", error);
    return [];
  }
};

// Очень короткий ID (4 символа)
const generateShortId = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
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
    const data = urlParams.get("d"); // Используем 'd' (data)

    if (!data) {
      setIsLoading(false);
      return { id: null, assets: [] };
    }

    try {
      let id = null;
      let compressedData = data;

      // Проверяем есть ли ID (первые 4 символа могут быть ID)
      if (data.length > 4 && data[4] === ":") {
        id = data.substring(0, 4);
        compressedData = data.substring(5);
      } else {
        id = generateShortId();
      }

      const assets = decodePortfolioData(compressedData);

      setIsLoading(false);

      if (assets.length > 0) {
        setPortfolioId(id);
      }

      return { id, assets };
    } catch (error) {
      console.error("Error parsing URL:", error);
      setIsLoading(false);
      return { id: null, assets: [] };
    }
  }, []);

  // Сохранение портфеля
  const savePortfolio = useCallback(async (assets) => {
    const compressedData = encodePortfolioData(assets);
    if (!compressedData) {
      return {
        success: false,
        portfolioId: null,
        shareUrl: null,
        error: "Ошибка при кодировании данных портфеля",
      };
    }

    // Генерируем очень короткий ID
    const shortId = generateShortId();

    // Формат: "id:data" (4 символа ID + : + данные)
    const urlData = `${shortId}:${compressedData}`;

    // Создаем URL
    const shareUrl = `${window.location.origin}${window.location.pathname}?d=${urlData}`;

    // Проверяем длину URL
    if (shareUrl.length > 1800) {
      // Слишком длинная - пробуем без ID
      const urlDataNoId = compressedData;
      const shareUrlNoId = `${window.location.origin}${window.location.pathname}?d=${urlDataNoId}`;

      if (shareUrlNoId.length <= 2000) {
        if (window.history.replaceState) {
          window.history.replaceState({}, "", shareUrlNoId);
        }

        return {
          success: true,
          portfolioId: shortId,
          shareUrl: shareUrlNoId,
          warning: "Ссылка очень длинная. ID не был добавлен в URL.",
        };
      } else {
        return {
          success: false,
          portfolioId: shortId,
          shareUrl: null,
          error: `Портфель слишком большой (${shareUrl.length} символов). Максимально допустимо ~2000 символов.`,
          suggestion:
            "Удалите некоторые активы или используйте более короткие названия",
        };
      }
    }

    // Нормальная длина - обновляем URL
    if (window.history.replaceState) {
      window.history.replaceState({}, "", shareUrl);
    }

    setPortfolioId(shortId);

    return {
      success: true,
      portfolioId: shortId,
      shareUrl: shareUrl,
    };
  }, []);

  // Обновление портфеля
  const updatePortfolio = useCallback(
    async (assets, currentPortfolioId = null) => {
      return savePortfolio(assets);
    },
    [savePortfolio]
  );

  // Создание ссылки для шаринга
  const createShareableLink = useCallback(
    (assets) => {
      const compressedData = encodePortfolioData(assets);
      if (!compressedData) return null;

      const shareId = portfolioId || generateShortId();

      // Проверяем длину
      const urlData = `${shareId}:${compressedData}`;
      const fullUrl = `${window.location.origin}${window.location.pathname}?d=${urlData}`;

      if (fullUrl.length > 2000) {
        // Пробуем без ID
        const urlNoId = `${window.location.origin}${window.location.pathname}?d=${compressedData}`;
        return urlNoId.length <= 2000 ? urlNoId : null;
      }

      return fullUrl;
    },
    [portfolioId]
  );

  // Очистка ID портфеля
  const clearPortfolioId = useCallback(() => {
    setPortfolioId(null);
    if (window.history.replaceState) {
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  return {
    portfolioId,
    isLoading,
    getPortfolioFromUrl,
    savePortfolio,
    updatePortfolio,
    createShareableLink,
    clearPortfolioId,
  };
};
