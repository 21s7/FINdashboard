import React, { useEffect, useState } from "react";
import logo from "../assets/img/logo.png";

const LoadingScreen = ({ isLoading }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!isVisible) return null;

  return (
    <div className={`loading-screen ${!isLoading ? "fade-out" : ""}`}>
      <div className="loading-content">
        <img src={logo} alt="Logo" className="loading-logo" />
        <div className="loading-text">Загрузка портфеля...</div>
      </div>
    </div>
  );
};

export default LoadingScreen;
