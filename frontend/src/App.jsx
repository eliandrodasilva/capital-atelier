import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import RegisterPage from "./pages/Register/Register";
import ForgotPasswordPage from "./pages/ForgotPassword/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPassword/ResetPassword";
import DashboardPage from "./pages/Dashboard/Dashboard";
import DashboardLayout from "./pages/DashboardLayout";
import SettingsPage from "./pages/Settings/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;