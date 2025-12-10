// src/components/Modal.jsx

import React, { useEffect } from "react";

const Modal = ({
  isOpen,
  title,
  message,
  type = "confirm", // 'confirm', 'alert', 'success', 'error', 'warning'
  confirmText = "ОК",
  cancelText = "Отмена",
  showCancel = true,
  onConfirm,
  onCancel,
  autoCloseDelay = 0,
  icon = null,
}) => {
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        if (onConfirm) onConfirm();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onConfirm]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onCancel) {
      onCancel();
    }
  };

  const getIcon = () => {
    if (icon) return icon;

    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return null;
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case "success":
        return "var(--secondary-color)";
      case "error":
        return "var(--error-color)";
      case "warning":
        return "var(--warning-color)";
      default:
        return "var(--dark-text-primary)";
    }
  };

  const modalIcon = getIcon();

  return (
    <div className="confirm-modal-overlay" onClick={handleOverlayClick}>
      <div className="confirm-modal">
        <div className="confirm-modal-content">
          {modalIcon && (
            <div
              style={{
                textAlign: "center",
                fontSize: "2.5rem",
                marginBottom: "1rem",
                lineHeight: 1,
              }}
            >
              {modalIcon}
            </div>
          )}

          {title && (
            <h3
              className="confirm-modal-title"
              style={{
                color: getTitleColor(),
                textAlign: "center",
                marginTop: modalIcon ? "0" : "0",
              }}
            >
              {title}
            </h3>
          )}

          <p className="confirm-modal-message" style={{ textAlign: "center" }}>
            {message}
          </p>

          <div className="confirm-modal-buttons">
            {showCancel && (
              <button
                className="confirm-modal-button cancel-button"
                onClick={onCancel}
              >
                {cancelText}
              </button>
            )}

            <button
              className={`confirm-modal-button ${type === "confirm" || type === "error" ? "confirm-button" : ""}`}
              onClick={onConfirm}
              style={{
                background:
                  type === "success"
                    ? "rgba(16, 185, 129, 0.1)"
                    : type === "warning"
                      ? "rgba(245, 158, 11, 0.1)"
                      : type === "error"
                        ? "rgba(239, 68, 68, 0.1)"
                        : "rgba(59, 130, 246, 0.1)",
                borderColor:
                  type === "success"
                    ? "rgba(16, 185, 129, 0.3)"
                    : type === "warning"
                      ? "rgba(245, 158, 11, 0.3)"
                      : type === "error"
                        ? "rgba(239, 68, 68, 0.3)"
                        : "rgba(59, 130, 246, 0.3)",
                color:
                  type === "success"
                    ? "var(--secondary-color)"
                    : type === "warning"
                      ? "var(--warning-color)"
                      : type === "error"
                        ? "var(--error-color)"
                        : "var(--primary-color)",
              }}
              onMouseEnter={(e) => {
                e.target.style.background =
                  type === "success"
                    ? "rgba(16, 185, 129, 0.15)"
                    : type === "warning"
                      ? "rgba(245, 158, 11, 0.15)"
                      : type === "error"
                        ? "rgba(239, 68, 68, 0.15)"
                        : "rgba(59, 130, 246, 0.15)";
                e.target.style.borderColor =
                  type === "success"
                    ? "rgba(16, 185, 129, 0.5)"
                    : type === "warning"
                      ? "rgba(245, 158, 11, 0.5)"
                      : type === "error"
                        ? "rgba(239, 68, 68, 0.5)"
                        : "rgba(59, 130, 246, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background =
                  type === "success"
                    ? "rgba(16, 185, 129, 0.1)"
                    : type === "warning"
                      ? "rgba(245, 158, 11, 0.1)"
                      : type === "error"
                        ? "rgba(239, 68, 68, 0.1)"
                        : "rgba(59, 130, 246, 0.1)";
                e.target.style.borderColor =
                  type === "success"
                    ? "rgba(16, 185, 129, 0.3)"
                    : type === "warning"
                      ? "rgba(245, 158, 11, 0.3)"
                      : type === "error"
                        ? "rgba(239, 68, 68, 0.3)"
                        : "rgba(59, 130, 246, 0.3)";
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
