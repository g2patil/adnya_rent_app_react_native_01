import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user_id, setUser_id] = useState(null);
  const [session_Id, setSession_Id] = useState(null);

  const logout = () => {
    setUser_id(null);       // Clear the user ID
    setSession_Id(null);    // Clear the session ID
    // You can also clear other user-related states here if needed
  };

  return (
    <UserContext.Provider value={{ user_id, setUser_id, session_Id, setSession_Id, logout }}>
      {children}
    </UserContext.Provider>
  );
};


/*import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user_id, setUser_id] = useState(null);
  const [session_Id, setSession_Id] = useState(null);

  return (
    <UserContext.Provider value={{ user_id, setUser_id, session_Id, setSession_Id }}>
      {children}
    </UserContext.Provider>
  );
};*/