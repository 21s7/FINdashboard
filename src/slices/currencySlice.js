import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// 1. Асинхронный thunk — для загрузки валют с сервера
export const fetchCurrency = createAsyncThunk(
  "currency/fetchCurrency",
  async () => {
    const res = await fetch("https://www.cbr-xml-daily.ru/daily_json.js");
    const data = await res.json();

    // Преобразуем объект валют в массив:
    return Object.entries(data.Valute).map(([code, val]) => ({
      code,
      name: val.Name,
      value: val.Value.toFixed(2),
    }));
  }
);

// 2. Начальное состояние
const initialState = {
  items: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// 3. Создаём slice
const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {},
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

// 4. Экспортируем редьюсер по умолчанию
export default currencySlice.reducer;
