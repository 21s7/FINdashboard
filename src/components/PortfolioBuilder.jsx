import { useDispatch, useSelector } from "react-redux";
import { addAsset } from "../slices/portfolioSlice";
import { useState, useEffect } from "react";

import { fetchCrypto } from "../slices/cryptoSlice";
import { fetchCurrency } from "../slices/currencySlice";
import { fetchBonds } from "../slices/bondsSlice";
import { fetchShares } from "../slices/sharesSlice";
import { fetchMetals } from "../slices/metalsSlice";

const PortfolioBuilder = () => {
  const dispatch = useDispatch();

  const crypto = useSelector((s) => s.crypto.items);
  const currency = useSelector((s) => s.currency.items);
  const bonds = useSelector((s) => s.bonds.items);
  const shares = useSelector((s) => s.shares.items);
  const metals = useSelector((s) => s.metals.items);

  const cryptoStatus = useSelector((s) => s.crypto.status);
  const currencyStatus = useSelector((s) => s.currency.status);
  const bondsStatus = useSelector((s) => s.bonds.status);
  const sharesStatus = useSelector((s) => s.shares.status);
  const metalsStatus = useSelector((s) => s.metals.status);

  const [selectedType, setSelectedType] = useState("crypto");
  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    console.log("💡 useEffect called with selectedType:", selectedType);
    switch (selectedType) {
      case "crypto":
        if (cryptoStatus === "idle") dispatch(fetchCrypto());
        break;
      case "currency":
        if (currencyStatus === "idle") dispatch(fetchCurrency());
        break;
      case "bonds":
        if (bondsStatus === "idle") dispatch(fetchBonds());
        break;
      case "shares":
        if (sharesStatus === "idle") dispatch(fetchShares());
        break;
      case "metals":
        if (metalsStatus === "idle") dispatch(fetchMetals());
        break;
      default:
        break;
    }
  }, [
    selectedType,
    cryptoStatus,
    currencyStatus,
    bondsStatus,
    sharesStatus,
    metalsStatus,
    dispatch,
  ]);

  const dataMap = {
    crypto,
    currency,
    bonds,
    shares,
    metals,
  };

  const assetList = dataMap[selectedType] || [];

  const options =
    assetList.length > 0 ? (
      assetList.map((item) => {
        const id = item.id || item.code || item.ticker;
        const label = `${id}: ${item.name || item.title || item.code || id}`;
        return (
          <option key={id} value={id}>
            {label}
          </option>
        );
      })
    ) : (
      <option disabled>Данные не загружены</option>
    );

  const isOptionsDisabled = assetList.length === 0;

  const handleAdd = () => {
    const list = dataMap[selectedType];
    if (!list) return;

    const asset = list.find((item) => {
      const id = item.id || item.code || item.ticker;
      return id === selectedId;
    });
    if (!asset) return;

    const name = asset.name || asset.title || asset.code || selectedId;
    const rawPrice = asset.price || asset.value || asset.price_per_unit || 0;
    const price =
      typeof rawPrice === "string" ? parseFloat(rawPrice) || 0 : rawPrice;

    dispatch(
      addAsset({
        type: selectedType,
        id: selectedId,
        name,
        price,
        quantity: Number(quantity),
      })
    );

    setSelectedId("");
    setQuantity(1);
  };

  console.log("🔍 metals:", metals);
  console.log("🔍 metalsStatus:", metalsStatus);
  console.log("🔍 selectedType:", selectedType);
  console.log("🔍 assetList:", assetList);

  return (
    <div>
      <h2>🧩 Конструктор портфеля</h2>
      <label>
        Тип актива:
        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setSelectedId("");
          }}
        >
          <option value="crypto">Криптовалюта</option>
          <option value="currency">Валюта</option>
          <option value="bonds">Облигации</option>
          <option value="shares">Акции</option>
          <option value="metals">Драгоценные металлы</option>
        </select>
      </label>

      <label>
        Актив:
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          disabled={isOptionsDisabled}
        >
          <option value="">--Выберите--</option>
          {options}
        </select>
      </label>

      <label>
        Количество:
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </label>

      <button onClick={handleAdd} disabled={!selectedId || quantity < 1}>
        Добавить в портфель
      </button>
    </div>
  );
};

export default PortfolioBuilder;
