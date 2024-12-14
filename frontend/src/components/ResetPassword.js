import React, { useState } from 'react';
import axiosInstance from '../api';
import { useNavigate, useSearchParams } from "react-router-dom";

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const handleResetPassword = (event) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }

        axiosInstance.post('/auth/password_reset/confirm/', {
            token: token,
            password: password
        }).then(response => {
            setMessage('Password has been reset successfully.');
            navigate('/login');  // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول بعد النجاح
        }).catch(error => {
            console.log(error);
            setMessage('Error occurred. Please try again.');
        });
    };

    return (
        <div className='d-flex justify-content-center p-5'>
            <form onSubmit={handleResetPassword} className='w-50 p-5'>
                <div className="form-floating mb-3">
                    <input
                        className="form-control"
                        id="floatingPassword"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="New Password"
                    />
                    <label htmlFor="floatingPassword">New Password</label>
                </div>
                <div className="form-floating mb-3">
                    <input
                        className="form-control"
                        id="floatingConfirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm New Password"
                    />
                    <label htmlFor="floatingConfirmPassword">Confirm New Password</label>
                </div>
                {message && <p>{message}</p>}
                <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary btn-block mb-4 shadow">
                        Reset Password
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ResetPassword;
