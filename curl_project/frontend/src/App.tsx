import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Routes } from '@/routes';
import { AuthProvider } from '@/contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <Routes />
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="top-center" />
    </ThemeProvider>
  );
}

export default App;
