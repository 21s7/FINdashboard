// src/services/Shares.jsx
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchShares } from "../slices/sharesSlice";

const Shares = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchShares());
  }, [dispatch]);

  return null; // он просто загружает данные, ничего не рендерит
};

export default Shares;
