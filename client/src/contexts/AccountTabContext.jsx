import { createContext, useContext, useState } from "react";

const AccountTabContext = createContext();

export function AccountTabProvider({ children }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  return (
    <AccountTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </AccountTabContext.Provider>
  );
}

export const useAccountTab = () => useContext(AccountTabContext);
