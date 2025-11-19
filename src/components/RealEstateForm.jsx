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

  const handleAddRealEstate = () => {
    if (!name || !price) return;

    const parsedPrice = parseFloat(price);
    const parsedYield = parseFloat(yieldPercent || 0);

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
          type="number"
          placeholder="Стоимость (₽) *"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Доходность (%)"
          value={yieldPercent}
          onChange={(e) => setYieldPercent(e.target.value)}
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
