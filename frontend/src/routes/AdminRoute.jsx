import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "superadmin") {
    return <Navigate to="/ges-inter-admin" />;
  }

  return children;
}
