import jwtDecode from "jwt-decode";
import Cookies from "js-cookie";

const useAuth = () => {
  const token = Cookies.get("jwToken");

  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Token inválido", error);
    return null;
  }
};

export default useAuth;
