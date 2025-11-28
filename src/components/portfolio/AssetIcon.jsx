//src/components/portfolio/AssetIcon.jsx
import React from "react";
import defaultIcon from "../../assets/img/defoultIcon.png";
import defaultBusiness from "../../assets/img/defoultBuisnes.png";
import defaultDeposit from "../../assets/img/defoultDeposit.png";
import defaultRealEstate from "../../assets/img/defoultRealEstate.png";
import goldIcon from "../../assets/img/gold.png";
import silverIcon from "../../assets/img/silver.png";
import platinumIcon from "../../assets/img/platinum.png";
import palladiumIcon from "../../assets/img/palladium.png";
import ruBondsIcon from "../../assets/img/RuBonds.png";

const AssetIcon = ({ asset, className = "" }) => {
  // Для облигаций ОФЗ используем специальную иконку
  if (asset.type === "bond") {
    const isOFZ =
      asset.name?.includes("ОФЗ") ||
      asset.ticker?.includes("OFZ") ||
      asset.name?.toLowerCase().includes("федерал");

    if (isOFZ) {
      return (
        <div className={`asset-icon-default bond-ofz-icon ${className}`}>
          <img src={ruBondsIcon} alt="OFZ Bond" className="default-icon-img" />
        </div>
      );
    }

    return (
      <div className={`asset-icon-default ${className}`}>
        <img src={defaultIcon} alt="Bond" className="default-icon-img" />
      </div>
    );
  }

  // Для металлов используем специальные иконки
  if (asset.type === "metal") {
    const metalIcons = {
      XAU: goldIcon,
      XAG: silverIcon,
      XPT: platinumIcon,
      XPD: palladiumIcon,
    };

    const metalIcon = metalIcons[asset.ticker];
    if (metalIcon) {
      return (
        <div className={`asset-icon-default metal-icon ${className}`}>
          <img src={metalIcon} alt={asset.name} className="default-icon-img" />
        </div>
      );
    }
  }

  // Для депозитов, недвижимости и бизнеса используем специальные иконки
  const customIcons = {
    deposit: defaultDeposit,
    realestate: defaultRealEstate,
    business: defaultBusiness,
  };

  if (customIcons[asset.type]) {
    return (
      <div className={`asset-icon-default ${className}`}>
        <img
          src={customIcons[asset.type]}
          alt={asset.type}
          className="default-icon-img"
        />
      </div>
    );
  }

  // Для остальных активов проверяем наличие иконки
  const showDefaultIcon =
    !asset.iconUrl || asset.iconUrl === "—" || asset.iconUrl === "";

  if (showDefaultIcon) {
    return (
      <div className={`asset-icon-default ${className}`}>
        <img src={defaultIcon} alt="Default" className="default-icon-img" />
      </div>
    );
  }

  const handleImageError = (e) => {
    e.target.style.display = "none";
    const parent = e.target.parentElement;
    const defaultIconDiv = parent.querySelector(".asset-icon-default");
    if (defaultIconDiv) {
      defaultIconDiv.style.display = "flex";
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <img
        src={asset.iconUrl}
        alt={asset.name}
        className={`asset-icon ${className}`}
        onError={handleImageError}
      />
      <div
        className={`asset-icon-default ${className}`}
        style={{ display: "none" }}
      >
        <img src={defaultIcon} alt="Default" className="default-icon-img" />
      </div>
    </div>
  );
};

export default AssetIcon;
