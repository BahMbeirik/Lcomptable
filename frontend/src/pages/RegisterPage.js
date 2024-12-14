import React, { useState } from 'react';
import axiosInstance from '../api';
import AuthPage from './AuthPage'
import { toast } from 'react-toastify';
const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    
    const handleRegister = (event) => {
        event.preventDefault();
        axiosInstance.post('/auth/register/', {
            username: username,
            password: password,
            email: email
        }).then(response => {
            alert('Registration successful!');
            window.location.href = '/login';  // توجيه المستخدم إلى صفحة تسجيل الدخول بعد التسجيل
            toast.success("Sign Up Successfuly!")
        }).catch(error => {
            console.log(error);
            toast.error("Incorected Information !")
        });
    };

    return (
         <div> 
         <AuthPage />
         <div className='d-flex justify-content-center p-5'>
            <form onSubmit={handleRegister} className='w-50 p-5'>
            <div className="form-floating mb-3 ">
                <input
                    className="form-control" id="floatingInput"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                />
                <label for="floatingInput">Username</label>
              </div>
              <div className="form-floating mb-3">
                <input
                    className="form-control " id="floatingInput"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <label for="floatingInput">Password</label>
              </div>
              <div className="form-floating mb-3">
                <input
                    className="form-control " id="floatingInput"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <label for="floatingInput">Email Address</label>
              </div>
              <div class="d-grid gap-2">
              <button type="submit" data-mdb-button-init data-mdb-ripple-init class="btn btn-secondary btn-block mb-4 shadow">SIGN UP</button>
            </div>
                
            </form>
            </div>
        </div>
    );
};

export default RegisterPage;
