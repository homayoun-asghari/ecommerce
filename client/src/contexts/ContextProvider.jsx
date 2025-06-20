import React from "react";
import { UserProvider } from "./UserContext";
import { SideBarProvider } from "./SideBarContext";
import { ThemeProvider } from "./ThemeContext";
import { CartProvider } from "./CartContext";
import { WishListProvider } from "./WishListContext";
import { NotificationProvider } from "./NotificationContext";
import { AccountTabProvider } from "./AccountTabContext";
import { FilterProvider } from './FilterContext';
import { CompareProvider } from "./CompareContext";

export default function ContextProviders({ children }) {
  return (
    <UserProvider>
      <CartProvider>
        <WishListProvider>
          <FilterProvider>
            <NotificationProvider>
              <ThemeProvider>
                <SideBarProvider>
                  <AccountTabProvider>
                    <CompareProvider>
                      {children}
                    </CompareProvider>
                  </AccountTabProvider>
                </SideBarProvider>
              </ThemeProvider>
            </NotificationProvider>
          </FilterProvider>
        </WishListProvider>
      </CartProvider>
    </UserProvider>
  );
}
