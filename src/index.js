import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter as Router } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);

// Jika Anda ingin mulai mengukur performa di aplikasi Anda,
// berikan fungsi untuk mencatat hasilnya (misalnya: reportWebVitals(console.log))
// atau kirim ke endpoint analitik.
reportWebVitals();
