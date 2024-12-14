import React, { useState, useEffect } from 'react';
import axiosInstance from '../api';
import { MdEdit ,MdOutlineDelete } from "react-icons/md";
import DataTable from 'react-data-table-component';
import Loader from './../components/Loader';
import { toast } from 'react-toastify';
const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);  // حالة لتخزين الحسابات
    const [filteredTransations, setFilteredTransations] = useState([]); // To store filtered accounts
    const [searchText, setSearchText] = useState(''); // To store the search text
    let [loading, setLoading] = useState(false);

    const [newTransaction, setNewTransaction] = useState({
        transaction_type: '',
        amount: '',
        description: '',
        account: ''
    });
    const [editTransaction, setEditTransaction] = useState(null);

    
    useEffect(() => {
        fetchTransactions();
        fetchAccounts();  // جلب الحسابات عند تحميل الصفحة
    }, []);

    const fetchTransactions = () => {
      setLoading(true);
        axiosInstance.get('/transactions/')
            .then(response => {
                setTransactions(response.data);
                setFilteredTransations(response.data);
                setLoading(false);
                
            })
            .catch(error => {
                console.log(error);
                
            });
    };

    // جلب قائمة الحسابات
    const fetchAccounts = () => {
        axiosInstance.get('/accounts/')
            .then(response => {
                setAccounts(response.data);  // تخزين الحسابات
            })
            .catch(error => {
                console.log(error);
            });
    };

    // إضافة معاملة جديدة
    const handleAddTransaction = () => {
        axiosInstance.post('/transactions/', newTransaction)
            .then(() => {
                setNewTransaction({ transaction_type: '', amount: '', description: '', account: '' });
                fetchTransactions();  // إعادة جلب المعاملات بعد الإضافة
                toast.success("A new transaction has been Added!")
            })
            .catch(error => {
                console.log(error);
                if (error.response && error.response.data) {
                  toast.error(error.response.data);
              } else {
                  toast.error("A new transaction has not been added!");
              }
            });
    };

    // تعديل معاملة
    const handleEditTransaction = (transaction) => {
        setEditTransaction(transaction);
    };

    const handleUpdateTransaction = () => {
        axiosInstance.put(`/transactions/${editTransaction.id}/`, editTransaction)
            .then(() => {
                setEditTransaction(null);
                fetchTransactions();  // إعادة جلب المعاملات بعد التعديل
                toast.success("Transaction has been updated!")
            })
            .catch(error => {
                console.log(error);
                toast.error("Transaction has not updated!")
            });
    };

    // حذف معاملة
    const handleDeleteTransaction = (transactionId) => {
        axiosInstance.delete(`/transactions/${transactionId}/`)
            .then(() => {
                fetchTransactions();  // إعادة جلب المعاملات بعد الحذف
                toast.success("Transaction has been deleted!")
            })
            .catch(error => {
                console.log(error);
                toast.error("Transaction has not deleted!")
            });
    };

    // Define columns for DataTable
    const columns = [
      {
          name: 'Type',
          selector: row => row.transaction_type,
          sortable: true,
      },
      {
          name: 'Date',
          selector: row => row.date,
          sortable: true,
      },
      {
          name: 'Amount',
          selector: row => row.amount,
          sortable: true,
      },
      {
          name: 'Description',
          selector: row => row.description,
          sortable: true,
      },
      {
        name: 'Account',
        selector: row => row.account_name,
        sortable: true,
      },
      {
        name: 'Actions',
        cell: (row) => (
            <div className='d-flex'>
                <p className='me-1 text-primary' role="button" onClick={() => handleEditTransaction(row)}>
                    <MdEdit />
                </p>
                <p className='ms-1 text-danger' role="button" onClick={() => handleDeleteTransaction(row.id)}>
                    <MdOutlineDelete />
                </p>
            </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
    },
  ];

  // Handle search functionality
  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchText(value);

    const filteredData = transactions.filter(transaction =>
        transaction.transaction_type.toLowerCase().includes(value.toLowerCase()) ||
        transaction.date.toLowerCase().includes(value.toLowerCase()) ||
        transaction.amount.toString().includes(value) ||
        transaction.description.toLowerCase().includes(value.toLowerCase()) ||
        transaction.account_name.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredTransations(filteredData);
};

    return (
        <div className='pt-2'>
        <h4 className='d-flex justify-content-center mb-2'>{editTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h4>
        <form  onSubmit={(e) => { e.preventDefault(); editTransaction ? handleUpdateTransaction() : handleAddTransaction(); }}>
          <div className="row g-2">
            <div className="col-md">
              <select className="form-select" id="floatingSelectGrid"
                  value={editTransaction ? editTransaction.transaction_type : newTransaction.transaction_type}
                  onChange={(e) => editTransaction
                      ? setEditTransaction({ ...editTransaction, transaction_type: e.target.value })
                      : setNewTransaction({ ...newTransaction, transaction_type: e.target.value })}
              >
                  <option value="">Select Type</option>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
              </select>
            </div>
            <div className="col-md">
                <input className="form-control" id="floatingInputGrid"
                    type="number"
                    value={editTransaction ? editTransaction.amount : newTransaction.amount}
                    onChange={(e) => editTransaction
                        ? setEditTransaction({ ...editTransaction, amount: e.target.value })
                        : setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    placeholder="Amount"
                />
            </div>
            <div className="col-md">
                <input className="form-control" id="floatingInputGrid"
                type="text"
                value={editTransaction ? editTransaction.description : newTransaction.description}
                onChange={(e) => editTransaction
                    ? setEditTransaction({ ...editTransaction, description: e.target.value })
                    : setNewTransaction({ ...newTransaction, description: e.target.value })}
                placeholder="Description"
            />
            </div>

            <div className="col-md">
              <select className="form-select" id="floatingSelectGrid"
                value={editTransaction ? editTransaction.account : newTransaction.account}
                onChange={(e) => editTransaction
                    ? setEditTransaction({ ...editTransaction, account: e.target.value })
                    : setNewTransaction({ ...newTransaction, account: e.target.value })}
                >
                <option value="">Select Account</option>
                {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                        {account.name}
                    </option>
                ))}
              </select>
            </div>
            
            <button className="btn btn-primary btn-sm ms-1 rounded-pill" type="submit"> {editTransaction ? 'Update' : 'Add'}</button>

            </div>
        </form>


        <div className='d-flex justify-content-between'>
          <h4 className='mt-3 '>Transactions</h4>
          <div>
            <input style={{width:'400px'}}
                type="text"
                placeholder="Search Transactions"
                className="form-control mt-2"
                value={searchText}
                onChange={handleSearch}
            />
          </div>
        </div>
        <div className="ms-2">
        
                <DataTable
                    columns={columns}
                    data={filteredTransations} // Display filtered data
                    pagination
                    highlightOnHover
                    striped
                    paginationRowsPerPageOptions={[5, 10, 15, 20]} 
                    paginationPerPage={5}
                />
                {loading && <Loader loading={loading}/>}
            </div>
        
            
        </div>
    );
};

export default TransactionsPage;
