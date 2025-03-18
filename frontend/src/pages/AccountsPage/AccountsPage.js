import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api';
import { useNavigate } from "react-router-dom";
import { IoIosAddCircle } from "react-icons/io";
import { FiSearch } from "react-icons/fi";
import { MdManageAccounts } from "react-icons/md";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import DataTable from 'react-data-table-component';
import Loader from './../../components/Loader';

const AccountsPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [filteredAccounts, setFilteredAccounts] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');  
        } else {
            axiosInstance.get('/accounts/')
                .then(response => {
                    setLoading(false);
                    setAccounts(response.data);
                    setFilteredAccounts(response.data);
                })
                .catch(error => {
                    console.error(error);
                    setLoading(false);
                });
        }
    }, [navigate]);

    const handleSearch = (event) => {
        const value = event.target.value;
        setSearchText(value);

        const filteredData = accounts.filter(account =>
            account.account_number.toLowerCase().includes(value.toLowerCase()) ||
            account.name.toLowerCase().includes(value.toLowerCase()) ||
            account.account_type.toLowerCase().includes(value.toLowerCase()) ||
            account.balance.toString().includes(value)
        );

        setFilteredAccounts(filteredData);
    };

    // Custom formatting functions
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };
    
    const formatAccountNumber = (number) => {
        // Format like XXX-XXXX-XXXX (assuming account numbers have enough digits)
        if (number.length >= 10) {
            return `${number.substring(0, 3)}-${number.substring(3, 7)}-${number.substring(7)}`;
        }
        return number;
    };

    // Define columns for DataTable
    const columns = [
        {
            name: 'Account Number',
            selector: row => row.account_number,
            sortable: true,
            cell: row => (
                <div className="font-medium text-gray-800">{formatAccountNumber(row.account_number)}</div>
            ),
        },
        {
            name: 'Account Name',
            selector: row => row.name,
            sortable: true,
            cell: row => (
                <div className="font-medium">{row.name}</div>
            ),
        },
        {
            name: 'Account Type',
            selector: row => row.account_type,
            sortable: true,
            cell: row => (
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {row.account_type}
                </div>
            ),
        },
        {
            name: 'Balance',
            selector: row => row.balance,
            sortable: true,
            right: true,
            cell: row => (
                <div className={`font-bold ${row.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(row.balance)}
                </div>
            ),
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="flex space-x-2">
                    <button 
                        className="p-1 bg-indigo-100 rounded hover:bg-indigo-200 text-indigo-700"
                        onClick={() => navigate(`/account/${row.id}`)}
                    >
                        View
                    </button>
                    <button 
                        className="p-1 bg-emerald-100 rounded hover:bg-emerald-200 text-emerald-700"
                        onClick={() => navigate(`/edit-account/${row.id}`)}
                    >
                        Edit
                    </button>
                </div>
            ),
            button: true,
        },
    ];

    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem 0.5rem 0 0',
                borderBottom: '1px solid #e5e7eb',
            },
        },
        headCells: {
            style: {
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                paddingLeft: '16px',
                paddingRight: '16px',
            },
        },
        rows: {
            style: {
                fontSize: '0.875rem',
                minHeight: '56px',
                borderBottom: '1px solid #f3f4f6',
                '&:hover': {
                    backgroundColor: '#f9fafb',
                },
            },
        },
        cells: {
            style: {
                paddingLeft: '16px',
                paddingRight: '16px',
            },
        },
        pagination: {
            style: {
                borderRadius: '0 0 0.5rem 0.5rem',
                borderTop: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
            },
        },
    };

    return (
        <div className="max-w-7xl mx-auto p-2 md:p-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center  sm:mb-0">
                            <MdManageAccounts className="text-3xl text-indigo-600" />
                            <div className="ml-2 mt-1">
                                <h2 className="text-2xl font-bold text-gray-800">Accounts</h2>
                                <p className="text-sm text-gray-500">Manage your accounts</p>
                            </div>
                    </div>
                
                        
                        <div className="relative w-full sm:max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by account number, name, type, or balance"
                                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                value={searchText}
                                onChange={handleSearch}
                            />
                        </div>
                        
                        <button 
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() => navigate('/new-account')}
                        >
                            <IoIosAddCircle className="text-xl mr-2" />
                            Add Account
                        </button>
                    </div>
                </div>
                
                <div className="p-2 md:p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader loading={loading} />
                        </div>
                    ) : (
                        <>
                            <DataTable
                                columns={columns}
                                data={filteredAccounts}
                                pagination
                                highlightOnHover
                                customStyles={customStyles}
                                paginationRowsPerPageOptions={[5,7, 10, 15, 20]} 
                                paginationPerPage={5}
                                noDataComponent={
                                    <div className="p-6 text-center text-gray-500">
                                        No accounts found
                                    </div>
                                }
                                sortIcon={<FaSort />}
                                sortIconUp={<FaSortUp />}
                                sortIconDown={<FaSortDown />}
                            />
                            
                            <div className="mt-4 p-4 rounded-md bg-gray-50">
                                <div className="flex flex-wrap justify-between items-center gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Showing {filteredAccounts.length} of {accounts.length} accounts
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm text-gray-600">
                                            Total Accounts: <span className="font-bold">{accounts.length}</span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Total Balance: <span className="font-bold text-emerald-600">
                                            {formatCurrency(accounts.length > 0 ? accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0) : 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountsPage;