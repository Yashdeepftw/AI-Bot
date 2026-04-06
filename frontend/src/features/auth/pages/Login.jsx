import '../auth.form.scss'
import { Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

const Login = () => {

    const { loading, handleLogin } = useAuth();
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const handelSubmit = async (e) => {
        e.preventDefault();
        handleLogin({ email, password })
    }

    if(loading) { 
        return (
            <main>Loading...........</main>
        )
    }

    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>
                <form action="" onSubmit={handelSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input onChange={(e) => { setEmail(e.target.value) }} type="email" name="email" placeholder="Enter email address" />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input onChange={(e) => { setPassword(e.target.value) }} type="password" name="password" placeholder="Enter Password"/>
                    </div>

                    <button className="button primary-button">
                        Login
                    </button>

                </form>

                <p>Don't Have an Account? <Link to={'/register'}>Register</Link></p>

            </div>
        </main>
    )
}
export default Login