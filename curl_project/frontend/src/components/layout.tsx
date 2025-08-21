import { Outlet } from 'react-router-dom';
import { Nav } from '@/components/nav';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container px-4 md:px-6 py-4">
        <Outlet />
      </main>
    </div>
  );
}