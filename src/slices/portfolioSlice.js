import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  assets: [], // { type: 'crypto' | 'currency' | 'bond' | 'share', id, name, price, quantity }
};

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {
    addAsset: (state, action) => {
      const { id, type, quantity } = action.payload;
      const existing = state.assets.find((a) => a.id === id && a.type === type);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.assets.push(action.payload);
      }
    },
    removeAsset: (state, action) => {
      const { id, type } = action.payload;
      state.assets = state.assets.filter(
        (a) => !(a.id === id && a.type === type)
      );
    },
    clearPortfolio: (state) => {
      state.assets = [];
    },
  },
});

export const { addAsset, removeAsset, clearPortfolio } = portfolioSlice.actions;
export default portfolioSlice.reducer;
