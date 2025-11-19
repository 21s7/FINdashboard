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

  const handleAddDeposit = () => {
    if (!amount || !rate || !months) return;

    const parsedAmount = parseFloat(amount);
    const parsedRate = parseFloat(rate);
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
          type="number"
          placeholder="Сумма (₽) *"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Процентная ставка (%) *"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Срок (мес.) *"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
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
