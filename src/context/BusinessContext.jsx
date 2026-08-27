import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const BusinessContext = createContext();

export const BusinessProvider = ({ children }) => {
  const { business } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const currencySymbol = business?.currency || 'Rs.';

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return `${currencySymbol} 0`;
    const num = Number(amount);
    return `${currencySymbol} ${Math.abs(num).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <BusinessContext.Provider
      value={{
        business,
        currencySymbol,
        formatCurrency,
        refreshKey,
        triggerRefresh,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => useContext(BusinessContext);
