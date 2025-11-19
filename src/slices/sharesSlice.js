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

  // Создаем маппинг тикеров к именам из securities
  const secCols = securitiesData.securities.columns;
  const secRows = securitiesData.securities.data;
  const nameMap = {};
  secRows.forEach((row) => {
    nameMap[row[secCols.indexOf("SECID")]] = row[secCols.indexOf("SECNAME")];
  });

  return marketDataRows
    .map((row) => {
      const ticker = row[secIdIndex];
      const price = row[priceIndex];
      const yearChange = row[yearChangeIndex];

      // LASTTOPREVPRICE уже содержит процентное изменение
      const yearChangePercent = typeof yearChange === "number" ? yearChange : 0;

      return {
        ticker,
        name: nameMap[ticker] || row[nameIndex],
        price: price || "—",
        yearChangeValue: 0, // Можно рассчитать при необходимости
        yearChangePercent: parseFloat(yearChangePercent.toFixed(2)),
        type: "share",
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
