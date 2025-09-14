import { Route, Routes as RouterRoutes } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Home } from "@/pages/home";
import { Dashboard } from "@/pages/dashboard";
import { Analytics } from "@/pages/analytics";
import { Login } from "@/pages/login";
import { Register } from "@/pages/register";
import { RedirectPage } from "@/pages/redirect";
import { NotFoundPage } from "@/pages/not-found";
import { ForgotPassword } from "@/pages/forgot-password";
import { PasswordResetConfirm } from "@/pages/password-reset-confirm";
import { ProtectedRoute } from "@/components/protected-route";
import { GuestRoute } from "@/components/guest-route";
import AdminPage from "@/pages/admin";

export function Routes() {
  return (
    <RouterRoutes>
      <Route path="/" element={<Layout />}>
        <Route element={<GuestRoute />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route
            path="password-reset/:uid/:token"
            element={<PasswordResetConfirm />}
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analytics/:uuid" element={<Analytics />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>

        <Route path=":slug" element={<RedirectPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </RouterRoutes>
  );
}
