import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
export const fetchCurrency = createAsyncThunk(
  "currency/fetchCurrency",
  async () => {
    const res = await fetch("https://www.cbr-xml-daily.ru/daily_json.js");
    const data = await res.json();

    return Object.entries(data.Valute).map(([code, val]) => ({
      id: code, // Уникальный идентификатор
      ticker: code, // Для единообразия с другими активами
      code, // Сохраняем оригинальный код
      name: val.Name,
      price: val.Value, // Основное поле для цены (унифицированное)
      nominal: val.Nominal, // Номинал (например, 1 для USD, 10 для CNY)
      value: val.Value, // Оставляем для обратной совместимости
      type: "currency", // Явно указываем тип
    }));
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
