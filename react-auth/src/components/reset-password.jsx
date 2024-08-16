import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import axiosInstance from '../interceptors/axios-middleware';

export const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    const { token } = useParams();

    const [message, setMessage] = useState('');

    const [redirect, setRedirect] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault(e);
        setMessage('');

        if (password !== passwordConfirm) {
            setMessage('Passwords do not match');
            return;
        }

        try {
            await axiosInstance.post('reset-password', {
                token,
                password,
                password_confirm: passwordConfirm
            });

            setRedirect(true);
        }
        catch (err) {
            setMessage(err.response.data.message);
        }
    }

    if (redirect) {
        return <Navigate to="/" />
    }

    return (
        <form
            className="form-signin"
            onSubmit={submitHandler}
        >
            <h1 className="h3 mb-3 font-weight-normal">Please create new passwordConfirm</h1>

            <input
                type="password"
                id="inputPassword"
                className="form-control"
                placeholder="Password"
                required={true}
                onChange={(e) => setPassword(e.target.value)}
            />

            <input
                type="password"
                id="inputPasswordConfirm"
                className="form-control"
                placeholder="Password confirm"
                required={true}
                onChange={(e) => setPasswordConfirm(e.target.value)}
            />

            <p className="text-danger">{message}</p>

            <button
                className="btn btn-lg btn-primary btn-block"
                type="submit"
            >
                Submit
            </button>
        </form>
    )
}