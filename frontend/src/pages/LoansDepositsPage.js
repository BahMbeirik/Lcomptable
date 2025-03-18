import React, { useState, useEffect } from 'react';
import axiosInstance from '../api';
import { toast } from 'react-toastify';

// Icons
import { PlusCircleIcon, PencilIcon, TrashIcon, SearchIcon, CashIcon, CreditCardIcon } from '@heroicons/react/outline';

const LoansDepositsPage = () => {
    const [loans, setLoans] = useState([]);
    const [deposits, setDeposits] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [newTransaction, setNewTransaction] = useState({ type: 'loan', amount: '', interest_rate: '', account: '' });
    const [loading, setLoading] = useState(false);
    const [totalLoans, setTotalLoans] = useState(0);
    const [totalDeposits, setTotalDeposits] = useState(0);

    const [filteredLoans, setFilteredLoans] = useState([]);
    const [searchTextLoan, setSearchTextLoan] = useState('');

    const [filteredDeposits, setFilteredDeposits] = useState([]);
    const [searchTextDeposit, setSearchTextDeposit] = useState('');
    
    const [currentPage, setCurrentPage] = useState({ loan: 1, deposit: 1 });
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        setLoading(true);
        // Fetch loans
        axiosInstance.get('/loans/')
            .then(response => {
                setLoans(response.data);
                calculateTotal(response.data, 'loan');
                setFilteredLoans(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.log(error);
                setLoading(false);
            });

        // Fetch deposits
        axiosInstance.get('/deposits/')
            .then(response => {
                setDeposits(response.data);
                calculateTotal(response.data, 'deposit');
                setFilteredDeposits(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.log(error);
                setLoading(false);
            });

        // Fetch accounts
        axiosInstance.get('/accounts/')
            .then(response => {
                setAccounts(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    }, []);

    const calculateTotal = (transactions, type) => {
        const total = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
        if (type === 'loan') setTotalLoans(total);
        else setTotalDeposits(total);
    };

    const handleAddTransaction = (type) => {
        setNewTransaction({ type, amount: '', interest_rate: '', account: '' });
        setEditMode(false);
        setShowModal(true);
    };

    const handleEditTransaction = (transaction, type) => {
        setSelectedTransaction(transaction);
        setNewTransaction({
            type,
            amount: transaction.amount,
            interest_rate: transaction.interest_rate,
            account: transaction.account,
            start_date: transaction.start_date,
            end_date: transaction.end_date,
            deposit_date: transaction.deposit_date,
            maturity_date: transaction.maturity_date
        });
        setEditMode(true);
        setShowModal(true);
    };

    const handleSaveTransaction = () => {
        const url = newTransaction.type === 'loan'
          ? `/loans/${editMode ? selectedTransaction.id + '/' : ''}`
          : `/deposits/${editMode ? selectedTransaction.id + '/' : ''}`;
  
        const method = editMode ? 'put' : 'post';

        const data = {
            amount: newTransaction.amount,
            interest_rate: newTransaction.interest_rate,
            account: newTransaction.account,
            start_date: newTransaction.type === 'loan' ? newTransaction.start_date : undefined,
            end_date: newTransaction.type === 'loan' ? newTransaction.end_date : undefined,
            deposit_date: newTransaction.type === 'deposit' ? newTransaction.deposit_date : undefined,
            maturity_date: newTransaction.type === 'deposit' ? newTransaction.maturity_date : undefined,
        };

        axiosInstance({ method, url, data })
            .then(response => {
                if (newTransaction.type === 'loan') {
                    if (editMode) {
                        const updatedLoans = loans.map(loan => loan.id === selectedTransaction.id ? response.data : loan);
                        setLoans(updatedLoans);
                        calculateTotal(updatedLoans, 'loan');
                        toast.success("Loan has been updated successfully!");
                    } else {
                        setLoans([...loans, response.data]);
                        calculateTotal([...loans, response.data], 'loan');
                        toast.success("New loan has been created successfully!");
                    }
                } else {
                    if (editMode) {
                        const updatedDeposits = deposits.map(deposit => deposit.id === selectedTransaction.id ? response.data : deposit);
                        setDeposits(updatedDeposits);
                        calculateTotal(updatedDeposits, 'deposit');
                        toast.success("Deposit has been updated successfully!");
                    } else {
                        setDeposits([...deposits, response.data]);
                        calculateTotal([...deposits, response.data], 'deposit');
                        toast.success("New deposit has been created successfully!");
                    }
                }
                setShowModal(false);
            })
            .catch(error => {
                console.error('Error:', error.response ? error.response.data : error.message);
                toast.error('An error occurred. Please try again.');
            });
    };

    const handleDeleteTransaction = (id, type) => {
        const deleteUrl = type === 'loan' ? `/loans/${id}/` : `/deposits/${id}/`;
        axiosInstance.delete(deleteUrl)
            .then(() => {
                if (type === 'loan') {
                    const updatedLoans = loans.filter(loan => loan.id !== id);
                    setLoans(updatedLoans);
                    calculateTotal(updatedLoans, 'loan');
                    toast.success("Loan has been deleted successfully!");
                } else {
                    const updatedDeposits = deposits.filter(deposit => deposit.id !== id);
                    setDeposits(updatedDeposits);
                    calculateTotal(updatedDeposits, 'deposit');
                    toast.success("Deposit has been deleted successfully!");
                }
            })
            .catch(error => {
                console.log(error);
                toast.error('Failed to delete. Please try again.');
            });
    };

    // Handle search functionality
    const handleSearchLoan = (event) => {
        const value = event.target.value;
        setSearchTextLoan(value);

        const filteredData = loans.filter(loan =>
            (loan.interest_rate && loan.interest_rate.toLowerCase().includes(value.toLowerCase())) ||
            (loan.start_date && loan.start_date.toLowerCase().includes(value.toLowerCase())) ||
            (loan.amount && loan.amount.toString().includes(value)) ||
            (loan.end_date && loan.end_date.toLowerCase().includes(value.toLowerCase())) ||
            (loan.account_name && loan.account_name.toLowerCase().includes(value.toLowerCase()))
        );

        setFilteredLoans(filteredData);
        setCurrentPage({ ...currentPage, loan: 1 }); // Reset to first page when searching
    };

    const handleSearchDeposit = (event) => {
        const value = event.target.value;
        setSearchTextDeposit(value);

        const filteredData = deposits.filter(deposit =>
            (deposit.interest_rate && deposit.interest_rate.toLowerCase().includes(value.toLowerCase())) ||
            (deposit.deposit_date && deposit.deposit_date.toLowerCase().includes(value.toLowerCase())) ||
            (deposit.amount && deposit.amount.toString().includes(value)) ||
            (deposit.maturity_date && deposit.maturity_date.toLowerCase().includes(value.toLowerCase())) ||
            (deposit.account_name && deposit.account_name.toLowerCase().includes(value.toLowerCase()))
        );

        setFilteredDeposits(filteredData);
        setCurrentPage({ ...currentPage, deposit: 1 }); // Reset to first page when searching
    };

    // Pagination
    const paginate = (data, page, rowsPerPage) => {
        const startIndex = (page - 1) * rowsPerPage;
        return data.slice(startIndex, startIndex + rowsPerPage);
    };

    const handlePageChange = (type, page) => {
        setCurrentPage({ ...currentPage, [type]: page });
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage({ loan: 1, deposit: 1 }); // Reset to first page when changing rows per page
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 shadow-lg">
                    <div className="flex items-center">
                        <CreditCardIcon className="h-10 w-10 text-white" />
                        <div className="ml-4">
                            <h2 className="text-white text-lg font-semibold">Total Loans</h2>
                            <p className="text-white text-2xl font-bold">{formatCurrency(totalLoans)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 shadow-lg">
                    <div className="flex items-center">
                        <CashIcon className="h-10 w-10 text-white" />
                        <div className="ml-4">
                            <h2 className="text-white text-lg font-semibold">Total Deposits</h2>
                            <p className="text-white text-2xl font-bold">{formatCurrency(totalDeposits)}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Loans Section */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-indigo-800 flex items-center">
                            <CreditCardIcon className="h-5 w-5 mr-2 text-indigo-500" />
                            Loans
                        </h2>
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <input 
                                    type="text"
                                    placeholder="Search loans..."
                                    className="pl-8 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
                                    value={searchTextLoan}
                                    onChange={handleSearchLoan}
                                />
                                <SearchIcon className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                            </div>
                            <button 
                                onClick={() => handleAddTransaction('loan')}
                                className="p-2 rounded-full bg-blue-100 text-indigo-600 hover:bg-blue-200 transition-colors"
                            >
                                <PlusCircleIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest Rate</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginate(filteredLoans, currentPage.loan, rowsPerPage).map((loan) => (
                                            <tr key={loan.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loan.account_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(loan.amount)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.interest_rate}%</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.start_date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.end_date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button onClick={() => handleEditTransaction(loan, 'loan')} className="text-blue-600 hover:text-blue-900">
                                                            <PencilIcon className="h-5 w-5" />
                                                        </button>
                                                        <button onClick={() => handleDeleteTransaction(loan.id, 'loan')} className="text-red-600 hover:text-red-900">
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredLoans.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No loans found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination */}
                            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-700 mr-2">Rows per page:</span>
                                    <select 
                                        value={rowsPerPage} 
                                        onChange={handleRowsPerPageChange}
                                        className="border rounded p-1 text-sm"
                                    >
                                        {[5, 10, 15, 20].map(n => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-700 mr-2">
                                        {filteredLoans.length > 0 ? 
                                            `${(currentPage.loan - 1) * rowsPerPage + 1}-${Math.min(currentPage.loan * rowsPerPage, filteredLoans.length)} of ${filteredLoans.length}` : 
                                            '0 of 0'}
                                    </span>
                                    <div className="flex space-x-1">
                                        <button
                                            disabled={currentPage.loan === 1}
                                            onClick={() => handlePageChange('loan', currentPage.loan - 1)}
                                            className={`px-3 py-1 rounded ${currentPage.loan === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                                        >
                                            Prev
                                        </button>
                                        <button
                                            disabled={currentPage.loan * rowsPerPage >= filteredLoans.length}
                                            onClick={() => handlePageChange('loan', currentPage.loan + 1)}
                                            className={`px-3 py-1 rounded ${currentPage.loan * rowsPerPage >= filteredLoans.length ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Deposits Section */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-green-800 flex items-center">
                            <CashIcon className="h-5 w-5 mr-2 text-green-500" />
                            Deposits
                        </h2>
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <input 
                                    type="text"
                                    placeholder="Search deposits..."
                                    className="pl-8 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 w-64"
                                    value={searchTextDeposit}
                                    onChange={handleSearchDeposit}
                                />
                                <SearchIcon className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                            </div>
                            <button 
                                onClick={() => handleAddTransaction('deposit')}
                                className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                            >
                                <PlusCircleIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest Rate</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deposit Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maturity Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginate(filteredDeposits, currentPage.deposit, rowsPerPage).map((deposit) => (
                                            <tr key={deposit.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{deposit.account_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(deposit.amount)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deposit.interest_rate}%</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deposit.deposit_date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deposit.maturity_date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button onClick={() => handleEditTransaction(deposit, 'deposit')} className="text-blue-600 hover:text-blue-900">
                                                            <PencilIcon className="h-5 w-5" />
                                                        </button>
                                                        <button onClick={() => handleDeleteTransaction(deposit.id, 'deposit')} className="text-red-600 hover:text-red-900">
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredDeposits.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No deposits found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination */}
                            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-700 mr-2">Rows per page:</span>
                                    <select 
                                        value={rowsPerPage} 
                                        onChange={handleRowsPerPageChange}
                                        className="border rounded p-1 text-sm"
                                    >
                                        {[5, 10, 15, 20].map(n => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-700 mr-2">
                                        {filteredDeposits.length > 0 ? 
                                            `${(currentPage.deposit - 1) * rowsPerPage + 1}-${Math.min(currentPage.deposit * rowsPerPage, filteredDeposits.length)} of ${filteredDeposits.length}` : 
                                            '0 of 0'}
                                    </span>
                                    <div className="flex space-x-1">
                                        <button
                                            disabled={currentPage.deposit === 1}
                                            onClick={() => handlePageChange('deposit', currentPage.deposit - 1)}
                                            className={`px-3 py-1 rounded ${currentPage.deposit === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                                        >
                                            Prev
                                        </button>
                                        <button
                                            disabled={currentPage.deposit * rowsPerPage >= filteredDeposits.length}
                                            onClick={() => handlePageChange('deposit', currentPage.deposit + 1)}
                                            className={`px-3 py-1 rounded ${currentPage.deposit * rowsPerPage >= filteredDeposits.length ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal for Adding or Editing Transaction */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {editMode ? 'Edit' : 'Add New'} {newTransaction.type === 'loan' ? 'Loan' : 'Deposit'}
                            </h3>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                &times;
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                                    <select 
                                        value={newTransaction.account} 
                                        onChange={(e) => setNewTransaction({ ...newTransaction, account: e.target.value })}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                    >
                                        <option value="">Select Account</option>
                                        {accounts.map(account => (
                                            <option key={account.id} value={account.id}>
                                                {account.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                    <input 
                                        type="number" 
                                        placeholder="Enter amount"
                                        value={newTransaction.amount} 
                                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
                                    <input 
                                        type="number" 
                                        placeholder="Enter interest rate"
                                        value={newTransaction.interest_rate} 
                                        onChange={(e) => setNewTransaction({ ...newTransaction, interest_rate: e.target.value })}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>
                                
                                {newTransaction.type === 'loan' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                            <input 
                                                type="date" 
                                                value={newTransaction.start_date || ''} 
                                                onChange={(e) => setNewTransaction({ ...newTransaction, start_date: e.target.value })}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                            <input 
                                                type="date" 
                                                value={newTransaction.end_date || ''} 
                                                onChange={(e) => setNewTransaction({ ...newTransaction, end_date: e.target.value })}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                            />
                                        </div>
                                    </>
                                )}
                                
                                {newTransaction.type === 'deposit' && (
                                    <>
                                                                                <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Date</label>
                                            <input 
                                                type="date" 
                                                value={newTransaction.deposit_date || ''} 
                                                onChange={(e) => setNewTransaction({ ...newTransaction, deposit_date: e.target.value })}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Maturity Date</label>
                                            <input 
                                                type="date" 
                                                value={newTransaction.maturity_date || ''} 
                                                onChange={(e) => setNewTransaction({ ...newTransaction, maturity_date: e.target.value })}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                            />
                                        </div>
                                    </>
                                )}
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveTransaction}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {editMode ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoansDepositsPage;
