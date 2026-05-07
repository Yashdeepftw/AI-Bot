import '../auth.form.scss'
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';

const Logout = () => {
    const { user, loading, handleLogout } = useAuth();
    const navigate = useNavigate();

    const handleLogoutClick = async () => {
        await handleLogout();
        navigate('/login');
    }

    if (loading) {
        return (
            <main>Loading...........</main>
        )
    }

    return (
        <main>
            <div className="form-container">
                <h1>Logout</h1>
                <p className="logout-message">
                    {user ? `You are currently logged in as ${user.username || user.email}` : 'You are about to logout from your account'}
                </p>

                <div className="logout-actions">
                    <button className="button primary-button" onClick={handleLogoutClick}>
                        Confirm Logout
                    </button>

                    <button className="button secondary-button" onClick={() => navigate(-1)}>
                        Go Back
                    </button>
                </div>

                <p className="logout-note">You will need to login again to access your account.</p>
            </div>
        </main>
    )
}
export default Logout
