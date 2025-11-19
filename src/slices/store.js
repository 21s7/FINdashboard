// src/slices/store.js

import { configureStore } from "@reduxjs/toolkit";
import sharesReducer from "./sharesSlice";
import currencyReducer from "./currencySlice";
import bondsReducer from "./bondsSlice";
import cryptoReducer from "./cryptoSlice";
import metalsReducer from "./metalsSlice";
import portfolioReducer from "./portfolioSlice";

export const store = configureStore({
  reducer: {
    shares: sharesReducer,
    currency: currencyReducer,
    bonds: bondsReducer,
    crypto: cryptoReducer,
    metals: metalsReducer,
    portfolio: portfolioReducer,
  },
});
