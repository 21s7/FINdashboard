//src/components/layout/Header.jsx

import React from "react";
import logo from "../../assets/img/logo.png";

export const Header = ({
  isDarkTheme,
  toggleTheme,
  savedPortfolioId,
  onSavePortfolio,
  onCopyLink,
  onNewPortfolio,
}) => {
  return (
    <header className="ВерхняяСекция">
      <div className="logo" onClick={toggleTheme} style={{ cursor: "pointer" }}>
        <img src={logo} alt="Logo" className="logo-image" />
        <span
          style={{
            marginLeft: "10px",
            fontSize: "12px",
            color: "var(--dark-text-secondary)",
            transition: "var(--transition)",
          }}
        >
          {isDarkTheme ? "🌙 Тёмная тема" : "☀️ Светлая тема"}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div className="header-buttons">
          {!savedPortfolioId ? (
            <button className="header-button" onClick={onSavePortfolio}>
              💾 Сохранить
            </button>
          ) : (
            <>
              <button className="header-button" onClick={onCopyLink}>
                🔗 Копировать ссылку
              </button>
              <button className="header-button" onClick={onNewPortfolio}>
                📄 Новый портфель
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
