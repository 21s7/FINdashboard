//src/components/pdf/PortfolioPDFExporter.jsx

import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useSelector } from "react-redux";

const PortfolioPDFExporter = ({ portfolioName, onExportComplete }) => {
  const portfolioRef = useRef();
  const assets = useSelector((state) => state.portfolio.assets);

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
      if (asset.type === "deposit") {
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

  // Рассчитываем общую доходность
  const calculateTotalReturn = () => {
    const totalValue = calculateTotalValue();
    const totalProfit = assets.reduce((sum, asset) => {
      if (asset.yearChangePercent && asset.yearChangePercent !== 0) {
        const assetValue =
          asset.type === "deposit"
            ? asset.value || 0
            : asset.type === "bond"
              ? (asset.pricePercent / 100) * asset.quantity * 1000
              : (asset.price || asset.value || 0) * asset.quantity;

        const profit = (assetValue * asset.yearChangePercent) / 100;
        return sum + profit;
      }
      return sum;
    }, 0);

    return totalValue > 0 ? (totalProfit / totalValue) * 100 : 0;
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

  // Генерация PDF
  const generatePDF = async () => {
    if (!assets || assets.length === 0) {
      alert("Портфель пуст. Невозможно сгенерировать PDF.");
      return;
    }

    try {
      // Создаем временный контейнер для рендеринга PDF
      const pdfContainer = document.createElement("div");
      pdfContainer.style.position = "absolute";
      pdfContainer.style.left = "-9999px";
      pdfContainer.style.top = "-9999px";
      pdfContainer.style.width = "210mm"; // A4 width
      pdfContainer.style.backgroundColor = "#ffffff";
      pdfContainer.style.color = "#000000";
      pdfContainer.style.fontFamily = "Arial, sans-serif";
      pdfContainer.style.padding = "20mm";
      pdfContainer.style.boxSizing = "border-box";
      pdfContainer.style.lineHeight = "1.5";

      // Создаем содержимое PDF
      pdfContainer.innerHTML = `
        <div style="font-family: 'Arial', sans-serif; color: #000000;">
          <!-- Заголовок -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 24px; color: #1a1a1a; margin-bottom: 10px;">
              📊 Отчет по инвестиционному портфелю
            </h1>
            <h2 style="font-size: 18px; color: #3b82f6; margin-bottom: 15px;">
              ${portfolioName || "Мой Портфель"}
            </h2>
            <div style="font-size: 14px; color: #666666;">
              Сгенерировано: ${new Date().toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          <!-- Статистика портфеля -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                     color: white; 
                     padding: 20px; 
                     border-radius: 12px; 
                     margin-bottom: 30px;
                     display: flex;
                     justify-content: space-between;
                     align-items: center;">
            <div>
              <div style="font-size: 16px; opacity: 0.9;">Общая стоимость</div>
              <div style="font-size: 28px; font-weight: bold;">${formatCurrency(calculateTotalValue())}</div>
            </div>
            <div>
              <div style="font-size: 16px; opacity: 0.9;">Общая доходность</div>
              <div style="font-size: 28px; font-weight: bold; color: ${calculateTotalReturn() >= 0 ? "#10b981" : "#ef4444"}">
                ${formatPercentage(calculateTotalReturn())}
              </div>
            </div>
            <div>
              <div style="font-size: 16px; opacity: 0.9;">Количество активов</div>
              <div style="font-size: 28px; font-weight: bold;">${assets.length}</div>
            </div>
          </div>

          <!-- Диаграмма распределения (упрощенная) -->
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; color: #1a1a1a; margin-bottom: 15px; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">
              📈 Распределение активов
            </h3>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;">
              ${Object.entries(groupAssetsByType())
                .map(([type, typeAssets]) => {
                  const typeValue = typeAssets.reduce((sum, asset) => {
                    if (asset.type === "deposit")
                      return sum + (asset.value || 0);
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
                  const percentage = (typeValue / calculateTotalValue()) * 100;

                  return `
                  <div style="flex: 1; min-width: 120px; background: #f8fafc; padding: 12px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <div style="font-size: 14px; color: #64748b; margin-bottom: 5px;">${getTypeName(type)}</div>
                    <div style="font-size: 16px; font-weight: bold; color: #1a1a1a;">${formatCurrency(typeValue)}</div>
                    <div style="font-size: 14px; color: ${percentage >= 0 ? "#10b981" : "#ef4444"}">
                      ${percentage.toFixed(1)}%
                    </div>
                  </div>
                `;
                })
                .join("")}
            </div>
          </div>

          <!-- Детализация активов -->
          <div>
            <h3 style="font-size: 18px; color: #1a1a1a; margin-bottom: 15px; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">
              📋 Детализация активов
            </h3>
            
            ${Object.entries(groupAssetsByType())
              .map(
                ([type, typeAssets]) => `
              <div style="margin-bottom: 25px;">
                <h4 style="font-size: 16px; color: #334155; background: #f1f5f9; padding: 10px 15px; border-radius: 6px; margin-bottom: 15px;">
                  ${getTypeName(type)} (${typeAssets.length} позиций)
                </h4>
                
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                  <thead>
                    <tr style="background: #e2e8f0; color: #475569;">
                      <th style="padding: 10px; text-align: left; border-bottom: 2px solid #cbd5e1;">Название</th>
                      <th style="padding: 10px; text-align: right; border-bottom: 2px solid #cbd5e1;">Количество</th>
                      <th style="padding: 10px; text-align: right; border-bottom: 2px solid #cbd5e1;">Цена</th>
                      <th style="padding: 10px; text-align: right; border-bottom: 2px solid #cbd5e1;">Стоимость</th>
                      <th style="padding: 10px; text-align: right; border-bottom: 2px solid #cbd5e1;">Доходность</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${typeAssets
                      .map((asset) => {
                        const assetValue =
                          asset.type === "deposit"
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

                        return `
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                          <td style="padding: 12px 10px; color: #1e293b; font-weight: 500;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                              <div style="width: 20px; height: 20px; border-radius: 4px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 12px;">
                                ${
                                  asset.type === "share"
                                    ? "📈"
                                    : asset.type === "bond"
                                      ? "📋"
                                      : asset.type === "crypto"
                                        ? "₿"
                                        : asset.type === "currency"
                                          ? "💵"
                                          : asset.type === "metal"
                                            ? "🥇"
                                            : asset.type === "deposit"
                                              ? "🏦"
                                              : asset.type === "realestate"
                                                ? "🏠"
                                                : asset.type === "business"
                                                  ? "🏢"
                                                  : "📊"
                                }
                              </div>
                              <span>${asset.name || "Без названия"}</span>
                              ${asset.ticker ? `<span style="color: #64748b; font-size: 11px;">(${asset.ticker})</span>` : ""}
                            </div>
                          </td>
                          <td style="padding: 12px 10px; text-align: right; color: #475569;">
                            ${asset.quantity} ${unitType}
                          </td>
                          <td style="padding: 12px 10px; text-align: right; color: #475569; font-family: monospace;">
                            ${displayPrice}
                          </td>
                          <td style="padding: 12px 10px; text-align: right; color: #1e293b; font-weight: 600; font-family: monospace;">
                            ${formatCurrency(assetValue)}
                          </td>
                          <td style="padding: 12px 10px; text-align: right; color: ${asset.yearChangePercent >= 0 ? "#059669" : "#dc2626"}; font-weight: 500;">
                            ${formatPercentage(asset.yearChangePercent)}
                          </td>
                        </tr>
                      `;
                      })
                      .join("")}
                    
                    <!-- Итог по группе -->
                    <tr style="background: #f8fafc; font-weight: bold;">
                      <td style="padding: 12px 10px; color: #334155;" colspan="3">Итого по ${getTypeName(type).toLowerCase()}:</td>
                      <td style="padding: 12px 10px; text-align: right; color: #1e293b; font-family: monospace;">
                        ${formatCurrency(
                          typeAssets.reduce((sum, asset) => {
                            const assetValue =
                              asset.type === "deposit"
                                ? asset.value || 0
                                : asset.type === "bond"
                                  ? (asset.pricePercent / 100) *
                                    asset.quantity *
                                    1000
                                  : (asset.price || asset.value || 0) *
                                    asset.quantity;
                            return sum + assetValue;
                          }, 0)
                        )}
                      </td>
                      <td style="padding: 12px 10px; text-align: right; color: #475569;">
                        —
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            `
              )
              .join("")}
          </div>

          <!-- Примечания -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #64748b; font-size: 12px;">
            <div style="margin-bottom: 10px;">
              <strong>Примечания:</strong>
            </div>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Отчет сгенерирован автоматически на основе данных портфеля</li>
              <li>Цены и курсы обновляются в реальном времени</li>
              <li>Доходность указана в годовом исчислении</li>
              <li>Для депозитов доходность соответствует процентной ставке</li>
            </ul>
          </div>

          <!-- Подвал -->
          <div style="margin-top: 30px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            <div>© ${new Date().getFullYear()} Инвестиционный портфель • Сгенерировано автоматически</div>
            <div style="margin-top: 5px;">Данные предоставлены MOEX, ЦБ РФ, CoinGecko и другими источниками</div>
          </div>
        </div>
      `;

      document.body.appendChild(pdfContainer);

      // Конвертируем HTML в canvas
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc) => {
          clonedDoc.body.style.fontFamily = "Arial, sans-serif";
        },
      });

      // Создаем PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Генерируем имя файла
      const fileName = `Портфель_${portfolioName || "Мой_портфель"}_${new Date().toISOString().split("T")[0]}.pdf`;

      // Сохраняем PDF
      pdf.save(fileName);

      // Удаляем временный контейнер
      document.body.removeChild(pdfContainer);

      if (onExportComplete) {
        onExportComplete();
      }
    } catch (error) {
      console.error("Ошибка при генерации PDF:", error);
      alert("Произошла ошибка при генерации PDF. Попробуйте еще раз.");
    }
  };

  if (!assets || assets.length === 0) {
    return null;
  }

  return (
    <button
      onClick={generatePDF}
      style={{
        padding: "0.625rem 1.25rem",
        background: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        color: "var(--error-color)",
        borderRadius: "var(--border-radius)",
        fontSize: "0.9rem",
        fontWeight: "500",
        cursor: "pointer",
        transition: "var(--transition)",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        e.target.style.background = "rgba(239, 68, 68, 0.15)";
        e.target.style.borderColor = "rgba(239, 68, 68, 0.5)";
        e.target.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.target.style.background = "rgba(239, 68, 68, 0.1)";
        e.target.style.borderColor = "rgba(239, 68, 68, 0.3)";
        e.target.style.transform = "translateY(0)";
      }}
    >
      📄 Экспорт в PDF
    </button>
  );
};

export default PortfolioPDFExporter;
