// src/components/PortfolioStats.jsx
import { useSelector } from "react-redux";

const PortfolioStats = () => {
  const assets = useSelector((state) => state.portfolio.assets);

  const totalValue = assets.reduce((sum, a) => sum + a.price * a.quantity, 0);

  return (
    <div>
      <h2>📈 Портфель</h2>
      <ul>
        {assets.map(({ id, name, quantity, price, type }) => (
          <li key={`${type}-${id}`}>
            [{type}] {name} ({id}): {quantity} × {price.toLocaleString("ru-RU")}{" "}
            ₽ = {(price * quantity).toLocaleString("ru-RU")} ₽
          </li>
        ))}
      </ul>
      <p>
        <strong>Общая ценность:</strong> {totalValue.toLocaleString("ru-RU")} ₽
      </p>
    </div>
  );
};

export default PortfolioStats;
