// src/components/RealEstateForm.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addAsset } from "../slices/portfolioSlice";

const RealEstateForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(true);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [yieldPercent, setYieldPercent] = useState("");
  const [category, setCategory] = useState("Жилая недвижимость");

  const handleAddRealEstate = () => {
    if (!name || !price) return;

    const parsedPrice = parseFloat(price);
    const parsedYield = parseFloat(yieldPercent || 0);

    dispatch(
      addAsset({
        type: "realestate",
        name,
        category,
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
    setCategory("Жилая недвижимость");
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <div>
      {isOpen ? (
        <div>
          <input
            type="text"
            placeholder="Название объекта (например, квартира)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />

          <input
            type="number"
            placeholder="Стоимость (₽)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />

          <input
            type="number"
            placeholder="Доходность (%)"
            value={yieldPercent}
            onChange={(e) => setYieldPercent(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <option value="Жилая недвижимость">Жилая недвижимость</option>
            <option value="Коммерческая недвижимость">
              Коммерческая недвижимость
            </option>
            <option value="Земельные участки">Земельные участки</option>
            <option value="Специального назначения">
              Специального назначения
            </option>
          </select>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleAddRealEstate}
              style={{
                padding: "8px 16px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                flex: 1,
              }}
            >
              Добавить
            </button>
            <button
              onClick={handleCancel}
              style={{
                padding: "8px 16px",
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                flex: 1,
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🏠 Добавить недвижимость
        </button>
      )}
    </div>
  );
};

export default RealEstateForm;
