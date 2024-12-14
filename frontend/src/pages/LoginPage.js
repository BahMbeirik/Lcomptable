import React, { useState } from 'react';
import axiosInstance from '../api';
import { Link, useNavigate } from "react-router-dom";
import AuthPage from './AuthPage'
import { toast } from 'react-toastify';
const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();


    const handleLogin = (event) => {
        event.preventDefault();
        axiosInstance.post('/auth/login/', {
          username: username,
          password: password
      }).then(response => {
          localStorage.setItem('token', response.data.token);  // تخزين التوكن
          navigate('/', { replace: true });  // التوجيه إلى صفحة الحسابات
          toast.success("Authentication Successfuly!")
      }).catch(error => {
          console.log(error);
          toast.error("Incorected Information !")
      });
      
      
    };

    return (
      <div>
         <AuthPage />
         <div className='d-flex justify-content-center p-5'>
        <form onSubmit={handleLogin} className='w-50 p-5'>
          <div className="form-floating mb-3 ">
            <input
                className="form-control" id="floatingInput"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
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
            />
            <label for="floatingInput">Password</label>
          </div>
          <div class="row mb-4">
          <div class="col-md-6 d-flex justify-content-center">
          
            <div class="form-check mb-3 mb-md-0">
              <input class="form-check-input" type="checkbox" value="" id="loginCheck" checked />
              <label class="form-check-label" for="loginCheck"> Remember me </label>
            </div>
          </div>

          <div class="col-md-6 d-flex justify-content-center">
          
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
        </div>
        <div class="d-grid gap-2">
          <button type="submit" data-mdb-button-init data-mdb-ripple-init class="btn btn-primary btn-block mb-4 shadow">SIGN IN</button>
        </div>
      </form>
      </div>
      </div>
    );
};

export default LoginPage;
