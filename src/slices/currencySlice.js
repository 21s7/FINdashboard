// src/slices/currencySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchCurrency = createAsyncThunk(
  "currency/fetchCurrency",
  async () => {
    const res = await fetch("https://www.cbr-xml-daily.ru/daily_json.js");
    const data = await res.json();

    const currencies = Object.entries(data.Valute).map(([code, val]) => {
      const dayChangePercent =
        val.Previous && val.Previous !== 0
          ? +(((val.Value - val.Previous) / val.Previous) * 100).toFixed(2)
          : 0;

      return {
        id: code, // Уникальный идентификатор
        ticker: code, // Для единообразия с другими активами
        code,
        name: val.Name,
        price: val.Value,
        nominal: val.Nominal,
        value: val.Value,
        yearChangePercent: dayChangePercent, // дневное изменение %
        type: "currency",
      };
    });

    // Добавляем российский рубль вручную с 0 изменением
    currencies.unshift({
      id: "RUB",
      ticker: "RUB",
      code: "RUB",
      name: "Российский рубль",
      price: 1,
      nominal: 1,
      value: 1,
      yearChangePercent: 0,
      type: "currency",
    });

    return currencies;
  }
);

const initialState = {
  items: [],
  status: "idle",
  error: null,
};

const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    clearItems: (state) => {
      state.items = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrency.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCurrency.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCurrency.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { clearItems } = currencySlice.actions;
export default currencySlice.reducer;
