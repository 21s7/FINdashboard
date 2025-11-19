import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addAsset } from "../slices/portfolioSlice";

const BusinessForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [price, setPrice] = useState("");
  const [profitMargin, setProfitMargin] = useState("");
  const [monthlyProfit, setMonthlyProfit] = useState("");
  const [businessType, setBusinessType] = useState("Малый бизнес");

  const businessTypes = [
    "Малый бизнес",
    "Средний бизнес",
    "Крупный бизнес",
    "Стартап",
    "Франшиза",
    "Интернет-бизнес",
    "Сфера услуг",
    "Производство",
    "Торговля",
    "Другое",
  ];

  const handleAddBusiness = () => {
    if (!businessName || !price || !monthlyProfit) return;

    const parsedPrice = parseFloat(price);
    const parsedMonthlyProfit = parseFloat(monthlyProfit);
    const parsedProfitMargin = parseFloat(profitMargin || 0);

    // Рассчитываем годовую доходность
    const annualProfit = parsedMonthlyProfit * 12;
    const yearChangePercent =
      parsedPrice > 0 ? (annualProfit / parsedPrice) * 100 : 0;

    dispatch(
      addAsset({
        type: "business",
        name: businessName,
        quantity: 1,
        value: parsedPrice,
        monthlyProfit: parsedMonthlyProfit,
        profitMargin: parsedProfitMargin,
        businessType,
        yearChangePercent: yearChangePercent || 0,
      })
    );

    // Очистка формы
    setBusinessName("");
    setPrice("");
    setProfitMargin("");
    setMonthlyProfit("");
    setBusinessType("Малый бизнес");

    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="addButton">
        🏢 Добавить бизнес
      </button>
    );
  }

  return (
    <div className="business-form">
      <div className="form-row">
        <input
          type="text"
          placeholder="Название бизнеса *"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Цена бизнеса (₽) - Чистая прибыль за год × годы окупаемости *"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Маржинальность (%)"
          value={profitMargin}
          onChange={(e) => setProfitMargin(e.target.value)}
          step="0.1"
          min="0"
          max="100"
        />

        <input
          type="number"
          placeholder="Чистая прибыль в месяц (₽) *"
          value={monthlyProfit}
          onChange={(e) => setMonthlyProfit(e.target.value)}
          required
        />

        <select
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
        >
          {businessTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="form-buttons">
        <button onClick={handleAddBusiness}>Добавить бизнес</button>
        <button onClick={handleCancel}>Отмена</button>
      </div>
    </div>
  );
};

export default BusinessForm;
