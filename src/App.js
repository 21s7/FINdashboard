import React, { useState, useEffect } from "react";
import { КурсыВалютAPI, КурсыАкцийAPI } from "./components/API";

function App() {
  КурсыВалютAPI();
  КурсыАкцийAPI();
  return <div className="App"></div>;
}

export default App;
