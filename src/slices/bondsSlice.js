// src/slices/bondsSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import defaultIcon from "../assets/img/defoultIcon.png";
import ruBondsIcon from "../assets/img/RuBonds.png";

export const fetchBonds = createAsyncThunk("bonds/fetchBonds", async () => {
  try {
    // Основной запрос для получения данных облигаций
    const securitiesRes = await fetch(
      "https://iss.moex.com/iss/engines/stock/markets/bonds/securities.json?iss.meta=off&securities.columns=SECID,SECNAME,PREVPRICE,PREVWAPRICE,YIELDATPREVWAPRICE,COUPONPERCENT,MATDATE,ISIN"
    );
    const securitiesData = await securitiesRes.json();

    // Индексы из securities
    const secCols = securitiesData.securities.columns;
    const secRows = securitiesData.securities.data;

    const secIdIndex = secCols.indexOf("SECID");
    const nameIndex = secCols.indexOf("SECNAME");
    const prevPriceIndex = secCols.indexOf("PREVPRICE");
    const yieldIndex = secCols.indexOf("YIELDATPREVWAPRICE");
    const couponPercentIndex = secCols.indexOf("COUPONPERCENT");
    const matDateIndex = secCols.indexOf("MATDATE");
    const isinIndex = secCols.indexOf("ISIN");

    return secRows
      .map((row) => {
        const ticker = row[secIdIndex];
        const name = row[nameIndex];
        const prevPrice = row[prevPriceIndex];
        const yieldValue = row[yieldIndex];
        const couponPercent = row[couponPercentIndex];
        const matDate = row[matDateIndex];
        const isin = row[isinIndex];

        // Приоритет 1: Используем YIELDATPREVWAPRICE (доходность по средневзвешенной цене)
        let yearChangePercent = null;

        if (typeof yieldValue === "number" && yieldValue !== 0) {
          yearChangePercent = parseFloat(yieldValue.toFixed(2));
        }
        // Приоритет 2: Используем купонную ставку как приблизительную доходность
        else if (typeof couponPercent === "number" && couponPercent !== 0) {
          yearChangePercent = parseFloat(couponPercent.toFixed(2));
        }
        // Приоритет 3: Если есть дата погашения, рассчитываем примерную доходность до погашения
        else if (matDate && prevPrice) {
          const maturityDate = new Date(matDate);
          const currentDate = new Date();
          const yearsToMaturity =
            (maturityDate - currentDate) / (1000 * 60 * 60 * 24 * 365);

          if (yearsToMaturity > 0 && prevPrice < 100) {
            // Простой расчет доходности до погашения
            const simpleYield =
              ((100 - prevPrice) / prevPrice) * (1 / yearsToMaturity) * 100;
            yearChangePercent = parseFloat(simpleYield.toFixed(2));
          } else if (couponPercent) {
            // Если цена около номинала, используем купонную ставку
            yearChangePercent = parseFloat(couponPercent.toFixed(2));
          }
        }

        // Если все равно нет данных о доходности, используем купонную ставку или 0
        if (yearChangePercent === null) {
          yearChangePercent =
            typeof couponPercent === "number"
              ? parseFloat(couponPercent.toFixed(2))
              : 0;
        }

        // Определяем иконку для облигации
        const isOFZ =
          name?.includes("ОФЗ") ||
          ticker?.includes("OFZ") ||
          name?.toLowerCase().includes("федерал") ||
          (isin && isin.startsWith("RU000A0"));

        const iconUrl = isOFZ ? ruBondsIcon : defaultIcon;

        return {
          ticker,
          name,
          pricePercent: typeof prevPrice === "number" ? prevPrice : 100,
          yearChangePercent: yearChangePercent,
          type: "bond",
          iconUrl: iconUrl,
          isOFZ: isOFZ,
          couponPercent:
            typeof couponPercent === "number" ? couponPercent : null,
          maturityDate: matDate || null,
        };
      })
      .filter((bond) => bond.ticker && bond.name && bond.name !== "")
      .slice(0, 500); // Ограничиваем количество для производительности
  } catch (error) {
    console.error("Error fetching bonds:", error);
    throw error;
  }
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
