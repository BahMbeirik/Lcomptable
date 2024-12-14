/* eslint-disable react/style-prop-object */
import React, { useState } from 'react';
import axiosInstance from '../api';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
const NewAccountForm = () => {
    const [accountNumber, setAccountNumber] = useState('');
    const [name, setName] = useState('');
    const [accountType, setAccountType] = useState('asset');
    const [balance, setBalance] = useState('');

    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        axiosInstance.post('/accounts/', {
            account_number: accountNumber,
            name: name,
            account_type: accountType,
            balance: balance
        }).then(response => {
            console.log(response.data);
            navigate('/accounts' );
            toast.success("A new accounts has been Added!")
        }).catch(error => {
            console.log(error);
            toast.error("A new accounts has not Added!")
        });
    };

    return (
      <div className="d-flex justify-content-center mt-4">
      <div className='card ' style={{maxWidth: 20 + 'rem'}}>
      <div class="card-header bg-transparent ">Add Account</div>
        <form onSubmit={handleSubmit} className="was-validated px-4 py-3">
          <div className=" mb-3">
            <label for="validationServer01" className="form-label">Account Number</label>
            <input type="text" className="form-control is-valid" id="validationServer01" required 
              value={accountNumber}
              onChange={(event) => setAccountNumber(event.target.value)}
              placeholder="Account Number"
            />
          </div>
          <div className=" mb-3">
            <label for="validationServer01" className="form-label">Account Name</label>
            <input type="text" className="form-control is-valid" id="validationServer01" required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Account Name"
            />
          </div>
            
          
            <div class="mb-3 ">
            <label for="validationServer01" className="form-label">Account Type</label>
            <select className="form-select" required value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                <option value="current account">Current Account</option>
                <option value="payroll accounts">Payroll Accounts</option>
                <option value="deposit accounts">Deposit Accounts</option>
                <option value="savings accounts">Savings Accounts</option>
            </select>
            </div>

            <div className=" mb-3">
            <label for="validationServer01" className="form-label">Balance</label>
            <div class="input-group ">
              <span class="input-group-text">$</span>
              <input type="number" className="form-control is-valid" id="validationServer01" required 
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="Initial Balance"
            />
              <span class="input-group-text">.00</span>
            </div>
            </div>
            
            <div className=" mb-3">
              <button className="btn btn-primary w-100" type="submit" >Create Account</button>
            </div>
            
        </form>
      </div>
      </div>
    );
};

export default NewAccountForm;
