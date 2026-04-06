import { useState, createContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, SetUser] = useState(null);
    const [loading, SetLoading] = useState(false);

    return (
        <AuthContext.Provider value={{user, SetUser, loading, SetLoading}}>
            {children}
        </AuthContext.Provider>
    )
}