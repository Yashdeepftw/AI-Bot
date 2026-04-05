import '../../form.auth.scss'
import { useNavigate, Link } from "react-router";

const Register = () => {

    const navigate = useNavigate();
     
    const handelSubmit = (e) => {
        e.preventDefault();
    }
    return (
        <main>
            <div className="form-container">
                <h1>Register</h1>
                <form action="" onSubmit={handelSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" placeholder="Enter email address"/>
                    </div>
                    <div className="input-group">
                        <label htmlFor="name">Username</label>
                        <input type="text" name="username" placeholder="Enter Username"/>
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" name="password" placeholder="Enter Password"/>
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