// src/hooks/useAuth.ts
import { useContext } from "react";
import { AuthContext, AuthProvider } from "../context/AuthContext"; // THIS IS CORRECT

export const useAuth = () => useContext(AuthContext);
