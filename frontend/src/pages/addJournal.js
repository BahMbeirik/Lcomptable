import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AddJournalEntry = () => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      date: '',
      description: '',
      debit_account: '',
      debit_amount: 0,
      credit_account: '',
      credit_amount: 0,
    }
  });

  const [accounts, setAccounts] = useState([]);
  const navigate = useNavigate();

  // جلب قائمة الحسابات عند تحميل الصفحة
  useEffect(() => {
    axiosInstance.get('/accounts/')
      .then(response => {
        setAccounts(response.data);
      })
      .catch(error => console.error(error));
  }, []);

  const onSubmit = (data) => {
    if (parseFloat(data.debit_amount) !== parseFloat(data.credit_amount)) {
      alert('Debit and Credit amounts must be equal!');
      return;
    }

    axiosInstance.post('/journal-entries/', data)
      .then(response => {
        reset();
        navigate('/journal');
        toast.success("A new journal has been Added!")
      })
      .catch(error =>{
        console.error(error)
        toast.error("A new journal has not Added!")
      } );
  };

  return (
    <div className=" d-flex justify-content-center p-5">
    <div className='bg-white rounded w-50 p-4'>
      <h3 className='text-center m-2'>Add New Journal Entry</h3>
      <form onSubmit={handleSubmit(onSubmit)} >
        <div className="row mt-5 mb-3">
          <div className="col">
            <input className="form-control" placeholder='Date' type="date" {...register("date")} required />
          </div>

        <div className="col">
          <input className="form-control" placeholder='Description' type="text" {...register("description")} required />
        </div>
        </div>
        <div className="row mt-3 mb-3">
        {/* قائمة منسدلة لحساب المدين */}
        <div className="col">
          <label>Debit Account</label>
          <select className="form-control" {...register("debit_account")} required>
            <option value="">Select Debit Account</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col">
        <label>Debit Amount</label>
          <input className="form-control" placeholder='Debit Amount' type="number" step="0.01" {...register("debit_amount")} required />
        </div>
        </div>
        <div className="row mt3 mb-5">
        {/* قائمة منسدلة لحساب الدائن */}
        <div className="col">
          <label>Credit Account</label>
          <select className="form-control" {...register("credit_account")} required>
            <option value="">Select Credit Account</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col">
        <label>Credit Amount</label>
          <input className="form-control" placeholder='Credit Amount' type="number" step="0.01" {...register("credit_amount")} required />
        </div>
        </div>
        
        <button type="submit" className="btn btn-primary w-100">Add Journal Entry</button>
      </form>
      </div>
    </div>
  );
};

export default AddJournalEntry;
