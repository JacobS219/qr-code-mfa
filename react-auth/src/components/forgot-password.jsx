import { useState } from 'react';
import axiosInstance from '../interceptors/axios-middleware';

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const submitHandler = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            await axiosInstance.post('forgot-password', {
                email
            });

            setMessage('Please check your email for password reset link');
        }
        catch (err) {
            setMessage('There was an error sending email');
        }
    }


    return (
        <form
            className="form-signin"
            onSubmit={submitHandler}
        >
            <h1 className="h3 mb-3 font-weight-normal">Please submit email associated with account</h1>
            <input
                type="email"
                id="inputEmail"
                className="form-control"
                placeholder="Email address"
                required={true}
                autoFocus={true}
                onChange={(e) => setEmail(e.target.value)}
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