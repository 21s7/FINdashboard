// src/components/DepositForm.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addAsset } from "../slices/portfolioSlice";
import styles from "../assets/styles/PortfolioSearch.module.scss";

const DepositForm = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [months, setMonths] = useState("");

  const handleAddDeposit = () => {
    if (!amount || !rate || !months) return;

    const parsedAmount = parseFloat(amount);
    const parsedRate = parseFloat(rate);
    const parsedMonths = parseInt(months, 10);

    const interest = parsedAmount * (parsedRate / 100) * (parsedMonths / 12); // простые проценты

    dispatch(
      addAsset({
        type: "deposit",
        name: `Депозит ${parsedRate}% на ${parsedMonths} мес.`,
        quantity: 1,
        value: parsedAmount + interest,
        initialAmount: parsedAmount,
        interest,
        rate: parsedRate,
        termMonths: parsedMonths,
        yearChangePercent: (interest / parsedAmount) * 100,
      })
    );

    // Очистка формы и закрытие
    setAmount("");
    setRate("");
    setMonths("");
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
          🏦 Добавить депозит
        </button>
      ) : (
        <div className={styles.depositForm}>
          <h2>Добавить депозит</h2>

          <input
            type="number"
            placeholder="Сумма (₽)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <input
            type="number"
            placeholder="Процентная ставка (%)"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />

          <input
            type="number"
            placeholder="Срок (мес.)"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
          />

          <div className={styles.formButtons}>
            <button onClick={handleAddDeposit}>Добавить</button>
            <button onClick={() => setIsOpen(false)}>Отмена</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositForm;
