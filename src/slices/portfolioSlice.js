// store/slices/portfolioSlice.js
import { createSlice } from "@reduxjs/toolkit";

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState: {
    assets: [],
  },
  reducers: {
    addAsset: (state, action) => {
      const newAsset = action.payload;

      // Создаём уникальный ключ (лучше чем просто id или ticker)
      const key = `${newAsset.type}-${newAsset.ticker || newAsset.code || newAsset.id}`;

      // Пытаемся найти актив с таким же ключом
      const existingAsset = state.assets.find(
        (a) => `${a.type}-${a.ticker || a.code || a.id}` === key
      );

      if (existingAsset) {
        // Обновляем количество
        existingAsset.quantity += newAsset.quantity;

        // Можно обновлять цену и другие поля при необходимости
        if (newAsset.price !== undefined) existingAsset.price = newAsset.price;
        if (newAsset.pricePercent !== undefined)
          existingAsset.pricePercent = newAsset.pricePercent;
        if (newAsset.yearChangeValue !== undefined)
          existingAsset.yearChangeValue = newAsset.yearChangeValue;
        if (newAsset.yearChangePercent !== undefined)
          existingAsset.yearChangePercent = newAsset.yearChangePercent;
      } else {
        // Если такого актива ещё нет — добавляем как новый
        state.assets.push({
          ...newAsset,
          portfolioId: `${key}-${Date.now()}`, // создаём уникальный id
        });
      }
    },

    removeAsset: (state, action) => {
      const { portfolioId } = action.payload;
      state.assets = state.assets.filter((a) => a.portfolioId !== portfolioId);
    },
  },
});

export const { addAsset, removeAsset } = portfolioSlice.actions;
export default portfolioSlice.reducer;
