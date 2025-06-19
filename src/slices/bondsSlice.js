import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchBonds = createAsyncThunk("bonds/fetchBonds", async () => {
  // Запрашиваем базовую информацию об облигациях
  const securitiesRes = await fetch(
    "https://iss.moex.com/iss/engines/stock/markets/bonds/securities.json?iss.meta=off&securities.columns=SECID,SECNAME"
  );
  const securitiesData = await securitiesRes.json();

  // Запрашиваем только последние цены (без FACEVALUE)
  const marketdataRes = await fetch(
    "https://iss.moex.com/iss/engines/stock/markets/bonds/boards/TQOB/securities.json?iss.meta=off&iss.only=marketdata&marketdata.columns=SECID,LAST"
  );
  const marketdataData = await marketdataRes.json();

  // Обрабатываем данные об облигациях
  const securities = securitiesData.securities.data.map(([secId, secName]) => ({
    ticker: secId,
    name: secName,
  }));

  // Создаем карту цен
  const priceMap = {};
  marketdataData.marketdata.data.forEach(([secId, last]) => {
    if (secId && last !== null) {
      priceMap[secId] = {
        lastPrice: last,
        // Для облигаций MOEX цена LAST уже в % от номинала
        pricePercent: last.toFixed(2),
      };
    }
  });

  // Объединяем данные
  return securities.map((bond) => ({
    ...bond,
    ...(priceMap[bond.ticker] || {
      lastPrice: null,
      pricePercent: null,
    }),
  }));
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
