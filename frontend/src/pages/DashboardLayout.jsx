import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

const DashboardLayout = () => {
  const token = localStorage.getItem('app-token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-background text-foreground flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
