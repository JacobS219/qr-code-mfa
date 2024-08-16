import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from './login-form';
import { AuthenticatorForm } from './authenticator-form';
import { useDispatch } from 'react-redux';
import { setAuth } from '../redux/authSlice';

export const Login = () => {
    const dispatch = useDispatch();

    const [redirect, setRedirect] = useState(false);
    const [loginData, setLoginData] = useState({ id: 0 });

    const success = () => {
        dispatch(setAuth(true));
        setRedirect(true);
    }

    if (redirect) {
        return <Navigate to="/user" />
    }

    let form;

    if (loginData?.id === 0) {
        form = <LoginForm loginData={setLoginData} success={success} />;
    }
    else {
        form = <AuthenticatorForm loginData={loginData} success={success} />;
    }

    return (
        <main className='form-signin'>
            {form}
        </main>
    );
}
