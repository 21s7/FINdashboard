// src/slices/portfolioSlice.js

import { createSlice } from "@reduxjs/toolkit";
import defaultBusiness from "../assets/img/defoultBuisnes.png";
import defaultDeposit from "../assets/img/defoultDeposit.png";
import defaultRealEstate from "../assets/img/defoultRealEstate.png";

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState: {
    assets: [],
  },
  reducers: {
    addAsset: (state, action) => {
      const newAsset = action.payload;

      let assetKey;

      if (newAsset.type === "deposit") {
        assetKey = `deposit-${newAsset.rate}-${newAsset.termMonths}-${Date.now()}`;
        newAsset.iconUrl = defaultDeposit;
      } else if (newAsset.type === "realestate") {
        assetKey = `realestate-${newAsset.name}-${newAsset.category}-${Date.now()}`;
        newAsset.iconUrl = defaultRealEstate;
      } else if (newAsset.type === "business") {
        assetKey = `business-${newAsset.name}-${newAsset.businessType}-${Date.now()}`;
        newAsset.iconUrl = defaultBusiness;
      } else {
        assetKey = `${newAsset.type}-${newAsset.ticker || newAsset.code || newAsset.id}`;
      }

      const uniqueId = `${assetKey}-${Date.now()}`;

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
        const existingIndex = state.assets.findIndex(
          (a) => `${a.type}-${a.ticker || a.code || a.id}` === assetKey
        );

        if (existingIndex >= 0) {
          state.assets[existingIndex] = {
            ...state.assets[existingIndex],
            ...newAsset,
            quantity:
              state.assets[existingIndex].quantity + (newAsset.quantity || 1),
            portfolioId: state.assets[existingIndex].portfolioId,
            ...(newAsset.iconUrl && { iconUrl: newAsset.iconUrl }),
          };
        } else {
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

    // Загрузка портфеля (очищает текущий и загружает новый)
    loadPortfolio: (state, action) => {
      state.assets = action.payload;
    },

    // Очистка портфеля
    clearPortfolio: (state) => {
      state.assets = [];
    },
  },
});

export const {
  addAsset,
  removeAsset,
  updateAssetStats,
  loadPortfolio,
  clearPortfolio,
} = portfolioSlice.actions;
export default portfolioSlice.reducer;
