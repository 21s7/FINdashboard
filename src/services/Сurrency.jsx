import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrency } from "../slices/currencySlice";

const Currency = () => {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.currency);

  useEffect(() => {
    dispatch(fetchCurrency());
  }, [dispatch]);

  return null; // он просто загружает данные, ничего не рендерит
};

export default Currency;
