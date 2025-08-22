import { Outlet } from 'react-router-dom';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Nav />
      <main className="flex-grow container px-4 md:px-6 py-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
