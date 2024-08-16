import { Link } from 'react-router-dom';
import axiosInstance from '../interceptors/axios-middleware';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { setAuth } from '../redux/authSlice';

export const Nav = () => {
    const auth = useSelector(state => state.auth.value);

    const dispatch = useDispatch();

    const logoutHandler = async () => {
        try {
            await axiosInstance.post('logout');

            dispatch(setAuth(false));
        }
        catch (err) {
            console.log(err);
        }
    }

    let links;

    if (auth) {
        links = (
            <>
                <li className="nav-item">
                    <Link
                        className="nav-link"
                        to="/user">
                        Home
                    </Link>
                </li>
                <li className="nav-item">
                    <Link
                        className="nav-link"
                        onClick={logoutHandler}>
                        Logout
                    </Link>
                </li>
            </>
        );
    }
    else {
        links = (
            <li className="nav-item">
                <Link
                    className="nav-link"
                    to="/register">
                    Register
                </Link>
            </li>
        );
    }

    return (
        <nav className="navbar navbar-expand-md navbar-dark bg-dark">
            <Link className="navbar-brand" to="/">Test JWT Auth App</Link>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExample04" aria-controls="navbarsExample04" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarsExample04">
                <ul className="navbar-nav mr-auto">
                    {links}
                </ul>
            </div>
        </nav>
    )
}