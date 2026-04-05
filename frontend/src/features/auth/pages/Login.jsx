import '../../form.auth.scss'
import { Link } from 'react-router';

const Login = () => {
    const handelSubmit = (e) => {
        e.preventDefault();
    }

    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>
                <form action="" onSubmit={handelSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" placeholder="Enter email address" />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" name="password" placeholder="Enter Password"k />
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