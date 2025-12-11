//src/hooks/usePortfolioOperations.js

import { useCallback } from "react";
import { clearPortfolio } from "../slices/portfolioSlice";

export const usePortfolioOperations = ({
  dispatch,
  savedPortfolioId,
  setSavedPortfolioId,
  setHasUnsavedChanges,
  setOriginalAssetsHash,
  clearPortfolioId,
  showModal,
  createAssetsHash,
}) => {
  // Функция сохранения нового портфеля
  const handleSavePortfolio = useCallback(
    async (portfolioAssets, savePortfolio) => {
      if (portfolioAssets.length === 0) {
        showModal({
          type: "warning",
          title: "Портфель пуст",
          message: "Добавьте активы перед сохранением.",
          showCancel: false,
          icon: "📂",
        });
        return;
      }

      const result = await savePortfolio(portfolioAssets);

      if (result.success) {
        setSavedPortfolioId(result.portfolioId);
        setHasUnsavedChanges(false);
        setOriginalAssetsHash(createAssetsHash(portfolioAssets));

        try {
          await navigator.clipboard.writeText(result.shareUrl);
          showModal({
            type: "success",
            title: "Портфель сохранен!",
            message: "Ссылка на портфель скопирована в буфер обмена.",
            showCancel: false,
            icon: "✅",
            autoCloseDelay: 3000,
          });
        } catch {
          showModal({
            type: "info",
            title: "Портфель сохранен!",
            message: `Ссылка на портфель: ${result.shareUrl}`,
            showCancel: false,
            icon: "📋",
          });
        }
      } else {
        showModal({
          type: "error",
          title: "Ошибка сохранения",
          message: result.error || "Не удалось сохранить портфель.",
          showCancel: false,
          icon: "❌",
        });
      }
    },
    [
      setSavedPortfolioId,
      setHasUnsavedChanges,
      setOriginalAssetsHash,
      showModal,
      createAssetsHash,
    ]
  );

  // Функция сохранения изменений в существующем портфеле
  const handleSaveChanges = useCallback(
    async (portfolioAssets, updatePortfolio, savedPortfolioId) => {
      if (portfolioAssets.length === 0) {
        showModal({
          type: "warning",
          title: "Портфель пуст",
          message: "Нет активов для сохранения.",
          showCancel: false,
          icon: "📂",
        });
        return;
      }

      if (!savedPortfolioId) {
        return handleSavePortfolio(portfolioAssets, updatePortfolio);
      }

      const result = await updatePortfolio(portfolioAssets, savedPortfolioId);

      if (result.success) {
        setHasUnsavedChanges(false);
        setOriginalAssetsHash(createAssetsHash(portfolioAssets));

        try {
          await navigator.clipboard.writeText(result.shareUrl);
          showModal({
            type: "success",
            title: "Изменения сохранены!",
            message: "Новая ссылка на портфель скопирована в буфер обмена.",
            showCancel: false,
            icon: "✅",
            autoCloseDelay: 3000,
          });
        } catch {
          showModal({
            type: "info",
            title: "Изменения сохранены!",
            message: `Новая ссылка на портфель: ${result.shareUrl}`,
            showCancel: false,
            icon: "📋",
          });
        }
      } else {
        showModal({
          type: "error",
          title: "Ошибка сохранения",
          message: result.error || "Не удалось сохранить изменения.",
          showCancel: false,
          icon: "❌",
        });
      }
    },
    [
      handleSavePortfolio,
      setHasUnsavedChanges,
      setOriginalAssetsHash,
      showModal,
      createAssetsHash,
    ]
  );

  // Функция для открытия диалога создания нового портфеля
  const openNewPortfolioDialog = useCallback(
    (hasUnsavedChanges, savedPortfolioId) => {
      if (hasUnsavedChanges && savedPortfolioId) {
        showModal({
          type: "confirm",
          title: "Несохраненные изменения",
          message:
            "У вас есть несохраненные изменения. Создать новый портфель без сохранения?",
          icon: "⚠️",
          onConfirm: () => {
            dispatch(clearPortfolio());
            clearPortfolioId();
            setSavedPortfolioId(null);
            setHasUnsavedChanges(false);
            setOriginalAssetsHash("");

            if (window.history.replaceState) {
              const newUrl = window.location.origin + window.location.pathname;
              window.history.replaceState({}, "", newUrl);
            }

            window.dispatchEvent(new Event("popstate"));

            showModal({
              type: "success",
              title: "Новый портфель создан",
              message: "Теперь вы можете добавить новые активы.",
              showCancel: false,
              icon: "✨",
              autoCloseDelay: 2000,
            });
          },
        });
      } else {
        showModal({
          type: "confirm",
          title: "Создать новый портфель?",
          message:
            "Текущие данные будут очищены. Вы уверены, что хотите создать новый портфель?",
          icon: "📄",
          onConfirm: () => {
            dispatch(clearPortfolio());
            clearPortfolioId();
            setSavedPortfolioId(null);
            setHasUnsavedChanges(false);
            setOriginalAssetsHash("");

            if (window.history.replaceState) {
              const newUrl = window.location.origin + window.location.pathname;
              window.history.replaceState({}, "", newUrl);
            }

            window.dispatchEvent(new Event("popstate"));

            showModal({
              type: "success",
              title: "Новый портфель создан",
              message: "Теперь вы можете добавить новые активы.",
              showCancel: false,
              icon: "✨",
              autoCloseDelay: 2000,
            });
          },
        });
      }
    },
    [
      dispatch,
      clearPortfolioId,
      setSavedPortfolioId,
      setHasUnsavedChanges,
      setOriginalAssetsHash,
      showModal,
    ]
  );

  // Функция копирования ссылки
  const handleCopyLink = useCallback(
    (portfolioAssets, createShareableLink) => {
      const shareLink = createShareableLink(portfolioAssets);
      if (shareLink) {
        navigator.clipboard
          .writeText(shareLink)
          .then(() => {
            showModal({
              type: "success",
              title: "Ссылка скопирована",
              message: "Ссылка на портфель скопирована в буфер обмена.",
              showCancel: false,
              icon: "🔗",
              autoCloseDelay: 2000,
            });
          })
          .catch(() => {
            showModal({
              type: "info",
              title: "Ссылка на портфель",
              message: `Скопируйте ссылку: ${shareLink}`,
              showCancel: false,
              icon: "📋",
            });
          });
      }
    },
    [showModal]
  );

  return {
    handleSavePortfolio,
    handleSaveChanges,
    openNewPortfolioDialog,
    handleCopyLink,
  };
};
