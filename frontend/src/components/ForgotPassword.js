import React, { useState } from 'react';
import axiosInstance from '../api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleForgotPassword = (event) => {
        event.preventDefault();
        axiosInstance.post('/auth/password_reset/', {
            email: email
        }).then(response => {
            setMessage('A password reset link has been sent to your console.');
        }).catch(error => {
            console.log(error);
            setMessage('Error occurred. Please try again.');
        });
    };

    return (
        <div className='d-flex justify-content-center p-5'>
            <form onSubmit={handleForgotPassword} className='w-50 p-5'>
                <div className="form-floating mb-3">
                    <input
                        className="form-control"
                        id="floatingInput"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                    />
                    <label htmlFor="floatingInput">Email Address</label>
                </div>
                {message && <p>{message}</p>}
                <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary btn-block mb-4 shadow">
                        Send Reset Link
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ForgotPassword;
