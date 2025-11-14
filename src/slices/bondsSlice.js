// src/slices/bondsSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchBonds = createAsyncThunk("bonds/fetchBonds", async () => {
  // Запрос к нескольким доскам облигаций
  const boards = ["TQCB", "TQOB"];

  // Параллельно запрашиваем секьюритис и marketdata с каждой доски
  const securitiesRes = await fetch(
    "https://iss.moex.com/iss/engines/stock/markets/bonds/securities.json?iss.meta=off"
  );
  const securitiesData = await securitiesRes.json();

  const marketDataResponses = await Promise.all(
    boards.map((board) =>
      fetch(
        `https://iss.moex.com/iss/engines/stock/markets/bonds/boards/${board}/securities.json?iss.meta=off&iss.only=marketdata&marketdata.columns=SECID,LAST,LASTTOPREVPRICE`
      ).then((res) => res.json())
    )
  );

  // Индексы из securities
  const secCols = securitiesData.securities.columns;
  const secRows = securitiesData.securities.data;
  const secIdIndex = secCols.indexOf("SECID");
  const nameIndex = secCols.indexOf("SECNAME");
  const prevPriceIndex = secCols.indexOf("PREVPRICE");

  // Объединяем marketData из всех досок
  const marketDataMap = {};
  marketDataResponses.forEach((marketData) => {
    const marketCols = marketData.marketdata.columns;
    const marketRows = marketData.marketdata.data;
    const secIdIdx = marketCols.indexOf("SECID");
    const lastPriceIdx = marketCols.indexOf("LAST");
    const dayChangeIdx = marketCols.indexOf("LASTTOPREVPRICE");

    marketRows.forEach((row) => {
      const secid = row[secIdIdx];
      // Если есть уже данные, перезаписываем только если есть lastPrice
      if (!marketDataMap[secid] || row[lastPriceIdx]) {
        marketDataMap[secid] = {
          lastPrice: row[lastPriceIdx],
          dayChange: row[dayChangeIdx],
        };
      }
    });
  });

  return secRows
    .map((row) => {
      const ticker = row[secIdIndex];
      const name = row[nameIndex];
      const prevPrice = row[prevPriceIndex];
      const market = marketDataMap[ticker] || {};
      const lastPrice = market.lastPrice;

      let dayChangePercent = null;

      if (typeof market.dayChange === "number") {
        dayChangePercent = parseFloat(market.dayChange.toFixed(2));
      } else if (
        typeof lastPrice === "number" &&
        typeof prevPrice === "number" &&
        prevPrice !== 0
      ) {
        dayChangePercent = parseFloat(
          (((lastPrice - prevPrice) / prevPrice) * 100).toFixed(2)
        );
      }

      return {
        ticker,
        name,
        pricePercent: typeof prevPrice === "number" ? prevPrice : 100,
        lastPrice: typeof lastPrice === "number" ? lastPrice : null,
        yearChangePercent: dayChangePercent,
        type: "bond",
      };
    })
    .filter((bond) => bond.ticker && bond.name);
});

const bondsSlice = createSlice({
  name: "bonds",
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
      .addCase(fetchBonds.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBonds.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchBonds.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { clearItems } = bondsSlice.actions;
export default bondsSlice.reducer;
