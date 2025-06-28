import { createSlice } from "@reduxjs/toolkit";

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState: {
    assets: [],
  },
  reducers: {
    addAsset: (state, action) => {
      const newAsset = action.payload;
      const assetKey = `${newAsset.type}-${newAsset.ticker || newAsset.code || newAsset.id}`;

      // Добавляем timestamp для уникальности
      const uniqueId = `${assetKey}-${Date.now()}`;

      const existingIndex = state.assets.findIndex(
        (a) => `${a.type}-${a.ticker || a.code || a.id}` === assetKey
      );

      if (existingIndex >= 0) {
        // Обновляем существующий актив
        state.assets[existingIndex] = {
          ...state.assets[existingIndex],
          ...newAsset,
          quantity:
            state.assets[existingIndex].quantity + (newAsset.quantity || 1),
          portfolioId: state.assets[existingIndex].portfolioId, // Сохраняем старый ID
        };
      } else {
        // Добавляем новый актив
        state.assets.push({
          ...newAsset,
          portfolioId: uniqueId,
          yearChangeValue: newAsset.yearChangeValue || 0,
          yearChangePercent: newAsset.yearChangePercent || 0,
        });
      }
    },

    removeAsset: (state, action) => {
      state.assets = state.assets.filter(
        (a) => a.portfolioId !== action.payload.portfolioId
      );
    },

    updateAssetStats: (state, action) => {
      const { portfolioId, yearChangeValue, yearChangePercent } =
        action.payload;
      const asset = state.assets.find((a) => a.portfolioId === portfolioId);
      if (asset) {
        asset.yearChangeValue = yearChangeValue;
        asset.yearChangePercent = yearChangePercent;
      }
    },
  },
});

export const { addAsset, removeAsset, updateAssetStats } =
  portfolioSlice.actions;
export default portfolioSlice.reducer;
