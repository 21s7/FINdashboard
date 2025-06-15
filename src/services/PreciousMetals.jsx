// src/components/PreciousMetals.jsx
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchMetals } from "../slices/metalsSlice";

const PreciousMetals = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMetals());
  }, [dispatch]);

  return null; // Загружает данные, UI не отображает
};

export default PreciousMetals;
