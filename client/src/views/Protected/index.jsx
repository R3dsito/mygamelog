import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { AuthContext } from "@/contexts/AuthContext";

const Protected = () => {
  const { auth } = useContext(AuthContext);
  let authenticated = { token: auth };

  return authenticated.token ? <Outlet /> : <Navigate to="/login" />;
};

export default Protected;
