// src/components/RealEstateForm.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addAsset } from "../slices/portfolioSlice";
import styles from "../assets/styles/PortfolioSearch.module.scss";

const RealEstateForm = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

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
  };

  return (
    <div className={styles.portfolioSearch}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className={styles.addButton}
          style={{ marginTop: "10px" }}
        >
          🏠 Добавить недвижимость
        </button>
      ) : (
        <div className={styles.depositForm}>
          <h2>Добавить недвижимость</h2>

          <input
            type="text"
            placeholder="Название объекта (например, квартира)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="number"
            placeholder="Стоимость (₽)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <input
            type="number"
            placeholder="Доходность (%)"
            value={yieldPercent}
            onChange={(e) => setYieldPercent(e.target.value)}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.selectInput}
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

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button onClick={handleAddRealEstate}>Добавить</button>
            <button onClick={() => setIsOpen(false)}>Отмена</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealEstateForm;
