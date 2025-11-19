// src/components/DepositForm.jsx

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addAsset } from "../slices/portfolioSlice";

const DepositForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [months, setMonths] = useState("");
  const [depositName, setDepositName] = useState("");

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

  const handleAmountChange = (e) => {
    const formatted = formatNumber(e.target.value);
    setAmount(formatted);
  };

  const handleRateChange = (e) => {
    const value = e.target.value.replace(/[^0-9.,]/g, "");
    setRate(value);
  };

  const handleMonthsChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setMonths(value);
  };

  const handleAddDeposit = () => {
    if (!amount || !rate || !months) return;

    const parsedAmount = parseFormattedNumber(amount);
    const parsedRate = parseFloat(rate.replace(",", ".")) || 0;
    const parsedMonths = parseInt(months, 10);

    // Создаем уникальное название для депозита
    const name =
      depositName ||
      `Депозит ${parsedRate}% на ${parsedMonths} мес. (${new Date().toLocaleDateString()})`;

    dispatch(
      addAsset({
        type: "deposit",
        name: name,
        quantity: 1,
        value: parsedAmount, // ← Храним только начальную сумму
        initialAmount: parsedAmount,
        interest: 0, // ← Показываем 0, будем рассчитывать при отображении
        rate: parsedRate,
        termMonths: parsedMonths,
        yearChangePercent: parsedRate, // ← Годовая доходность = ставка
      })
    );

    // Очистка формы и закрытие
    setAmount("");
    setRate("");
    setMonths("");
    setDepositName("");
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
        🏦 Добавить депозит
      </button>
    );
  }

  return (
    <div className="deposit-form">
      <div className="form-row">
        <input
          type="text"
          placeholder="Название депозита (необязательно)"
          value={depositName}
          onChange={(e) => setDepositName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Сумма (₽) *"
          value={amount}
          onChange={handleAmountChange}
          required
        />

        <input
          type="text"
          placeholder="Процентная ставка (%) *"
          value={rate}
          onChange={handleRateChange}
          required
        />

        <input
          type="text"
          placeholder="Срок (мес.) *"
          value={months}
          onChange={handleMonthsChange}
          required
        />
      </div>

      <div className="form-buttons">
        <button onClick={handleAddDeposit}>Добавить депозит</button>
        <button onClick={handleCancel}>Отмена</button>
      </div>
    </div>
  );
};

export default DepositForm;
