// src/components/RealEstateForm.jsx

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addAsset } from "../slices/portfolioSlice";

const RealEstateForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [yieldPercent, setYieldPercent] = useState("");
  const [category, setCategory] = useState("Жилая недвижимость");
  const [address, setAddress] = useState("");

  // Функция для форматирования числа с разделителями тысяч
  const formatNumber = (value) => {
    const cleanValue = value.replace(/[.,]/g, "");
    if (!cleanValue) return "";
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Функция для преобразования отформатированной строки в число
  const parseFormattedNumber = (formattedValue) => {
    return parseFloat(formattedValue.replace(/\./g, "")) || 0;
  };

  const handlePriceChange = (e) => {
    const formatted = formatNumber(e.target.value);
    setPrice(formatted);
  };

  const handleYieldPercentChange = (e) => {
    const value = e.target.value.replace(/[^0-9.,]/g, "");
    setYieldPercent(value);
  };

  const handleAddRealEstate = () => {
    if (!name || !price) return;

    const parsedPrice = parseFormattedNumber(price);
    const parsedYield = parseFloat(yieldPercent.replace(",", ".")) || 0;

    // Создаем уникальное название для недвижимости
    const assetName =
      name || `${category} (${new Date().toLocaleDateString()})`;

    dispatch(
      addAsset({
        type: "realestate",
        name: assetName,
        category,
        address: address || "Не указан",
        quantity: 1,
        value: parsedPrice,
        yieldPercent: parsedYield,
        yearChangePercent: parsedYield,
      })
    );

    // очистка формы
    setName("");
    setPrice("");
    setYieldPercent("");
    setAddress("");
    setCategory("Жилая недвижимость");
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
        🏠 Добавить недвижимость
      </button>
    );
  }

  return (
    <div className="realestate-form">
      <div className="form-row">
        <input
          type="text"
          placeholder="Название объекта *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Стоимость (₽) *"
          value={price}
          onChange={handlePriceChange}
          required
        />

        <input
          type="text"
          placeholder="Доходность (%)"
          value={yieldPercent}
          onChange={handleYieldPercentChange}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Жилая недвижимость">Жилая недвижимость</option>
          <option value="Коммерческая недвижимость">
            Коммерческая недвижимость
          </option>
          <option value="Земельные участки">Земельные участки</option>
          <option value="Специального назначения">
            Специального назначения
          </option>
        </select>
      </div>

      <div className="form-buttons">
        <button onClick={handleAddRealEstate}>Добавить недвижимость</button>
        <button onClick={handleCancel}>Отмена</button>
      </div>
    </div>
  );
};

export default RealEstateForm;
