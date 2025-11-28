//src/components/search/FormSuggestions.jsx
import React from "react";
import DepositForm from "../DepositForm";
import RealEstateForm from "../RealEstateForm";
import BusinessForm from "../BusinessForm";

export const FormSuggestions = ({
  showDepositForm,
  showRealEstateForm,
  showBusinessForm,
  onCloseForm,
}) => {
  if (!showDepositForm && !showRealEstateForm && !showBusinessForm) {
    return null;
  }

  const renderForm = (type, title, FormComponent) => (
    <div className={`${type}-form-container`}>
      <div className="form-header">
        <h3>{title}</h3>
        <button onClick={() => onCloseForm(type)} className="close-form-button">
          ✕
        </button>
      </div>
      <FormComponent onClose={() => onCloseForm(type)} />
    </div>
  );

  return (
    <div className="form-suggestions">
      {showDepositForm &&
        renderForm("deposit", "Добавить депозит", DepositForm)}
      {showRealEstateForm &&
        renderForm("realestate", "Добавить недвижимость", RealEstateForm)}
      {showBusinessForm &&
        renderForm("business", "Добавить бизнес", BusinessForm)}
    </div>
  );
};
