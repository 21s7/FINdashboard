// src/slices/bondsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// 🔁 Асинхронная загрузка данных об облигациях
export const fetchBonds = createAsyncThunk("bonds/fetchBonds", async () => {
  const res = await fetch(
    "https://iss.moex.com/iss/engines/stock/markets/bonds/securities.json?iss.meta=off"
  );
  const data = await res.json();

  const cols = data.securities.columns;
  const rows = data.securities.data;
  const secIdIndex = cols.indexOf("SECID");
  const nameIndex = cols.indexOf("SECNAME");

  const bondList = rows
    .map((row) => ({
      ticker: row[secIdIndex],
      name: row[nameIndex],
    }))
    .filter((a) => a.ticker && a.name);

  return bondList;
});

const bondsSlice = createSlice({
  name: "bonds",
  initialState: {
    items: [],
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {},
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

export default bondsSlice.reducer;
