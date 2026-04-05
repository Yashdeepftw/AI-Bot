import { createBrowserRouter } from 'react-router'
import Login from './features/auth/components/pages/Login'
import Register from './features/auth/components/pages/Register'

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/register',
        element: <Register />
    }
])