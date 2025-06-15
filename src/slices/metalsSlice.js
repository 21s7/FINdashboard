import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_KEY = "cd0d2124f9083e64567f65d05ca5e454";
const BASE_CURRENCY = "RUB";
const METALS = ["XAU", "XAG", "XPT", "XPD"];
const OUNCE_IN_GRAMS = 31.1035;

const METAL_NAMES = {
  XAU: "Золото",
  XAG: "Серебро",
  XPT: "Платина",
  XPD: "Палладий",
};

export const fetchMetals = createAsyncThunk("metals/fetchMetals", async () => {
  const response = await fetch(
    `https://api.metalpriceapi.com/v1/latest?api_key=${API_KEY}&base=${BASE_CURRENCY}&currencies=${METALS.join(
      ","
    )}`
  );

  if (!response.ok) {
    throw new Error(`Ошибка загрузки данных: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error("Ошибка от metalpriceapi.com");
  }

  const result = METALS.map((symbol) => {
    const rubPerOunce = 1 / data.rates[symbol];
    const rubPerGram = rubPerOunce / OUNCE_IN_GRAMS;

    return {
      id: symbol,
      ticker: symbol,
      name: METAL_NAMES[symbol],
      price: Number(rubPerGram.toFixed(2)),
      priceUsd: null,
      lastUpdate: new Date(data.timestamp * 1000).toISOString(),
    };
  });

  return result;
});

const metalsSlice = createSlice({
  name: "metals",
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
      .addCase(fetchMetals.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMetals.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchMetals.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { clearItems } = metalsSlice.actions;
export default metalsSlice.reducer;
