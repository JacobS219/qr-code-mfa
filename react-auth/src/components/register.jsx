import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../interceptors/axios-middleware';

export const Register = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    const [message, setMessage] = useState('');

    const [redirect, setRedirect] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();

        setMessage('');

        try {
            const response = await axiosInstance.post('register', {
                first_name: firstName,
                last_name: lastName,
                email,
                password,
                password_confirm: passwordConfirm
            });

            if (response.status === 201) {
                setRedirect(true);
            }

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
            <h1 className="h3 mb-3 font-weight-normal">Please create an account</h1>

            <input
                id="inputFirstName"
                className="form-control"
                placeholder="First name"
                required={true}
                autoFocus={true}
                onChange={(e) => setFirstName(e.target.value)}
            />

            <input id="inputLastName"
                className="form-control"
                placeholder="Last name"
                required={true}
                onChange={(e) => setLastName(e.target.value)}
            />

            <input
                type="email"
                id="inputEmail"
                className="form-control"
                placeholder="Email address"
                required={true}
                onChange={(e) => setEmail(e.target.value)}
            />

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
    );
}