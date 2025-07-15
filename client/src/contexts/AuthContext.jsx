import { useState, useEffect, createContext } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const auth = Cookies.get("jwToken") || null;

useEffect(() => {
  const auth = Cookies.get("jwToken");
  if (auth) {
    const decoded = jwtDecode(auth);
    setUser({
      name: decoded.usuario.name,
      id: decoded.usuario._id,
      username: decoded.usuario.username,
    });
  }
}, [Cookies.get("jwToken")]); // aunque cookies no sea reactiva, podrías usar otra señal


  const logoutUser = () => {
    setUser(null);
    Cookies.remove("jwToken");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, auth, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
