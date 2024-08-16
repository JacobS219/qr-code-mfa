import { useEffect, useState } from 'react';
import axiosInstance from '../interceptors/axios-middleware';
import qrcode from 'qrcode';

export const AuthenticatorForm = (props) => {

    const [code, setCode] = useState('');
    const [img, setImg] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (props.loginData.otpauth_url) {
            qrcode.toDataURL(props.loginData.otpauth_url, (err, data) => {
                setImg(<img src={data} style={{ width: '100%' }} alt="QR code" />)
            });
        }

    }, [props.loginData.otpauth_url]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await axiosInstance.post('two-factor-auth', {
                ...props.loginData,
                code
            });

            if (response.status === 200) {
                props.success();
            }
        }
        catch (err) {
            setMessage(err.response.data.message);
        }
    }

    return (
        <>
            <form
                className="form-signin"
                onSubmit={submitHandler}
            >
                <h1 className="h3 mb-3 font-weight-normal">Please submit authenticator code</h1>
                <input
                    id="inputCode"
                    className="form-control"
                    placeholder="Authenticator code"
                    required={true}
                    autoFocus={true}
                    onChange={(e) => setCode(e.target.value)}
                />

                <p className="text-danger">{message}</p>

                <button
                    className="btn btn-lg btn-primary btn-block mt-3"
                    type="submit"
                >
                    Submit
                </button>
            </form>

            {img}
        </>
    )
}