import { useEffect, useState } from 'react';
import axiosInstance from '../interceptors/axios-middleware';
import { useDispatch, useSelector } from 'react-redux';
import { setAuth } from '../redux/authSlice';

export const User = () => {
    const [message, setMessage] = useState('');

    const dispatch = useDispatch();

    const auth = useSelector(state => state.auth.value);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await axiosInstance.get('user');

                setMessage(`Hello ${data.first_name} ${data.last_name}!`);
                dispatch(setAuth(true));
            }
            catch (err) {
                setMessage('You are not authenticated.');
                dispatch(setAuth(false));
            }

        })();
    }, [dispatch]);

    return (
        <div className='container mt-5 text-center'>
            <h1>{auth ? message : 'You are not authenticated.'}</h1>
        </div>
    )
}