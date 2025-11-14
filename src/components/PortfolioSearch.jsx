// src/components/PortfolioSearch.jsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addAsset } from "../slices/portfolioSlice";
import DepositForm from "./DepositForm";
import RealEstateForm from "./RealEstateForm";

const formatPercentage = (value) => {
  if (value === undefined || value === null) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const getAssetTypeInRussian = (type) => {
  const types = {
    share: "Акции",
    bond: "Облигации",
    currency: "Валюты",
    crypto: "Криптовалюты",
    metal: "Драгоценные металлы",
  };
  return types[type] || type;
};

const PortfolioSearch = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showRealEstateForm, setShowRealEstateForm] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [hoveredAsset, setHoveredAsset] = useState(null);

  const { shares, bonds, currency, crypto, metals } = useSelector((state) => ({
    shares: state.shares.items,
    bonds: state.bonds.items,
    currency: state.currency.items,
    crypto: state.crypto.items,
    metals: state.metals.items,
  }));

  const allAssets = useMemo(
    () => [
      ...shares.map((item) => ({ ...item, type: "share" })),
      ...bonds.map((item) => ({ ...item, type: "bond" })),
      ...currency.map((item) => ({ ...item, type: "currency" })),
      ...crypto.map((item) => ({ ...item, type: "crypto" })),
      ...metals.map((item) => ({ ...item, type: "metal" })),
    ],
    [shares, bonds, currency, crypto, metals]
  );

  const formatPrice = useCallback((asset) => {
    if (!asset) return "не торгуется";
    const price =
      asset.type === "bond"
        ? asset.pricePercent
        : ["share", "crypto", "metal"].includes(asset.type)
          ? asset.price
          : asset.type === "currency"
            ? asset.value
            : null;

    if (price === null || price === "—") return "не торгуется";

    return asset.type === "bond"
      ? `${price}%`
      : `${price} ₽${asset.type === "metal" ? "/г" : ""}`;
  }, []);

  // Ключевые слова для форм
  const depositKeywords = useMemo(
    () => [
      "вклад",
      "депозит",
      "банковский счет",
      "накопительный счет",
      "сберегательный счет",
      "сбережения",
      "накопления",
      "банк",
      "процент",
      "ставка",
      "deposit",
      "savings",
      "bank account",
      "investment account",
      "fixed deposit",
      "term deposit",
      "savings account",
    ],
    []
  );

  const realEstateKeywords = useMemo(
    () => [
      "квартира",
      "земля",
      "апартаменты",
      "недвижимость",
      "дом",
      "офис",
      "коммерческая",
      "жилая",
      "участок",
      "здание",
      "строение",
      "имущество",
      "real estate",
      "apartment",
      "house",
      "land",
      "property",
      "realestate",
      "commercial",
      "residential",
      "building",
      "estate",
    ],
    []
  );

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setFilteredAssets([]);
      setIsLoading(false);
      setShowDepositForm(false);
      setShowRealEstateForm(false);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(() => {
      const searchLower = debouncedSearchTerm.toLowerCase();

      // Проверяем ключевые слова для форм
      const isDepositSearch = depositKeywords.some((keyword) =>
        searchLower.includes(keyword.toLowerCase())
      );
      const isRealEstateSearch = realEstateKeywords.some((keyword) =>
        searchLower.includes(keyword.toLowerCase())
      );

      setShowDepositForm(isDepositSearch);
      setShowRealEstateForm(isRealEstateSearch);

      // Поиск обычных активов
      const results = allAssets
        .filter((asset) => {
          const matches = [
            asset.name?.toLowerCase().includes(searchLower),
            asset.ticker?.toLowerCase().includes(searchLower),
            asset.code?.toLowerCase().includes(searchLower),
            asset.id?.toLowerCase().includes(searchLower),
          ];
          return matches.some(Boolean);
        })
        .slice(0, 50)
        .map((asset) => ({
          ...asset,
          displayPrice: formatPrice(asset),
          typeRussian: getAssetTypeInRussian(asset.type),
        }));

      const newQuantities = { ...quantities };
      results.forEach((asset) => {
        const key = `${asset.type}-${asset.ticker || asset.code || asset.id}`;
        if (!newQuantities[key]) newQuantities[key] = 1;
      });
      setQuantities(newQuantities);

      setFilteredAssets(results);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timeout);
  }, [
    debouncedSearchTerm,
    allAssets,
    formatPrice,
    depositKeywords,
    realEstateKeywords,
  ]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setIsLoading(true);
  }, []);

  const handleQuantityChange = useCallback((key, value) => {
    setQuantities((prev) => ({
      ...prev,
      [key]: Math.max(1, Number(value) || 1),
    }));
  }, []);

  const handleAddAsset = useCallback(
    (asset) => {
      const key = `${asset.type}-${asset.ticker || asset.code || asset.id}`;
      const quantity = quantities[key] || 1;

      dispatch(
        addAsset({
          ...asset,
          quantity,
          yearChangeValue: asset.yearChangeValue || 0,
          yearChangePercent: asset.yearChangePercent || 0,
        })
      );
    },
    [quantities, dispatch]
  );

  const handleCloseForms = useCallback(() => {
    setShowDepositForm(false);
    setShowRealEstateForm(false);
    setSearchTerm("");
  }, []);

  return (
    <div>
      <h2>Поиск активов</h2>
      <div>
        <input
          type="text"
          placeholder="Поиск по названию или тикеру..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
      </div>

      {searchTerm && (
        <div>
          {/* Показываем формы при поиске соответствующих ключевых слов */}
          {showDepositForm && (
            <div
              style={{
                marginBottom: "20px",
                padding: "15px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <h3 style={{ margin: 0 }}>Добавить депозит</h3>
                <button
                  onClick={handleCloseForms}
                  style={{ padding: "4px 8px" }}
                >
                  ✕
                </button>
              </div>
              <DepositForm onClose={handleCloseForms} />
            </div>
          )}

          {showRealEstateForm && (
            <div
              style={{
                marginBottom: "20px",
                padding: "15px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <h3 style={{ margin: 0 }}>Добавить недвижимость</h3>
                <button
                  onClick={handleCloseForms}
                  style={{ padding: "4px 8px" }}
                >
                  ✕
                </button>
              </div>
              <RealEstateForm onClose={handleCloseForms} />
            </div>
          )}

          {isLoading ? (
            <p>Загрузка...</p>
          ) : filteredAssets.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {filteredAssets.map((asset, index) => {
                const assetKey = `${asset.type}-${asset.ticker || asset.code || asset.id}-${index}`;
                const quantityKey = `${asset.type}-${asset.ticker || asset.code || asset.id}`;
                const quantity = quantities[quantityKey] || 1;

                return (
                  <li
                    key={assetKey}
                    onMouseEnter={() => setHoveredAsset(assetKey)}
                    onMouseLeave={() => setHoveredAsset(null)}
                    style={{
                      padding: "10px",
                      border: "1px solid #e0e0e0",
                      marginBottom: "5px",
                      borderRadius: "4px",
                      backgroundColor:
                        hoveredAsset === assetKey ? "#f5f5f5" : "white",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "bold" }}>
                        {asset.name} ({asset.ticker || asset.code || asset.id})
                      </div>
                      <div style={{ fontSize: "14px", color: "#666" }}>
                        {asset.typeRussian}
                      </div>
                      <div style={{ fontSize: "14px" }}>
                        {asset.displayPrice}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: asset.yearChangePercent >= 0 ? "green" : "red",
                        }}
                      >
                        за день {formatPercentage(asset.yearChangePercent)}
                      </div>
                    </div>

                    {asset.displayPrice !== "не торгуется" &&
                      hoveredAsset === assetKey && (
                        <div
                          style={{
                            marginTop: "10px",
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                          }}
                        >
                          <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) =>
                              handleQuantityChange(quantityKey, e.target.value)
                            }
                            style={{ width: "80px", padding: "4px" }}
                          />
                          <button
                            onClick={() => handleAddAsset(asset)}
                            style={{
                              padding: "4px 12px",
                              backgroundColor: "#3b82f6",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                            }}
                          >
                            Добавить
                          </button>
                        </div>
                      )}
                  </li>
                );
              })}
            </ul>
          ) : !showDepositForm && !showRealEstateForm ? (
            <p>Активы не найдены</p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default React.memo(PortfolioSearch);
