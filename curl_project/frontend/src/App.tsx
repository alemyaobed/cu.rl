import { useEffect, useState } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Routes } from '@/routes';
import { getGuestToken, getStoredToken, storeToken } from '@/lib/api';

function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        try {
          const token = await getGuestToken();
          storeToken(token);
        } catch (error) {
          console.error('Failed to initialize guest user', error);
        }
      }
      setIsInitializing(false);
    };

    initializeUser();
  }, []);

  if (isInitializing) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Routes />
      <Toaster position="top-center" />
    </ThemeProvider>
  );
}

export default App;
