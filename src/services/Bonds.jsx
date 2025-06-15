// src/services/Bonds.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBonds } from "../slices/bondsSlice";

const Bonds = () => {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.bonds);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchBonds());
    }
  }, [dispatch, status]);

  return null; // он просто загружает данные, ничего не рендерит
};

export default Bonds;
