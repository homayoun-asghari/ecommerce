import React from "react";
import { UserProvider } from "./UserContext";
import { SideBarProvider } from "./SideBarContext";
import { ThemeProvider } from "./ThemeContext";
import { CartProvider } from "./CartContext";
import { WishListProvider } from "./WishListContext";
import { NotificationProvider } from "./NotificationContext";
import { AccountTabProvider } from "./AccountTabContext";
import { FilterProvider } from './FilterContext';

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
                    {children}
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
