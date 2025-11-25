// src/slices/metalsSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import defaultIcon from "../assets/img/defoultIcon.png";
import goldIcon from "../assets/img/gold.png";
import silverIcon from "../assets/img/silver.png";
import platinumIcon from "../assets/img/platinum.png";
import palladiumIcon from "../assets/img/palladium.png";

const API_KEY = "72b3bbda75cf31c863c87e57b1b76393";
const BASE_CURRENCY = "RUB";
const METALS = ["XAU", "XAG", "XPT", "XPD"];
const OUNCE_IN_GRAMS = 31.1035;

const METAL_NAMES = {
  XAU: "Золото",
  XAG: "Серебро",
  XPT: "Платина",
  XPD: "Палладий",
};

// Маппинг металлов на иконки
const METAL_ICONS = {
  XAU: goldIcon,
  XAG: silverIcon,
  XPT: platinumIcon,
  XPD: palladiumIcon,
};

// Получаем предыдущий рабочий день (учитывая выходные)
const getPreviousWorkingDay = () => {
  const d = new Date();
  const day = d.getDay(); // 0 - вс, 1 - пн, ..., 6 - сб

  if (day === 0)
    d.setDate(d.getDate() - 2); // воскресенье → пятница
  else if (day === 1)
    d.setDate(d.getDate() - 3); // понедельник → пятница
  else d.setDate(d.getDate() - 1); // будний день → вчера

  return d.toISOString().split("T")[0];
};

export const fetchMetals = createAsyncThunk("metals/fetchMetals", async () => {
  const todayUrl = `https://api.metalpriceapi.com/v1/latest?api_key=${API_KEY}&base=${BASE_CURRENCY}&currencies=${METALS.join(",")}`;
  const yesterdayUrl = `https://api.metalpriceapi.com/v1/${getPreviousWorkingDay()}?api_key=${API_KEY}&base=${BASE_CURRENCY}&currencies=${METALS.join(",")}`;

  const [todayRes, yesterdayRes] = await Promise.all([
    fetch(todayUrl),
    fetch(yesterdayUrl),
  ]);

  if (!todayRes.ok || !yesterdayRes.ok) {
    throw new Error("Ошибка загрузки данных с metalpriceapi.com");
  }

  const todayData = await todayRes.json();
  const yesterdayData = await yesterdayRes.json();

  if (!todayData.success || !yesterdayData.success) {
    throw new Error("Ошибка в ответе от metalpriceapi.com");
  }

  const result = METALS.map((symbol) => {
    const todayRate = todayData.rates[symbol];
    const yesterdayRate = yesterdayData.rates[symbol];

    if (!todayRate || !yesterdayRate) {
      console.warn(`Нет данных для ${symbol}`);
      return null;
    }

    const todayRubPerGram = 1 / todayRate / OUNCE_IN_GRAMS;
    const yesterdayRubPerGram = 1 / yesterdayRate / OUNCE_IN_GRAMS;

    const changePercent = yesterdayRubPerGram
      ? ((todayRubPerGram - yesterdayRubPerGram) / yesterdayRubPerGram) * 100
      : 0;

    return {
      id: symbol,
      ticker: symbol,
      name: METAL_NAMES[symbol],
      price: Number(todayRubPerGram.toFixed(2)),
      yearChangePercent: Number(changePercent.toFixed(2)),
      priceUsd: null,
      lastUpdate: new Date(todayData.timestamp * 1000).toISOString(),
      type: "metal",
      // Используем специальные иконки для металлов
      iconUrl: METAL_ICONS[symbol] || defaultIcon,
    };
  });

  return result.filter(Boolean);
});

const metalsSlice = createSlice({
  name: "metals",
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

export const { clearItems } = metalsSlice.actions;
export default metalsSlice.reducer;
