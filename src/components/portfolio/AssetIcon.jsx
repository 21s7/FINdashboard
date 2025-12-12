// src/components/portfolio/AssetIcon.jsx
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
  // Используем сохраненную информацию об иконке, если есть
  if (asset.iconInfo) {
    switch (asset.iconInfo) {
      case "bond-ofz":
        return (
          <div className={`asset-icon-default bond-ofz-icon ${className}`}>
            <img
              src={ruBondsIcon}
              alt="OFZ Bond"
              className="default-icon-img"
            />
          </div>
        );

      case "bond-default":
        return (
          <div className={`asset-icon-default ${className}`}>
            <img src={defaultIcon} alt="Bond" className="default-icon-img" />
          </div>
        );

      case "metal-XAU":
        return (
          <div className={`asset-icon-default metal-icon ${className}`}>
            <img src={goldIcon} alt="Gold" className="default-icon-img" />
          </div>
        );

      case "metal-XAG":
        return (
          <div className={`asset-icon-default metal-icon ${className}`}>
            <img src={silverIcon} alt="Silver" className="default-icon-img" />
          </div>
        );

      case "metal-XPT":
        return (
          <div className={`asset-icon-default metal-icon ${className}`}>
            <img
              src={platinumIcon}
              alt="Platinum"
              className="default-icon-img"
            />
          </div>
        );

      case "metal-XPD":
        return (
          <div className={`asset-icon-default metal-icon ${className}`}>
            <img
              src={palladiumIcon}
              alt="Palladium"
              className="default-icon-img"
            />
          </div>
        );

      case "metal-default":
        return (
          <div className={`asset-icon-default metal-icon ${className}`}>
            <img src={defaultIcon} alt="Metal" className="default-icon-img" />
          </div>
        );

      case "deposit":
        return (
          <div className={`asset-icon-default ${className}`}>
            <img
              src={defaultDeposit}
              alt="Deposit"
              className="default-icon-img"
            />
          </div>
        );

      case "realestate":
        return (
          <div className={`asset-icon-default ${className}`}>
            <img
              src={defaultRealEstate}
              alt="Real Estate"
              className="default-icon-img"
            />
          </div>
        );

      case "business":
        return (
          <div className={`asset-icon-default ${className}`}>
            <img
              src={defaultBusiness}
              alt="Business"
              className="default-icon-img"
            />
          </div>
        );

      case "has-icon":
        if (asset.iconUrl && asset.iconUrl !== "—" && asset.iconUrl !== "") {
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
                <img
                  src={defaultIcon}
                  alt="Default"
                  className="default-icon-img"
                />
              </div>
            </div>
          );
        }
        break;
    }
  }

  // Старая логика (для обратной совместимости)
  if (asset.type === "bond") {
    const isOFZ =
      asset.name?.includes("ОФЗ") ||
      asset.ticker?.includes("OFZ") ||
      asset.name?.toLowerCase().includes("федерал") ||
      asset.isOFZ;

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
