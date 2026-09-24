import { useNavigate } from "react-router-dom";

export default function useAuth() {
  const navigate = useNavigate();

  function login(token, role, email = "") {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("role", role);
    sessionStorage.setItem("email", email);
    navigate("/dashboard");
  }

  function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("email");
    navigate("/");
  }

  function isAuthenticated() {
    return Boolean(sessionStorage.getItem("token"));
  }

  function getRole() {
    return sessionStorage.getItem("role");
  }

  function getEmail() {
    return sessionStorage.getItem("email");
  }

  return {
    login,
    logout,
    isAuthenticated,
    getRole,
    getEmail,
  };
}
