import React, { useState, useEffect } from 'react';
import axiosInstance from '../api';
import { MdEdit, MdOutlineDelete, MdAdd, MdSearch, MdRefresh, MdClose } from "react-icons/md";
import DataTable from 'react-data-table-component';
import Loader from './../components/Loader';
import { toast } from 'react-toastify';
import { GrTransaction } from "react-icons/gr";

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [newTransaction, setNewTransaction] = useState({
        transaction_type: '',
        amount: '',
        description: '',
        account: ''
    });
    const [editTransaction, setEditTransaction] = useState(null);

    useEffect(() => {
        fetchTransactions();
        fetchAccounts();
    }, []);

    const fetchTransactions = () => {
        setLoading(true);
        axiosInstance.get('/transactions/')
            .then(response => {
                setTransactions(response.data);
                setFilteredTransactions(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.log(error);
                toast.error("Failed to load transactions");
                setLoading(false);
            });
    };

    const fetchAccounts = () => {
        axiosInstance.get('/accounts/')
            .then(response => {
                setAccounts(response.data);
            })
            .catch(error => {
                console.log(error);
                toast.error("Failed to load accounts");
            });
    };

    const handleAddTransaction = () => {
        setLoading(true);
        axiosInstance.post('/transactions/', newTransaction)
            .then(() => {
                setNewTransaction({ transaction_type: '', amount: '', description: '', account: '' });
                fetchTransactions();
                toast.success("New transaction added successfully!");
                setShowForm(false);
            })
            .catch(error => {
                console.log(error);
                if (error.response && error.response.data) {
                    toast.error(error.response.data);
                } else {
                    toast.error("Failed to add transaction!");
                }
                setLoading(false);
            });
    };

    const handleEditTransaction = (transaction) => {
        setEditTransaction(transaction);
        setShowForm(true);
    };

    const handleUpdateTransaction = () => {
        setLoading(true);
        axiosInstance.put(`/transactions/${editTransaction.id}/`, editTransaction)
            .then(() => {
                setEditTransaction(null);
                fetchTransactions();
                toast.success("Transaction updated successfully!");
                setShowForm(false);
            })
            .catch(error => {
                console.log(error);
                toast.error("Failed to update transaction!");
                setLoading(false);
            });
    };

    const handleDeleteTransaction = (transactionId) => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            setLoading(true);
            axiosInstance.delete(`/transactions/${transactionId}/`)
                .then(() => {
                    fetchTransactions();
                    toast.success("Transaction deleted successfully!");
                })
                .catch(error => {
                    console.log(error);
                    toast.error("Failed to delete transaction!");
                    setLoading(false);
                });
        }
    };

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

        setFilteredTransactions(filteredData);
    };

    const resetForm = () => {
        setEditTransaction(null);
        setNewTransaction({ transaction_type: '', amount: '', description: '', account: '' });
        setShowForm(false);
    };

    // Custom styles for DataTable
    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#f8f9fa',
                borderRadius: '8px 8px 0 0'
            },
        },
        headCells: {
            style: {
                fontSize: '14px',
                fontWeight: '600',
                paddingLeft: '16px',
                paddingRight: '16px',
            },
        },
        rows: {
            style: {
                fontSize: '14px',
                minHeight: '56px',
            },
            highlightOnHoverStyle: {
                backgroundColor: '#f1f1f1',
                transitionDuration: '0.15s',
                transitionProperty: 'background-color',
                outlineStyle: 'solid',
                outlineWidth: '1px',
                outlineColor: '#e9ecef',
            },
        },
        pagination: {
            style: {
                borderRadius: '0 0 8px 8px',
            },
        },
    };

    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '10px',
        fontFamily: 'Arial, sans-serif'
    };

    const cardStyle = {
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
    };

    const headerStyle = {
        padding: '20px',
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    const headerTitleStyle = {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#343a40',
        margin: 0
    };

    const addButtonStyle = {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#3730a3',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '8px 16px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.2s'
    };

    const formContainerStyle = {
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e9ecef'
    };

    const formTitleStyle = {
        fontSize: '18px',
        fontWeight: '600',
        color: '#343a40',
        marginBottom: '15px'
    };

    const formGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px'
    };

    const inputGroupStyle = {
        marginBottom: '10px'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#495057',
        marginBottom: '5px'
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        border: '1px solid #ced4da',
        borderRadius: '5px',
        fontSize: '14px',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box'
    };

    const selectStyle = {
        ...inputStyle,
        height: '40px',
        appearance: 'auto'
    };

    const formActionStyle = {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '15px'
    };

    const cancelButtonStyle = {
        padding: '8px 16px',
        backgroundColor: '#e9ecef',
        color: '#495057',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    };

    const submitButtonStyle = {
        padding: '8px 16px',
        backgroundColor: editTransaction ? '#28a745' : '#3730a3',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    };

    const searchContainerStyle = {
        padding: '15px 20px',
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    const searchWrapperStyle = {
        position: 'relative',
        maxWidth: '400px',
        width: '100%'
    };

    const searchIconStyle = {
        position: 'absolute',
        left: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#6c757d'
    };

    const searchInputStyle = {
        width: '100%',
        padding: '10px 10px 10px 35px',
        border: '1px solid #ced4da',
        borderRadius: '5px',
        fontSize: '14px'
    };

    const tableContainerStyle = {
        padding: '20px'
    };

    const actionButtonStyle = {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '5px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    // Define columns for DataTable
    const columns = [
        {
            name: 'Type',
            selector: row => row.transaction_type,
            sortable: true,
            cell: row => (
                <div style={{
                    backgroundColor: row.transaction_type === 'credit' ? '#d4edda' : '#f8d7da',
                    color: row.transaction_type === 'credit' ? '#155724' : '#721c24',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500'
                }}>
                    {row.transaction_type.charAt(0).toUpperCase() + row.transaction_type.slice(1)}
                </div>
            ),
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
            cell: row => (
                <div style={{ color: row.transaction_type === 'credit' ? '#28a745' : '#dc3545', fontWeight: '500' }}>
                    {row.transaction_type === 'credit' ? '+' : '-'}{row.amount} MRU
                </div>
            ),
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
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => handleEditTransaction(row)}
                        style={{ ...actionButtonStyle, color: '#4361ee' }}
                        title="Edit"
                    >
                        <MdEdit size={18} />
                    </button>
                    <button 
                        onClick={() => handleDeleteTransaction(row.id)}
                        style={{ ...actionButtonStyle, color: '#dc3545' }}
                        title="Delete"
                    >
                        <MdOutlineDelete size={18} />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                {/* Header */}
                <div style={headerStyle}>
                  <div className="flex items-center  sm:mb-0">
                          <GrTransaction className="text-3xl text-indigo-600" />
                          <div className="ml-2">
                              <h2 className="text-2xl font-bold text-gray-800">Transactions Management</h2>
                          </div>
                  </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={addButtonStyle}
                    >
                        {showForm ? (
                            <>
                                <MdClose style={{ marginRight: '5px' }} />
                                Cancel
                            </>
                        ) : (
                            <>
                                <MdAdd style={{ marginRight: '5px' }} />
                                New Transaction
                            </>
                        )}
                    </button>
                </div>

                {/* Transaction Form */}
                {showForm && (
                    <div style={formContainerStyle}>
                        <h3 style={formTitleStyle}>
                            {editTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                        </h3>
                        <form onSubmit={(e) => { e.preventDefault(); editTransaction ? handleUpdateTransaction() : handleAddTransaction(); }}>
                            <div style={formGridStyle}>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Type</label>
                                    <select
                                        style={selectStyle}
                                        value={editTransaction ? editTransaction.transaction_type : newTransaction.transaction_type}
                                        onChange={(e) => editTransaction
                                            ? setEditTransaction({ ...editTransaction, transaction_type: e.target.value })
                                            : setNewTransaction({ ...newTransaction, transaction_type: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        <option value="credit">Credit</option>
                                        <option value="debit">Debit</option>
                                    </select>
                                </div>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Amount</label>
                                    <input
                                        type="number"
                                        style={inputStyle}
                                        value={editTransaction ? editTransaction.amount : newTransaction.amount}
                                        onChange={(e) => editTransaction
                                            ? setEditTransaction({ ...editTransaction, amount: e.target.value })
                                            : setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                        placeholder="Amount"
                                        required
                                    />
                                </div>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Description</label>
                                    <input
                                        type="text"
                                        style={inputStyle}
                                        value={editTransaction ? editTransaction.description : newTransaction.description}
                                        onChange={(e) => editTransaction
                                            ? setEditTransaction({ ...editTransaction, description: e.target.value })
                                            : setNewTransaction({ ...newTransaction, description: e.target.value })}
                                        placeholder="Description"
                                        required
                                    />
                                </div>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Account</label>
                                    <select
                                        style={selectStyle}
                                        value={editTransaction ? editTransaction.account : newTransaction.account}
                                        onChange={(e) => editTransaction
                                            ? setEditTransaction({ ...editTransaction, account: e.target.value })
                                            : setNewTransaction({ ...newTransaction, account: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Account</option>
                                        {accounts.map(account => (
                                            <option key={account.id} value={account.id}>
                                                {account.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div style={formActionStyle}>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={cancelButtonStyle}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={submitButtonStyle}
                                >
                                    {editTransaction ? 'Update Transaction' : 'Add Transaction'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Search and Filters */}
                <div style={searchContainerStyle}>
                    <div style={searchWrapperStyle}>
                        <div style={searchIconStyle}>
                            <MdSearch />
                        </div>
                        <input
                            type="text"
                            style={searchInputStyle}
                            placeholder="Search transactions..."
                            value={searchText}
                            onChange={handleSearch}
                        />
                    </div>
                    <button 
                        onClick={fetchTransactions}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 12px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #ced4da',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        <MdRefresh style={{ marginRight: '5px' }} />
                        Refresh
                    </button>
                </div>

                {/* DataTable */}
                <div style={tableContainerStyle}>
                    <DataTable
                        columns={columns}
                        data={filteredTransactions}
                        customStyles={customStyles}
                        pagination
                        highlightOnHover
                        striped
                        paginationRowsPerPageOptions={[5, 10, 15, 20]}
                        paginationPerPage={5}
                        noDataComponent={
                            <div style={{
                                padding: '24px',
                                textAlign: 'center',
                                color: '#6c757d'
                            }}>
                                No transactions found
                            </div>
                        }
                    />
                    {loading && <Loader loading={loading}/>}
                </div>
            </div>
        </div>
    );
};

export default TransactionsPage;