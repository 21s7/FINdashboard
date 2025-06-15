import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchShares = createAsyncThunk("shares/fetchShares", async () => {
  const securitiesRes = await fetch(
    "https://iss.moex.com/iss/engines/stock/markets/shares/securities.json?iss.meta=off"
  );
  const securitiesData = await securitiesRes.json();

  const pricesRes = await fetch(
    "https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities.json?iss.meta=off&iss.only=marketdata"
  );
  const pricesData = await pricesRes.json();

  const secCols = securitiesData.securities.columns;
  const secRows = securitiesData.securities.data;
  const secIdIndex = secCols.indexOf("SECID");
  const nameIndex = secCols.indexOf("SECNAME");

  const allStocks = secRows
    .map((row) => ({
      ticker: row[secIdIndex],
      name: row[nameIndex],
    }))
    .filter((a) => a.ticker && a.name);

  const quoteCols = pricesData.marketdata.columns;
  const quoteRows = pricesData.marketdata.data;
  const quoteIdIndex = quoteCols.indexOf("SECID");
  const priceIndex = quoteCols.indexOf("LAST");

  const priceMap = {};
  quoteRows.forEach((row) => {
    const ticker = row[quoteIdIndex];
    const price = row[priceIndex];
    if (ticker && price !== null) {
      priceMap[ticker] = price;
    }
  });

  return allStocks.map((stock) => ({
    ...stock,
    price: priceMap[stock.ticker] ?? "—",
  }));
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
