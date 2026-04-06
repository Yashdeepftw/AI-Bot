import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";
export const useAuth = () => {
    const context = useContext(AuthContext);

    const { user, SetUser, loading, SetLoading } = context ;

    const handleLogin = async ({ email, password }) => {
        SetLoading(true);
        const data = await login({ email, password });
        SetUser(data.user);
        SetLoading(false);
    }

    const handleRegister = async ({ username, email, password }) => {
        SetLoading(true);
        const data = await register({ username, email, password});
        SetUser(data.user);
        SetLoading(false);
    }

    const handleLogout = async () => {
        SetLoading(true);
        const data = await logout()
        SetUser(null) 
        SetLoading(false);
    }

    return { user, loading, handleLogin, handleLogout, handleRegister }
}