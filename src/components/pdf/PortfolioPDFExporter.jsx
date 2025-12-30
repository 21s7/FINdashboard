//src/components/pdf/PortfolioPDFExporter.jsx

import React, { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useSelector } from "react-redux";
import Modal from "../Modal";
import logo from "../../assets/img/logo.png";

const PortfolioPDFExporter = ({ portfolioName, onExportComplete }) => {
  const assets = useSelector((state) => state.portfolio.assets);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Функция для форматирования валюты
  const formatCurrency = (num, suffix = "₽") => {
    if (typeof num !== "number" || isNaN(num)) return "—";
    return `${num.toLocaleString("ru-RU", { minimumFractionDigits: 2 })} ${suffix}`;
  };

  // Функция для форматирования процентов
  const formatPercentage = (value) => {
    if (value === undefined || value === null) return "—";
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  // Рассчитываем общую стоимость
  const calculateTotalValue = () => {
    return assets.reduce((sum, asset) => {
      if (
        asset.type === "deposit" ||
        asset.type === "realestate" ||
        asset.type === "business"
      ) {
        return sum + (asset.value || 0);
      }

      const unitPrice =
        asset.type === "bond"
          ? asset.pricePercent
          : asset.price || asset.value || 0;
      const total =
        asset.type === "bond"
          ? (unitPrice / 100) * asset.quantity * 1000
          : unitPrice * asset.quantity;
      return sum + total;
    }, 0);
  };

  // Группируем активы по типам
  const groupAssetsByType = () => {
    const groups = {};

    assets.forEach((asset) => {
      if (!groups[asset.type]) {
        groups[asset.type] = [];
      }
      groups[asset.type].push(asset);
    });

    return groups;
  };

  // Функция для получения названия типа
  const getTypeName = (type) => {
    const typeNames = {
      share: "Акции",
      bond: "Облигации",
      currency: "Валюты",
      crypto: "Криптовалюты",
      metal: "Драгоценные металлы",
      deposit: "Депозиты",
      realestate: "Недвижимость",
      business: "Бизнес",
    };
    return typeNames[type] || type;
  };

  // Функция для получения иконки актива
  const getAssetIcon = (asset) => {
    // Используем сохраненную иконку из портфеля
    if (asset.iconUrl && asset.iconUrl !== "—" && asset.iconUrl !== "") {
      return asset.iconUrl;
    }

    // Для типов с дефолтными иконками
    const defaultIcons = {
      bond: "📋",
      deposit: "🏦",
      realestate: "🏠",
      business: "🏢",
      share: "📈",
      crypto: "₿",
      currency: "💵",
      metal: "🥇",
    };

    return defaultIcons[asset.type] || "📊";
  };

  // Проверяем, является ли строка URL изображением
  const isImageUrl = (url) => {
    if (!url) return false;
    // Проверяем, является ли строка валидным URL
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("data:")
    ) {
      return true;
    }
    // Проверяем расширения файлов
    return /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(url);
  };

  // Создаем HTML для PDF с правильным рендерингом
  const createPDFHTML = () => {
    const totalValue = calculateTotalValue();
    const groups = groupAssetsByType();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            color: #000000;
            margin: 0;
            padding: 15mm;
            font-size: 12px;
            line-height: 1.5;
            background: #ffffff;
          }
          
          .header {
            display: flex;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #3b82f6;
          }
          
          .logo-container {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            margin-right: 15px;
          }
          
          .logo {
            max-width: 100%;
            max-height: 100%;
          }
          
          .title-container {
            flex: 1;
          }
          
          .main-title {
            font-size: 20px;
            color: #1a1a1a;
            margin: 0 0 5px 0;
            font-weight: 700;
          }
          
          .subtitle {
            font-size: 16px;
            color: #3b82f6;
            margin: 0 0 8px 0;
            font-weight: 600;
          }
          
          .date {
            font-size: 11px;
            color: #666666;
          }
          
          .total-value-container {
            text-align: right;
          }
          
          .total-label {
            font-size: 11px;
            color: #666666;
            margin-bottom: 5px;
          }
          
          .total-amount {
            font-size: 18px;
            font-weight: bold;
            color: #1a1a1a;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 25px;
          }
          
          .stat-card {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          
          .stat-label {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 5px;
          }
          
          .stat-value {
            font-size: 18px;
            font-weight: bold;
            color: #1a1a1a;
          }
          
          .distribution-section {
            margin-bottom: 30px;
          }
          
          .section-title {
            font-size: 16px;
            color: #1a1a1a;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
            font-weight: 600;
          }
          
          .distribution-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 10px;
          }
          
          .type-card {
            flex: 1;
            min-width: 150px;
            background: #3b82f610;
            padding: 12px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          
          .type-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }
          
          .type-name {
            font-size: 13px;
            color: #64748b;
            font-weight: 500;
          }
          
          .type-percentage {
            font-size: 12px;
            color: #3b82f6;
            font-weight: 600;
          }
          
          .type-value {
            font-size: 15px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 5px;
          }
          
          .type-count {
            font-size: 11px;
            color: #94a3b8;
          }
          
          .assets-section {
            margin-bottom: 30px;
          }
          
          .group-container {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          
          .group-header {
            background: #3b82f610;
            padding: 10px 15px;
            border-radius: 6px 6px 0 0;
            border: 1px solid #3b82f630;
            border-bottom: none;
            margin-bottom: 0;
          }
          
          .group-title-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .group-title {
            font-size: 14px;
            color: #334155;
            margin: 0;
            font-weight: 600;
          }
          
          .group-summary {
            font-size: 12px;
            color: #64748b;
          }
          
          .asset-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            border: 1px solid #3b82f630;
            border-top: none;
          }
          
          .table-header {
            background: #3b82f605;
          }
          
          .table-header th {
            padding: 10px 8px;
            text-align: left;
            color: #475569;
            font-weight: 600;
            border-bottom: 1px solid #3b82f630;
          }
          
          .asset-row {
            border-bottom: 1px solid #e2e8f0;
            background: white;
          }
          
          .asset-row:last-child {
            border-bottom: none;
          }
          
          .asset-cell {
            padding: 10px 8px;
            vertical-align: middle;
          }
          
          .asset-info {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .asset-icon {
            width: 24px;
            height: 24px;
            border-radius: 4px;
            overflow: hidden;
            background: #f1f5f9;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          
          .icon-img {
            width: 16px;
            height: 16px;
            object-fit: contain;
          }
          
          .icon-text {
            font-size: 12px;
          }
          
          .asset-details {
            min-width: 0;
          }
          
          .asset-name {
            font-weight: 500;
            font-size: 11.5px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .asset-ticker {
            font-size: 10px;
            color: #64748b;
            margin-top: 1px;
          }
          
          .text-right {
            text-align: right;
          }
          
          .monospace {
            font-family: 'Courier New', 'Courier', monospace;
          }
          
          .positive {
            color: #059669;
          }
          
          .negative {
            color: #dc2626;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            color: #64748b;
            font-size: 10px;
            text-align: center;
          }
          
          .footer-brand {
            margin-bottom: 5px;
            font-weight: 600;
            color: #475569;
          }
          
          .footer-note {
            opacity: 0.7;
          }
        </style>
      </head>
      <body>
        <!-- Логотип и заголовок -->
        <div class="header">
          <div class="logo-container">
            <img src="${logo}" alt="Logo" class="logo" />
          </div>
          <div class="title-container">
            <h1 class="main-title"> Инвестиционный портфель</h1>
            <h2 class="subtitle">${portfolioName || "Мой Портфель"}</h2>
            <div class="date">
              Сгенерировано: ${new Date().toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          <div class="total-value-container">
            <div class="total-label">Общая стоимость</div>
            <div class="total-amount">${formatCurrency(totalValue)}</div>
          </div>
        </div>

        <!-- Статистика портфеля -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Количество активов</div>
            <div class="stat-value">${assets.length}</div>
          </div>
          <div class="stat-card" style="border-left-color: #10b981;">
            <div class="stat-label">Распределение</div>
            <div class="stat-value">${Object.keys(groups).length} категорий</div>
          </div>
          <div class="stat-card" style="border-left-color: #8b5cf6;">
            <div class="stat-label">Позиций всего</div>
            <div class="stat-value">${assets.reduce((sum, asset) => sum + (asset.quantity || 1), 0)}</div>
          </div>
        </div>

        <!-- Диаграмма распределения -->
        <div class="distribution-section">
          <h3 class="section-title"> Распределение активов</h3>
          <div class="distribution-grid">
            ${Object.entries(groups)
              .map(([type, typeAssets]) => {
                const typeValue = typeAssets.reduce((sum, asset) => {
                  if (
                    asset.type === "deposit" ||
                    asset.type === "realestate" ||
                    asset.type === "business"
                  ) {
                    return sum + (asset.value || 0);
                  }
                  const unitPrice =
                    asset.type === "bond"
                      ? asset.pricePercent
                      : asset.price || asset.value || 0;
                  const total =
                    asset.type === "bond"
                      ? (unitPrice / 100) * asset.quantity * 1000
                      : unitPrice * asset.quantity;
                  return sum + total;
                }, 0);
                const percentage =
                  totalValue > 0 ? (typeValue / totalValue) * 100 : 0;
                const typeColors = {
                  share: "#3b82f6",
                  bond: "#8b5cf6",
                  currency: "#10b981",
                  crypto: "#f59e0b",
                  metal: "#f97316",
                  deposit: "#06b6d4",
                  realestate: "#ec4899",
                  business: "#8b5cf6",
                };
                const color = typeColors[type] || "#3b82f6";

                return `
                <div class="type-card" style="background: ${color}10; border-left-color: ${color}">
                  <div class="type-header">
                    <div class="type-name">${getTypeName(type)}</div>
                    <div class="type-percentage" style="color: ${color}">
                      ${percentage.toFixed(1)}%
                    </div>
                  </div>
                  <div class="type-value">${formatCurrency(typeValue)}</div>
                  <div class="type-count">${typeAssets.length} позиций</div>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>

        <!-- Детализация активов -->
        <div class="assets-section">
          <h3 class="section-title"> Детализация активов</h3>
          
          ${Object.entries(groups)
            .map(([type, typeAssets]) => {
              const typeColors = {
                share: "#3b82f6",
                bond: "#8b5cf6",
                currency: "#10b981",
                crypto: "#f59e0b",
                metal: "#f97316",
                deposit: "#06b6d4",
                realestate: "#ec4899",
                business: "#8b5cf6",
              };
              const color = typeColors[type] || "#3b82f6";
              const groupValue = typeAssets.reduce((sum, asset) => {
                if (
                  asset.type === "deposit" ||
                  asset.type === "realestate" ||
                  asset.type === "business"
                ) {
                  return sum + (asset.value || 0);
                }
                const unitPrice =
                  asset.type === "bond"
                    ? asset.pricePercent
                    : asset.price || asset.value || 0;
                const total =
                  asset.type === "bond"
                    ? (unitPrice / 100) * asset.quantity * 1000
                    : unitPrice * asset.quantity;
                return sum + total;
              }, 0);

              return `
              <div class="group-container">
                <div class="group-header" style="background: ${color}10; border-color: ${color}30">
                  <div class="group-title-row">
                    <h4 class="group-title">${getTypeName(type)}</h4>
                    <div class="group-summary">
                      ${typeAssets.length} позиций • ${formatCurrency(groupValue)}
                    </div>
                  </div>
                </div>
                
                <table class="asset-table" style="border-color: ${color}30">
                  <thead class="table-header" style="background: ${color}05">
                    <tr>
                      <th style="width: 35%">Актив</th>
                      <th style="width: 15%; text-align: right">Кол-во</th>
                      <th style="width: 15%; text-align: right">Цена</th>
                      <th style="width: 20%; text-align: right">Стоимость</th>
                      <th style="width: 15%; text-align: right">Доходность</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${typeAssets
                      .map((asset) => {
                        const assetValue =
                          asset.type === "deposit" ||
                          asset.type === "realestate" ||
                          asset.type === "business"
                            ? asset.value || 0
                            : asset.type === "bond"
                              ? (asset.pricePercent / 100) *
                                asset.quantity *
                                1000
                              : (asset.price || asset.value || 0) *
                                asset.quantity;

                        const displayPrice =
                          asset.type === "bond"
                            ? `${asset.pricePercent?.toFixed(2)}%`
                            : formatCurrency(asset.price || asset.value);

                        const unitType =
                          asset.type === "metal"
                            ? "г"
                            : asset.type === "currency"
                              ? "ед."
                              : "шт";

                        const assetIcon = getAssetIcon(asset);
                        const isIconImage = isImageUrl(assetIcon);

                        return `
                        <tr class="asset-row">
                          <td class="asset-cell">
                            <div class="asset-info">
                              <div class="asset-icon">
                                ${
                                  isIconImage
                                    ? `<img src="${assetIcon}" alt="" class="icon-img" />`
                                    : `<span class="icon-text">${assetIcon}</span>`
                                }
                              </div>
                              <div class="asset-details">
                                <div class="asset-name">
                                  ${asset.name || "Без названия"}
                                </div>
                                ${
                                  asset.ticker || asset.code
                                    ? `
                                  <div class="asset-ticker">
                                    ${asset.ticker || asset.code}
                                  </div>
                                `
                                    : ""
                                }
                              </div>
                            </div>
                          </td>
                          <td class="asset-cell text-right monospace">
                            ${asset.quantity} ${unitType}
                          </td>
                          <td class="asset-cell text-right monospace">
                            ${displayPrice}
                          </td>
                          <td class="asset-cell text-right monospace">
                            ${formatCurrency(assetValue)}
                          </td>
                          <td class="asset-cell text-right ${asset.yearChangePercent >= 0 ? "positive" : "negative"}">
                            ${formatPercentage(asset.yearChangePercent)}
                          </td>
                        </tr>
                      `;
                      })
                      .join("")}
                  </tbody>
                </table>
              </div>
            `;
            })
            .join("")}
        </div>

        <!-- Подвал -->
        <div class="footer">
          <div class="footer-brand">sarigma inc</div>
          <div class="footer-note">
            Отчет сгенерирован автоматически • Данные предоставлены из открытых источников
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Генерация PDF
  const generatePDF = async () => {
    if (!assets || assets.length === 0) {
      setErrorMessage("Портфель пуст. Невозможно сгенерировать PDF.");
      setShowErrorModal(true);
      return;
    }

    setIsGenerating(true);

    try {
      // Создаем временное окно для рендеринга
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error(
          "Не удалось открыть окно для печати. Пожалуйста, разрешите всплывающие окна."
        );
      }

      // Вставляем HTML в окно
      printWindow.document.write(createPDFHTML());
      printWindow.document.close();

      // Ждем загрузки контента
      await new Promise((resolve) => {
        printWindow.onload = resolve;
        setTimeout(resolve, 1000); // Fallback таймаут
      });

      // Используем html2canvas для рендеринга
      const canvas = await html2canvas(printWindow.document.body, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: printWindow.document.body.scrollWidth,
        windowHeight: printWindow.document.body.scrollHeight,
      });

      // Закрываем временное окно
      printWindow.close();

      // Создаем PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Добавляем первую страницу
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Добавляем дополнительные страницы если нужно
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Генерируем имя файла
      const fileName = `Портфель_${portfolioName || "Мой_портфель"}_${new Date().toISOString().split("T")[0]}.pdf`;

      // Сохраняем PDF
      pdf.save(fileName);

      if (onExportComplete) {
        onExportComplete();
      }
    } catch (error) {
      console.error("Ошибка при генерации PDF:", error);
      setErrorMessage(`Произошла ошибка при генерации PDF: ${error.message}`);
      setShowErrorModal(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={generatePDF}
        disabled={isGenerating}
        style={{
          padding: "0.625rem 1.25rem",
          background: isGenerating
            ? "rgba(156, 163, 175, 0.1)"
            : "rgba(239, 68, 68, 0.1)",
          border: isGenerating
            ? "1px solid rgba(156, 163, 175, 0.3)"
            : "1px solid rgba(239, 68, 68, 0.3)",
          color: isGenerating
            ? "var(--dark-text-tertiary)"
            : "var(--error-color)",
          borderRadius: "var(--border-radius)",
          fontSize: "0.9rem",
          fontWeight: "500",
          cursor: isGenerating ? "not-allowed" : "pointer",
          transition: "var(--transition)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          whiteSpace: "nowrap",
          opacity: isGenerating ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isGenerating) {
            e.target.style.background = "rgba(239, 68, 68, 0.15)";
            e.target.style.borderColor = "rgba(239, 68, 68, 0.5)";
            e.target.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isGenerating) {
            e.target.style.background = "rgba(239, 68, 68, 0.1)";
            e.target.style.borderColor = "rgba(239, 68, 68, 0.3)";
            e.target.style.transform = "translateY(0)";
          }
        }}
      >
        {isGenerating ? (
          <>
            <span
              style={{
                width: "12px",
                height: "12px",
                border: "2px solid rgba(239, 68, 68, 0.3)",
                borderTopColor: "var(--error-color)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                display: "inline-block",
              }}
            />
            Генерация...
          </>
        ) : (
          <>📄 Экспорт в PDF</>
        )}
      </button>

      {/* Модальное окно с ошибкой */}
      <Modal
        isOpen={showErrorModal}
        type="error"
        title="Ошибка генерации PDF"
        message={errorMessage}
        confirmText="Закрыть"
        showCancel={false}
        onConfirm={() => setShowErrorModal(false)}
        autoCloseDelay={0}
        icon="❌"
      />
    </>
  );
};

export default PortfolioPDFExporter;
