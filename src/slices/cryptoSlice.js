// src/slices/cryptoSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// 🔁 Асинхронная загрузка криптовалют
export const fetchCrypto = createAsyncThunk("crypto/fetchCrypto", async () => {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=rub&order=market_cap_desc&per_page=100&page=1&sparkline=false"
  );
  const data = await res.json();

  return data.map((coin) => ({
    id: coin.id,
    name: coin.name,
    price: coin.current_price,
  }));
});

const cryptoSlice = createSlice({
  name: "crypto",
  initialState: {
    items: [],
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCrypto.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCrypto.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCrypto.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default cryptoSlice.reducer;
