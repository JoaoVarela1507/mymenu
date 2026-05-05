import { Outlet } from 'react-router-dom';
import Sidebar from '../components/shared/Sidebar';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
