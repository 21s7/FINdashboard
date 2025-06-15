// src/services/Cryptocurrencies.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCrypto } from "../slices/cryptoSlice";

const Cryptocurrencies = () => {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.crypto);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCrypto());
    }
  }, [dispatch, status]);

  return null; // он просто загружает данные, ничего не рендерит
};

export default Cryptocurrencies;
