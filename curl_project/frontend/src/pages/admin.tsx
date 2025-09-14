import { API_ADMIN_URL } from "@/lib/constants";

const AdminPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-4">
        You need to be logged in as a superuser to access the admin dashboard.
      </p>
      <iframe
        src={API_ADMIN_URL}
        title="Admin Dashboard"
        className="w-full h-screen border-0"
      />
    </div>
  );
};

export default AdminPage;
