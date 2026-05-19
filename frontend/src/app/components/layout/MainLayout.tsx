import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0118]">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Área de contenido */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="animate-[fadeIn_0.5s_ease-in-out]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
