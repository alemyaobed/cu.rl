import { BrowserRouter, Route, Routes as RouterRoutes } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Home } from '@/pages/home';
import { Dashboard } from '@/pages/dashboard';
import { Analytics } from '@/pages/analytics';
import { Login } from '@/pages/login';
import { Register } from '@/pages/register';

export function Routes() {
  return (
    <BrowserRouter>
      <RouterRoutes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </RouterRoutes>
    </BrowserRouter>
  );
}