// src/hooks/usePortfolioSharing.js
import { useState, useEffect, useCallback } from "react";
import LZString from "lz-string";

// Более агрессивное сжатие с меньшими потерями
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
      // 3-...: дополнительные поля в зависимости от типа

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
      encoded.push(asset.name.substring(0, 20)); // 1: имя (20 символов макс)
      encoded.push(asset.quantity || 1); // 2: количество

      // Кодируем дополнительные поля в зависимости от типа
      switch (asset.type) {
        case "share":
        case "crypto":
        case "metal":
          encoded.push(Math.round(asset.price * 100)); // 3: цена в копейках
          encoded.push(asset.ticker || ""); // 4: тикер
          encoded.push(Math.round(asset.yearChangePercent * 10)); // 5: доходность *10
          break;

        case "bond":
          encoded.push(Math.round(asset.pricePercent * 10)); // 3: процент *10
          encoded.push(asset.ticker || ""); // 4: тикер
          encoded.push(Math.round(asset.yearChangePercent * 10)); // 5: доходность *10
          break;

        case "currency":
          encoded.push(Math.round(asset.price * 100)); // 3: цена в копейках
          encoded.push(asset.code || ""); // 4: код
          encoded.push(Math.round(asset.yearChangePercent * 10)); // 5: доходность *10
          break;

        case "deposit":
          encoded.push(Math.round(asset.value)); // 3: сумма
          encoded.push(Math.round(asset.rate * 10)); // 4: ставка *10
          encoded.push(asset.termMonths || 12); // 5: срок месяцев
          break;

        case "realestate":
          encoded.push(Math.round(asset.value)); // 3: стоимость
          // Кодируем категорию одним символом
          const catMap = {
            "Жилая недвижимость": "h",
            "Коммерческая недвижимость": "c",
            "Земельные участки": "l",
            "Специального назначения": "s",
          };
          encoded.push(catMap[asset.category] || "h"); // 4: категория
          encoded.push(Math.round((asset.yieldPercent || 0) * 10)); // 5: доходность *10
          break;

        case "business":
          encoded.push(Math.round(asset.value)); // 3: стоимость
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
          encoded.push(busMap[asset.businessType] || "s"); // 4: тип бизнеса
          encoded.push(Math.round(asset.monthlyProfit || 0)); // 5: месячная прибыль
          break;

        default:
          encoded.push(Math.round(asset.value || 0)); // 3: значение
      }

      return encoded;
    });

    // 2. Конвертируем в компактный JSON (без пробелов)
    const jsonString = JSON.stringify(encodedAssets);

    // 3. Двойное сжатие для максимального уменьшения
    // Сначала LZ-String, потом base64 для URL
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

    // 3. Восстанавливаем объекты
    return encodedAssets.map((encoded, index) => {
      const portfolioId = `p-${index}-${Date.now().toString(36)}`;

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

      // Восстанавливаем в зависимости от типа
      switch (type) {
        case "share":
        case "crypto":
        case "metal":
          return {
            ...base,
            price: (encoded[3] || 0) / 100,
            ticker: encoded[4] || "",
            yearChangePercent: (encoded[5] || 0) / 10,
          };

        case "bond":
          return {
            ...base,
            pricePercent: (encoded[3] || 1000) / 10,
            ticker: encoded[4] || "",
            yearChangePercent: (encoded[5] || 0) / 10,
          };

        case "currency":
          return {
            ...base,
            price: (encoded[3] || 0) / 100,
            code: encoded[4] || "",
            yearChangePercent: (encoded[5] || 0) / 10,
          };

        case "deposit":
          return {
            ...base,
            value: encoded[3] || 0,
            rate: (encoded[4] || 0) / 10,
            termMonths: encoded[5] || 12,
            yearChangePercent: (encoded[4] || 0) / 10, // ставка = доходность
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
            value: encoded[3] || 0,
            category: catMap[encoded[4]] || "Жилая недвижимость",
            yieldPercent: (encoded[5] || 0) / 10,
            yearChangePercent: (encoded[5] || 0) / 10,
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
            value: encoded[3] || 0,
            businessType: busMap[encoded[4]] || "Малый бизнес",
            monthlyProfit: encoded[5] || 0,
            yearChangePercent: 0, // для бизнеса рассчитывается отдельно
          };

        default:
          return {
            ...base,
            value: encoded[3] || 0,
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
    const data = urlParams.get("d"); // Используем 'd' (data) вместо 'p'

    if (!data) {
      setIsLoading(false);
      return { id: null, assets: [] };
    }

    try {
      // Формат может быть просто данные или id:данные
      let id = null;
      let compressedData = data;

      // Проверяем есть ли ID (первые 4 символа могут быть ID)
      if (data.length > 4 && data[4] === ":") {
        id = data.substring(0, 4);
        compressedData = data.substring(5);
      } else {
        // Нет ID в данных, генерируем новый
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
        // Все равно слишком длинная
        return {
          success: false,
          portfolioId: shortId,
          shareUrl: null,
          error: `Портфель слишком большой (${shareUrl.length} символов). Максимально допустимо ~2000 символов. Уменьшите количество активов или их названия.`,
          suggestion:
            "Попробуйте удалить некоторые активы или использовать более короткие названия",
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

  // Обновление портфеля (аналогично сохранению)
  const updatePortfolio = useCallback(
    async (assets, currentPortfolioId = null) => {
      return savePortfolio(assets); // Используем ту же логику
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
