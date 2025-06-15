import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchMetals = createAsyncThunk("metals/fetchMetals", async () => {
  try {
    // Получаем курсы XAU (золото), XAG (серебро) относительно USD
    const response = await fetch(
      "https://api.exchangerate.host/latest?base=USD&symbols=XAU,XAG"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // data.rates будет примерно: { XAU: 0.00055, XAG: 0.04 }
    // Это количество унций металла на 1 доллар
    // Чтобы получить цену 1 унции в USD — инвертируем:
    const rates = data.rates;

    const goldPrice = rates.XAU ? 1 / rates.XAU : 0;
    const silverPrice = rates.XAG ? 1 / rates.XAG : 0;

    const metalsList = [
      {
        id: "XAU",
        ticker: "XAU",
        name: "Золото",
        price: Number(goldPrice.toFixed(2)),
      },
      {
        id: "XAG",
        ticker: "XAG",
        name: "Серебро",
        price: Number(silverPrice.toFixed(2)),
      },
    ];

    return metalsList;
  } catch (err) {
    console.error("❌ Ошибка загрузки металлов:", err);

    // fallback — мок-данные
    return [
      { id: "XAU", ticker: "XAU", name: "Золото", price: 1900 },
      { id: "XAG", ticker: "XAG", name: "Серебро", price: 25 },
    ];
  }
});

// Slice (без изменений)
const metalsSlice = createSlice({
  name: "metals",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
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

export default metalsSlice.reducer;
