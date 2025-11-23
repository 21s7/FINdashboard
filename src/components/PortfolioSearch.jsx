// src/components/PortfolioSearch.jsx

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addAsset } from "../slices/portfolioSlice";
import DepositForm from "./DepositForm";
import RealEstateForm from "./RealEstateForm";
import BusinessForm from "./BusinessForm";

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
    business: "Бизнес",
  };
  return types[type] || type;
};

const PortfolioSearch = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showRealEstateForm, setShowRealEstateForm] = useState(false);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
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
      "счет",
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
      "дача",
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

  const businessKeywords = useMemo(
    () => [
      "бизнес",
      "компания",
      "предприятие",
      "стартап",
      "фирма",
      "предпринимательство",
      "бизнес проект",
      "собственный бизнес",
      "малый бизнес",
      "средний бизнес",
      "крупный бизнес",
      "франшиза",
      "интернет бизнес",
      "онлайн бизнес",
      "производство",
      "услуги",
      "розничная торговля",
      "оптовая торговля",
      "кафе",
      "ресторан",
      "магазин",
      "салон",
      "студия",
      "агенство",
      "компания",
      "business",
      "company",
      "startup",
      "enterprise",
      "firm",
      "entrepreneurship",
      "venture",
      "corporation",
      "LLC",
      "inc",
    ],
    []
  );

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setFilteredAssets([]);
      setIsLoading(false);
      setShowDepositForm(false);
      setShowRealEstateForm(false);
      setShowBusinessForm(false);
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
      const isBusinessSearch = businessKeywords.some((keyword) =>
        searchLower.includes(keyword.toLowerCase())
      );

      setShowDepositForm(isDepositSearch);
      setShowRealEstateForm(isRealEstateSearch);
      setShowBusinessForm(isBusinessSearch);

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
    businessKeywords,
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

  // Функция для закрытия только формы (без очистки поиска)
  const handleCloseForm = useCallback((formType) => {
    if (formType === "deposit") {
      setShowDepositForm(false);
    } else if (formType === "realestate") {
      setShowRealEstateForm(false);
    } else if (formType === "business") {
      setShowBusinessForm(false);
    }
  }, []);

  return (
    <div className="portfolioSearch card-shadow">
      <h2>Поиск активов</h2>
      <div className="searchInput">
        <input
          type="text"
          placeholder="Поиск по названию или тикеру..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {searchTerm && (
        <div className="fade-in">
          {/* Показываем формы при поиске соответствующих ключевых слов */}
          {showDepositForm && (
            <div className="deposit-form-container">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h3 style={{ margin: 0 }}>Добавить депозит</h3>
                <button
                  onClick={() => handleCloseForm("deposit")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--dark-text-secondary)",
                    fontSize: "1.25rem",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
              <DepositForm onClose={() => handleCloseForm("deposit")} />
            </div>
          )}

          {showRealEstateForm && (
            <div className="realestate-form-container">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h3 style={{ margin: 0 }}>Добавить недвижимость</h3>
                <button
                  onClick={() => handleCloseForm("realestate")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--dark-text-secondary)",
                    fontSize: "1.25rem",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
              <RealEstateForm onClose={() => handleCloseForm("realestate")} />
            </div>
          )}

          {showBusinessForm && (
            <div className="business-form-container">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h3 style={{ margin: 0 }}>Добавить бизнес</h3>
                <button
                  onClick={() => handleCloseForm("business")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--dark-text-secondary)",
                    fontSize: "1.25rem",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
              <BusinessForm onClose={() => handleCloseForm("business")} />
            </div>
          )}

          {isLoading ? (
            <div className="loading">Загрузка...</div>
          ) : filteredAssets.length > 0 ? (
            <div className="searchResults">
              {filteredAssets.map((asset, index) => {
                const assetKey = `${asset.type}-${asset.ticker || asset.code || asset.id}-${index}`;
                const quantityKey = `${asset.type}-${asset.ticker || asset.code || asset.id}`;
                const quantity = quantities[quantityKey] || 1;

                return (
                  <div
                    key={assetKey}
                    className="assetItem smooth-appear"
                    onMouseEnter={() => setHoveredAsset(assetKey)}
                    onMouseLeave={() => setHoveredAsset(null)}
                  >
                    <div className="assetInfo">
                      {/* Добавляем иконку для акций */}
                      <div className="assetHeader">
                        {asset.type === "share" && asset.iconUrl && (
                          <img
                            src={asset.iconUrl}
                            alt={asset.name}
                            className="assetIcon"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        <div className="assetName truncate">
                          {asset.name} ({asset.ticker || asset.code || asset.id}
                          )
                        </div>
                      </div>
                      <div className="assetType">{asset.typeRussian}</div>
                      <div className="assetPrice">{asset.displayPrice}</div>
                      <div
                        className={`assetChange ${asset.yearChangePercent >= 0 ? "positive" : "negative"}`}
                      >
                        за день {formatPercentage(asset.yearChangePercent)}
                      </div>
                    </div>

                    {asset.displayPrice !== "не торгуется" &&
                      hoveredAsset === assetKey && (
                        <div className="assetControls">
                          <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) =>
                              handleQuantityChange(quantityKey, e.target.value)
                            }
                            className="quantityInput"
                          />
                          <button
                            onClick={() => handleAddAsset(asset)}
                            className="addButton"
                          >
                            Добавить
                          </button>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          ) : !showDepositForm && !showRealEstateForm && !showBusinessForm ? (
            <p>Активы не найдены</p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default React.memo(PortfolioSearch);
