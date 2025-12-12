// src/pages/Logout.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Logout() {
  const { logout } = useAuth(); // your logout function from AuthContext
  const navigate = useNavigate();

  useEffect(() => {
    logout(); // clear token, role, auth state
    navigate("/login", { replace: true });
  }, []);

  return null; // no UI needed
}
