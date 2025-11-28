import React, { useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addAsset } from "../slices/portfolioSlice";
import { useAssetSearch } from "../hooks/useAssetSearch";
import { useAssetQuantities } from "../hooks/useAssetQuantities";
import { FormSuggestions } from "./search/FormSuggestions";
import { SearchResults } from "./search/SearchResults";

const PortfolioSearch = () => {
  const dispatch = useDispatch();

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
    ],
    []
  );

  const {
    searchTerm,
    filteredAssets,
    isLoading,
    showDepositForm,
    showRealEstateForm,
    showBusinessForm,
    handleSearchChange,
    setSearchTerm,
  } = useAssetSearch(
    allAssets,
    depositKeywords,
    realEstateKeywords,
    businessKeywords
  );

  const { quantities, handleQuantityChange, initializeQuantity } =
    useAssetQuantities();

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

  const handleCloseForm = useCallback(
    (formType) => {
      if (formType === "deposit") {
        setSearchTerm("");
      } else if (formType === "realestate") {
        setSearchTerm("");
      } else if (formType === "business") {
        setSearchTerm("");
      }
    },
    [setSearchTerm]
  );

  // Initialize quantities for filtered assets
  React.useEffect(() => {
    filteredAssets.forEach((asset) => {
      const key = `${asset.type}-${asset.ticker || asset.code || asset.id}`;
      initializeQuantity(key);
    });
  }, [filteredAssets, initializeQuantity]);

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
          <FormSuggestions
            showDepositForm={showDepositForm}
            showRealEstateForm={showRealEstateForm}
            showBusinessForm={showBusinessForm}
            onCloseForm={handleCloseForm}
          />

          <SearchResults
            filteredAssets={filteredAssets}
            isLoading={isLoading}
            quantities={quantities}
            onQuantityChange={handleQuantityChange}
            onAddAsset={handleAddAsset}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(PortfolioSearch);
