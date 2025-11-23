// src/slices/sharesSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Кастомные логотипы для конкретных ISIN
const customLogos = {
  RU000A107T19:
    "https://img.logo.dev/name/ya.ru?token=pk_FE2qDcjpSiSZKmgWCG-jQQ&size=160&format=png&retina=true",
  RU000A107UL4:
    "https://img.logo.dev/tbank.ru?token=pk_FE2qDcjpSiSZKmgWCG-jQQ&size=160&format=png&retina=true",
  RU000A108X38:
    "https://img.logo.dev/name/x5?token=pk_FE2qDcjpSiSZKmgWCG-jQQ&size=160&format=png&retina=true",
  RU000A10B5G8:
    "https://img.logo.dev/fix-price.com?token=pk_FE2qDcjpSiSZKmgWCG-jQQ&size=160&format=png&retina=true",

  // Добавьте другие кастомные логотипы здесь по формату:
  // "ISIN_CODE": "URL_ЛОГОТИПА",
};

export const fetchShares = createAsyncThunk("shares/fetchShares", async () => {
  const [securitiesRes, marketDataRes] = await Promise.all([
    fetch(
      "https://iss.moex.com/iss/engines/stock/markets/shares/securities.json?iss.meta=off"
    ),
    fetch(
      "https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities.json?iss.meta=off&iss.only=marketdata&marketdata.columns=SECID,SECNAME,LAST,LASTTOPREVPRICE"
    ),
  ]);

  const [securitiesData, marketData] = await Promise.all([
    securitiesRes.json(),
    marketDataRes.json(),
  ]);

  // Получаем данные из marketdata
  const marketDataCols = marketData.marketdata.columns;
  const marketDataRows = marketData.marketdata.data;

  const secIdIndex = marketDataCols.indexOf("SECID");
  const nameIndex = marketDataCols.indexOf("SECNAME");
  const priceIndex = marketDataCols.indexOf("LAST");
  const yearChangeIndex = marketDataCols.indexOf("LASTTOPREVPRICE");

  // Получаем ISIN коды из securities для иконок
  const secCols = securitiesData.securities.columns;
  const secRows = securitiesData.securities.data;

  const secIdIndexSec = secCols.indexOf("SECID");
  const isinIndex = secCols.indexOf("ISIN");
  const nameIndexSec = secCols.indexOf("SECNAME");

  // Создаем маппинг тикеров к данным
  const securitiesMap = {};
  secRows.forEach((row) => {
    const ticker = row[secIdIndexSec];
    securitiesMap[ticker] = {
      name: row[nameIndexSec],
      isin: row[isinIndex],
    };
  });

  return marketDataRows
    .map((row) => {
      const ticker = row[secIdIndex];
      const price = row[priceIndex];
      const yearChange = row[yearChangeIndex];
      const securityData = securitiesMap[ticker];

      // LASTTOPREVPRICE уже содержит процентное изменение
      const yearChangePercent = typeof yearChange === "number" ? yearChange : 0;

      // Получаем ISIN для проверки кастомного логотипа
      const isin = securityData?.isin;

      // Определяем URL иконки: сначала проверяем кастомные логотипы, затем стандартные
      let iconUrl = null;
      if (isin && customLogos[isin]) {
        // Используем кастомный логотип если он есть
        iconUrl = customLogos[isin];
      } else if (isin) {
        // Используем стандартный URL если кастомного нет
        iconUrl = `https://invest-brands.cdn-tinkoff.ru/${isin}x160.png`;
      }

      return {
        ticker,
        name: securityData?.name || row[nameIndex],
        price: price || "—",
        yearChangeValue: 0,
        yearChangePercent: parseFloat(yearChangePercent.toFixed(2)),
        type: "share",
        isin: isin,
        iconUrl: iconUrl,
        hasCustomLogo: !!(isin && customLogos[isin]), // Флаг кастомного логотипа
      };
    })
    .filter((asset) => asset.ticker && asset.name);
});

const sharesSlice = createSlice({
  name: "shares",
  initialState: {
    items: [],
    status: "idle",
    error: null,
    customLogos: customLogos, // Сохраняем кастомные логотипы в состоянии
  },
  reducers: {
    clearItems: (state) => {
      state.items = [];
      state.status = "idle";
      state.error = null;
    },
    // Новый редюсер для добавления кастомных логотипов
    addCustomLogo: (state, action) => {
      const { isin, logoUrl } = action.payload;
      state.customLogos[isin] = logoUrl;

      // Обновляем иконки в существующих элементах
      state.items.forEach((item) => {
        if (item.isin === isin) {
          item.iconUrl = logoUrl;
          item.hasCustomLogo = true;
        }
      });
    },
    // Редюсер для удаления кастомного логотипа
    removeCustomLogo: (state, action) => {
      const isin = action.payload;
      delete state.customLogos[isin];

      // Возвращаем стандартные иконки для элементов
      state.items.forEach((item) => {
        if (item.isin === isin) {
          item.iconUrl = item.isin
            ? `https://invest-brands.cdn-tinkoff.ru/${item.isin}x160.png`
            : null;
          item.hasCustomLogo = false;
        }
      });
    },
    // Редюсер для обновления нескольких логотипов сразу
    updateCustomLogos: (state, action) => {
      const logos = action.payload;
      Object.assign(state.customLogos, logos);

      // Обновляем иконки в существующих элементах
      state.items.forEach((item) => {
        if (item.isin && logos[item.isin]) {
          item.iconUrl = logos[item.isin];
          item.hasCustomLogo = true;
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShares.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchShares.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Применяем кастомные логотипы к загруженным данным
        state.items = action.payload.map((item) => {
          if (item.isin && state.customLogos[item.isin]) {
            return {
              ...item,
              iconUrl: state.customLogos[item.isin],
              hasCustomLogo: true,
            };
          }
          return item;
        });
      })
      .addCase(fetchShares.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const {
  clearItems,
  addCustomLogo,
  removeCustomLogo,
  updateCustomLogos,
} = sharesSlice.actions;

export default sharesSlice.reducer;
