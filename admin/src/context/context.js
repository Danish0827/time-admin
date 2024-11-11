// contexts/UserContext.js
"use client";
import { createContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [masjids,setMasjids] = useState(null);
  const [features, setFeatures] = useState(null);
  const [splan, setSplan] = useState(null);
  const [hadeeths, setHadeeths] = useState(null);

  return (
    <UserContext.Provider value={{ user,  setUser,masjids,setMasjids,features, setFeatures,splan, setSplan,hadeeths, setHadeeths }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;