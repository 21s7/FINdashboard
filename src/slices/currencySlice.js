// src/slices/currencySlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import stars from "../assets/img/stars.png";
import robux from "../assets/img/robux.png";

// Маппинг валют на коды стран для флагов
const currencyToCountry = {
  AUD: "au", // Австралия
  AZN: "az", // Азербайджан
  GBP: "gb", // Великобритания
  BYN: "by", // Беларусь
  BGN: "bg", // Болгария
  BRL: "br", // Бразилия
  HUF: "hu", // Венгрия
  VND: "vn", // Вьетнам
  HKD: "hk", // Гонконг
  GEL: "ge", // Грузия
  DKK: "dk", // Дания
  AED: "ae", // ОАЭ
  USD: "us", // США
  EUR: "eu", // Европейский союз
  EGP: "eg", // Египет
  INR: "in", // Индия
  IDR: "id", // Индонезия
  KZT: "kz", // Казахстан
  CAD: "ca", // Канада
  QAR: "qa", // Катар
  KGS: "kg", // Киргизия
  CNY: "cn", // Китай
  MDL: "md", // Молдова
  NZD: "nz", // Новая Зеландия
  NOK: "no", // Норвегия
  PLN: "pl", // Польша
  RON: "ro", // Румыния
  XDR: "un", // МВФ (специальные права заимствования)
  SGD: "sg", // Сингапур
  TJS: "tj", // Таджикистан
  THB: "th", // Таиланд
  TRY: "tr", // Турция
  TMT: "tm", // Туркменистан
  UZS: "uz", // Узбекистан
  UAH: "ua", // Украина
  CZK: "cz", // Чехия
  SEK: "se", // Швеция
  CHF: "ch", // Швейцария
  RSD: "rs", // Сербия
  ZAR: "za", // ЮАР
  KRW: "kr", // Южная Корея
  JPY: "jp", // Япония
  RUB: "ru", // Россия
  // Добавляем цифровые валюты
  STARS: "stars", // телеграмм
  ROBUX: "robux", // роблокс
};

export const fetchCurrency = createAsyncThunk(
  "currency/fetchCurrency",
  async () => {
    const res = await fetch("https://www.cbr-xml-daily.ru/daily_json.js");
    const data = await res.json();

    const currencies = Object.entries(data.Valute).map(([code, val]) => {
      const dayChangePercent =
        val.Previous && val.Previous !== 0
          ? +(((val.Value - val.Previous) / val.Previous) * 100).toFixed(2)
          : 0;

      // Получаем код страны для иконки
      const countryCode = currencyToCountry[code] || "un";
      const iconUrl = `https://flagsapi.com/${countryCode.toUpperCase()}/flat/64.png`;

      return {
        id: code,
        ticker: code,
        code,
        name: val.Name,
        price: val.Value,
        nominal: val.Nominal,
        value: val.Value,
        yearChangePercent: dayChangePercent,
        type: "currency",
        iconUrl: iconUrl,
        countryCode: countryCode,
      };
    });

    // Добавляем российский рубль вручную
    currencies.unshift({
      id: "RUB",
      ticker: "RUB",
      code: "RUB",
      name: "Российский рубль",
      price: 1,
      nominal: 1,
      value: 1,
      yearChangePercent: 0,
      type: "currency",
      iconUrl: "https://flagsapi.com/RU/flat/64.png",
      countryCode: "ru",
    });

    // Добавляем пользовательскую валюту STARS
    currencies.unshift({
      id: "STARS",
      ticker: "STR",
      code: "STARS",
      name: "Stars",
      price: 1.5,
      nominal: 1,
      value: 1.5,
      yearChangePercent: 0,
      type: "currency",
      iconUrl: stars,
      countryCode: "stars",
    });
    currencies.unshift({
      id: "ROBUX",
      ticker: "RBX",
      code: "ROBUX",
      name: "Robux",
      price: 0.5,
      nominal: 1,
      value: 0.5,
      yearChangePercent: 0,
      type: "currency",
      iconUrl: robux,
      countryCode: "stars",
    });

    return currencies;
  }
);

const initialState = {
  items: [],
  status: "idle",
  error: null,
};

const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    clearItems: (state) => {
      state.items = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrency.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCurrency.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCurrency.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { clearItems } = currencySlice.actions;
export default currencySlice.reducer;
