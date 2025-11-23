// src/slices/portfolioSlice.js

import { createSlice } from "@reduxjs/toolkit";

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState: {
    assets: [],
  },
  reducers: {
    addAsset: (state, action) => {
      const newAsset = action.payload;

      // Для депозитов, недвижимости и бизнеса создаем уникальный ключ на основе всех данных
      // чтобы они не объединялись
      let assetKey;

      if (newAsset.type === "deposit") {
        // Для депозитов используем комбинацию типа, ставки и срока
        assetKey = `deposit-${newAsset.rate}-${newAsset.termMonths}-${Date.now()}`;
      } else if (newAsset.type === "realestate") {
        // Для недвижимости используем комбинацию типа, названия и категории
        assetKey = `realestate-${newAsset.name}-${newAsset.category}-${Date.now()}`;
      } else if (newAsset.type === "business") {
        // Для бизнеса используем комбинацию типа, названия и типа бизнеса
        assetKey = `business-${newAsset.name}-${newAsset.businessType}-${Date.now()}`;
      } else {
        // Для остальных активов используем старую логику
        assetKey = `${newAsset.type}-${newAsset.ticker || newAsset.code || newAsset.id}`;
      }

      // Добавляем timestamp для уникальности
      const uniqueId = `${assetKey}-${Date.now()}`;

      // Для депозитов, недвижимости и бизнеса всегда добавляем как новый актив
      if (
        newAsset.type === "deposit" ||
        newAsset.type === "realestate" ||
        newAsset.type === "business"
      ) {
        state.assets.push({
          ...newAsset,
          portfolioId: uniqueId,
          yearChangeValue: newAsset.yearChangeValue || 0,
          yearChangePercent: newAsset.yearChangePercent || 0,
        });
      } else {
        // Для остальных активов сохраняем старую логику объединения
        const existingIndex = state.assets.findIndex(
          (a) => `${a.type}-${a.ticker || a.code || a.id}` === assetKey
        );

        if (existingIndex >= 0) {
          // Обновляем существующий актив, сохраняем iconUrl если есть
          state.assets[existingIndex] = {
            ...state.assets[existingIndex],
            ...newAsset,
            quantity:
              state.assets[existingIndex].quantity + (newAsset.quantity || 1),
            portfolioId: state.assets[existingIndex].portfolioId, // Сохраняем старый ID
            // Сохраняем iconUrl если он пришел в новом ассете
            ...(newAsset.iconUrl && { iconUrl: newAsset.iconUrl }),
          };
        } else {
          // Добавляем новый актив с iconUrl
          state.assets.push({
            ...newAsset,
            portfolioId: uniqueId,
            yearChangeValue: newAsset.yearChangeValue || 0,
            yearChangePercent: newAsset.yearChangePercent || 0,
          });
        }
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
