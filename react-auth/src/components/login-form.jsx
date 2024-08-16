import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../interceptors/axios-middleware';

export const LoginForm = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleCredentialResponse = useCallback(async (response) => {
        try {
            const backendResponse = await axiosInstance.post('/google-auth', {
                token: response.credential
            });

            if (backendResponse.status === 200) {
                props.success();
            }
        } 
        catch (error) {
            console.error(error);
            setMessage('Failed to authenticate.');
        }
    }, [props]);

    useEffect(() => {

        window.google?.accounts.id.initialize({
            client_id: "10016xxxxxxx-cjrght1k6qruh3hmb5n5r7xxxxxxxxxx.apps.googleusercontent.com",
            callback: handleCredentialResponse
        });

        window.google?.accounts.id.renderButton(
            document.getElementById('signInDiv'),
            { theme: "outline", size: "large" }
        );

    }, [handleCredentialResponse]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await axiosInstance.post('login', { email, password });
            if (response.status === 200) {
                props.loginData(response.data);
            }
        } 
        catch (err) {
            setMessage(err.response?.data?.message || 'Error logging in');
        }
    };

    return (
        <>
            <form className="form-signin" onSubmit={submitHandler}>
                <h1 className="h3 mb-3 font-weight-normal">Please sign in</h1>
                <input
                    type="email"
                    id="inputEmail"
                    className="form-control"
                    placeholder="Email address"
                    required={true}
                    autoFocus={true}
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
                <p className="text-danger">{message}</p>
                <button className="btn btn-lg btn-primary btn-block" type="submit">
                    Sign in
                </button>
                <div className='mb-3 mt-3'>
                    <Link to="/forgot-password">Forgot Password?</Link>
                </div>
            </form>
            <div id="signInDiv" className='mt-3'></div>
        </>
    );
};
