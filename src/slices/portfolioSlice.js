// store/slices/portfolioSlice.js
import { createSlice } from "@reduxjs/toolkit";

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState: {
    assets: [],
  },
  reducers: {
    addAsset: (state, action) => {
      const newAsset = {
        ...action.payload,
        portfolioId: `${action.payload.type}-${action.payload.id}-${Date.now()}`,
      };

      state.assets.push(newAsset);
    },

    removeAsset: (state, action) => {
      const { portfolioId } = action.payload;
      state.assets = state.assets.filter((a) => a.portfolioId !== portfolioId);
    },
  },
});

export const { addAsset, removeAsset } = portfolioSlice.actions;
export default portfolioSlice.reducer;
