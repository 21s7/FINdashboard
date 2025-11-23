// src/slices/sharesSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

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

      // Генерируем URL иконки если есть ISIN
      const iconUrl = securityData?.isin
        ? `https://invest-brands.cdn-tinkoff.ru/${securityData.isin}x160.png`
        : null;

      return {
        ticker,
        name: securityData?.name || row[nameIndex],
        price: price || "—",
        yearChangeValue: 0,
        yearChangePercent: parseFloat(yearChangePercent.toFixed(2)),
        type: "share",
        isin: securityData?.isin,
        iconUrl: iconUrl,
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
  },
  reducers: {
    clearItems: (state) => {
      state.items = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShares.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchShares.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchShares.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { clearItems } = sharesSlice.actions;
export default sharesSlice.reducer;
