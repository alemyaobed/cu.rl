import { Outlet } from 'react-router-dom';
import { Nav } from '@/components/nav';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>
        <Outlet />
      </main>
    </div>
  );
}