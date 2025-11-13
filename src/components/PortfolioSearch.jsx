// src/components/PortfolioSearch.jsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addAsset } from "../slices/portfolioSlice";

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

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setFilteredAssets([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(() => {
      const searchLower = debouncedSearchTerm.toLowerCase();
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
  }, [debouncedSearchTerm, allAssets, formatPrice]);

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

  return (
    <div>
      <h2>Поиск активов</h2>
      <div>
        <input
          type="text"
          placeholder="Поиск по названию или тикеру..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {searchTerm && (
        <div>
          {isLoading ? (
            <p>Загрузка...</p>
          ) : filteredAssets.length > 0 ? (
            <ul>
              {filteredAssets.map((asset, index) => {
                const assetKey = `${asset.type}-${asset.ticker || asset.code || asset.id}-${index}`;
                const quantityKey = `${asset.type}-${asset.ticker || asset.code || asset.id}`;
                const quantity = quantities[quantityKey] || 1;

                return (
                  <li
                    key={assetKey}
                    onMouseEnter={() => setHoveredAsset(assetKey)}
                    onMouseLeave={() => setHoveredAsset(null)}
                  >
                    <div>
                      <div>
                        {asset.name} ({asset.ticker || asset.code || asset.id})
                      </div>
                      <div>{asset.typeRussian}</div>
                      <div>{asset.displayPrice}</div>
                      <div>
                        за день {formatPercentage(asset.yearChangePercent)}
                      </div>
                    </div>

                    {asset.displayPrice !== "не торгуется" &&
                      hoveredAsset === assetKey && (
                        <div>
                          <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) =>
                              handleQuantityChange(quantityKey, e.target.value)
                            }
                          />
                          <button onClick={() => handleAddAsset(asset)}>
                            Добавить
                          </button>
                        </div>
                      )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>Активы не найдены</p>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(PortfolioSearch);
