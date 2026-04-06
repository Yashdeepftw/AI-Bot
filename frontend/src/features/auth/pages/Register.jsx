import '../auth.form.scss'
import { useNavigate, Link } from "react-router";
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

const Register = () => {

    const navigate = useNavigate();
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const { loading, handleRegister } = useAuth();

    const handleSubmit = async(e) => {
        e.preventDefault();
        await handleRegister({ username, email, password })
        navigate('/')
    }
    return (
        <main>
            <div className="form-container">
                <h1>Register</h1>
                <form action="" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input onChange={(e) => {
                            setEmail(e.target.value)
                        }}
                        type="email" name="email" placeholder="Enter email address"/>
                    </div>
                    <div className="input-group">
                        <label htmlFor="name">Username</label>
                        <input onChange={(e) => {
                            setUsername(e.target.value)
                        }} type="text" name="username" placeholder="Enter Username"/>
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input onChange={(e) => {
                            setPassword(e.target.value)
                        }} type="password" name="password" placeholder="Enter Password"/>
                    </div>

                    <button className="button primary-button">
                        Register
                    </button>

                </form>
                <p>Already Have an Account? <Link to={'/login'}>Login</Link></p>
            </div>
        </main>
    )
}

export default Register;