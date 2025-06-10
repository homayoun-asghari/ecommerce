import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authorized, setAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenFromURL = searchParams.get("token");

    if (tokenFromURL) {
      localStorage.setItem("token", tokenFromURL);
    }

    const fetchUser = async () => {
      const token = tokenFromURL || localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:5050/user/account", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUser(data);
          localStorage.setItem("user", JSON.stringify(data));
          setAuthorized(true);
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setAuthorized(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuthorized(false);
        setUser(null);
      }
    };

    fetchUser();
  }, [location]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setAuthorized(false);
  };

  return (
    <UserContext.Provider value={{ user, setUser, authorized, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
