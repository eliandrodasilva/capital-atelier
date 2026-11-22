import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import RegisterPage from './pages/Register/Register';
import ForgotPasswordPage from './pages/ForgotPassword/ForgotPassword';
import ResetPasswordPage from './pages/ResetPassword/ResetPassword';
import DashboardPage from './pages/Dashboard/Dashboard';
import DashboardLayout from './pages/DashboardLayout';
import TransactionsPage from './pages/Transactions/Transactions';
import WalletsPage from './pages/Wallets/Wallets';
import ReportsPage from './pages/Reports/Reports';
import SettingsPage from './pages/Settings/Settings';
import ProfilePage from './pages/Profile/Profile';
import ChangePasswordPage from './pages/Profile/ChangePassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/wallets" element={<WalletsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/profile/change-password"
            element={<ChangePasswordPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
