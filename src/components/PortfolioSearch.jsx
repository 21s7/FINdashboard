import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addAsset } from "../slices/portfolioSlice";
import styles from "../assets/styles/PortfolioSearch.module.scss";

// Debounce-хук
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const getAssetTypeInRussian = (type) => {
  switch (type) {
    case "share":
      return "Акции";
    case "bond":
      return "Облигации";
    case "currency":
      return "Валюты";
    case "crypto":
      return "Криптовалюты";
    case "metal":
      return "Драгоценные металлы";
    default:
      return type;
  }
};

const PortfolioSearch = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [quantities, setQuantities] = useState();
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
          const nameMatch = asset.name.toLowerCase().includes(searchLower);
          const tickerMatch =
            asset.ticker && asset.ticker.toLowerCase().includes(searchLower);
          const codeMatch =
            asset.code && asset.code.toLowerCase().includes(searchLower);
          const idMatch =
            asset.id && asset.id.toLowerCase().includes(searchLower);

          return nameMatch || tickerMatch || codeMatch || idMatch;
        })
        .slice(0, 50)
        .map((asset) => ({
          ...asset,
          displayPrice: formatPrice(asset),
          typeRussian: getAssetTypeInRussian(asset.type),
        }));

      // Инициализируем количества для новых активов
      const newQuantities = { ...quantities };
      results.forEach((asset) => {
        const key = `${asset.type}-${asset.ticker || asset.code || asset.id}`;
        if (!newQuantities[key]) {
          newQuantities[key] = 1;
        }
      });
      setQuantities(newQuantities);

      setFilteredAssets(results);
      setIsLoading(false);
    }, 0);

    return () => clearTimeout(timeout);
  }, [debouncedSearchTerm, allAssets, formatPrice]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setIsLoading(true);
  }, []);

  const handleQuantityChange = useCallback((key, value) => {
    setQuantities((prev) => ({
      ...prev,
      [key]: Math.max(1, value),
    }));
  }, []);

  const handleAddAsset = useCallback(
    (asset) => {
      const key = `${asset.type}-${asset.ticker || asset.code || asset.id}`;
      const quantity = quantities[key] || 1;

      if (quantity > 0) {
        dispatch(
          addAsset({
            ...asset,
            quantity: Number(quantity),
          })
        );
      }
    },
    [quantities, dispatch]
  );

  return (
    <div className={styles.portfolioSearch}>
      <h2>Поиск активов</h2>

      <div className={styles.searchInput}>
        <input
          type="text"
          placeholder="Поиск по названию или тикеру..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {searchTerm && (
        <div className={styles.searchResults}>
          {isLoading ? (
            <p className={styles.loading}>Загрузка...</p>
          ) : filteredAssets.length > 0 ? (
            <ul>
              {filteredAssets.map((asset) => {
                const key = `${asset.type}-${asset.ticker || asset.code || asset.id}`;
                const quantity = quantities[key] || 1;

                return (
                  <li
                    key={key}
                    className={styles.assetItem}
                    onMouseEnter={() => setHoveredAsset(key)}
                    onMouseLeave={() => setHoveredAsset(null)}
                  >
                    <div className={styles.assetInfo}>
                      <div className={styles.assetName}>
                        {asset.name} ({asset.ticker || asset.code || asset.id})
                      </div>
                      <div className={styles.assetType}>
                        {asset.typeRussian}
                      </div>
                      <div className={styles.assetPrice}>
                        {asset.displayPrice}
                      </div>
                    </div>

                    {asset.displayPrice !== "не торгуется" &&
                      hoveredAsset === key && (
                        <div className={styles.assetControls}>
                          <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) =>
                              handleQuantityChange(key, e.target.value)
                            }
                            className={styles.quantityInput}
                          />
                          <button
                            onClick={() => handleAddAsset(asset)}
                            className={styles.addButton}
                          >
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
