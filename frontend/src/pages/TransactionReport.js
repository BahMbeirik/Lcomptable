import React, { useState, useEffect } from 'react';
import axiosInstance from '../api';
import DataTable from 'react-data-table-component';

const TransactionReport = () => {
    const [report, setReport] = useState({ credits: [], debits: [], total_credit: 0, total_debit: 0 });
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filtered, setFiltered] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = () => {
        setLoading(true);
        const params = {};
        if (startDate) {
            params.start_date = startDate;
        }
        if (endDate) {
            params.end_date = endDate;
        }

        axiosInstance.get('/transaction-report/', { params })
            .then(response => {
                const data = response.data || { credits: [], debits: [], total_credit: 0, total_debit: 0 };
                setReport(data);
                setFiltered(true);
                setLoading(false);
            })
            .catch(error => {
                console.log(error);
                setFiltered(true);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchTransactions();
    }, [startDate, endDate]);

    const creditColumns = [
        {
            name: 'Account',
            selector: row => row.account || 'N/A',
            sortable: true,
        },
        {
            name: 'Amount',
            selector: row => row.amount || 0,
            sortable: true,
            cell: row => (
                <div className="font-medium text-emerald-600">
                    ${parseFloat(row.amount).toFixed(2)}
                </div>
            ),
        },
        {
            name: 'Date',
            selector: row => row.date ? new Date(row.date).toLocaleDateString() : 'N/A',
            sortable: true,
        },
    ];

    const debitColumns = [
        {
            name: 'Account',
            selector: row => row.account || 'N/A',
            sortable: true,
        },
        {
            name: 'Amount',
            selector: row => row.amount || 0,
            sortable: true,
            cell: row => (
                <div className="font-medium text-rose-600">
                    ${parseFloat(row.amount).toFixed(2)}
                </div>
            ),
        },
        {
            name: 'Date',
            selector: row => row.date ? new Date(row.date).toLocaleDateString() : 'N/A',
            sortable: true,
        },
    ];

    const customStyles = {
        headCells: {
            style: {
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#f1f5f9',
                paddingTop: '12px',
                paddingBottom: '12px',
            },
        },
        rows: {
            style: {
                minHeight: '56px',
                fontSize: '0.875rem',
            },
        },
    };

    return (
        <div className="p-6 max-w-7xl mx-auto bg-white rounded-xl shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 py-3">
                            <h3 className="text-lg font-bold text-center text-white">Credits</h3>
                        </div>
                        {Array.isArray(report.credits) && report.credits.length > 0 ? (
                            <div className="overflow-hidden">
                                <DataTable
                                    columns={creditColumns}
                                    data={report.credits} 
                                    pagination
                                    highlightOnHover
                                    customStyles={customStyles}
                                    paginationRowsPerPageOptions={[5, 10, 15, 20]} 
                                    paginationPerPage={5}
                                />
                            </div>
                        ) : (
                            <div className="py-10 text-center text-gray-500">No credit transactions found.</div>
                        )}
                        <div className="bg-gray-50 py-3 px-4 border-t">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Total Credits:</span>
                                <span className="text-lg font-bold text-emerald-600">${parseFloat(report.total_credit).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="bg-gradient-to-r from-rose-500 to-rose-600 py-3">
                            <h3 className="text-lg font-bold text-center text-white">Debits</h3>
                        </div>
                        {Array.isArray(report.debits) && report.debits.length > 0 ? (
                            <div className="overflow-hidden">
                                <DataTable
                                    columns={debitColumns}
                                    data={report.debits} 
                                    pagination
                                    highlightOnHover
                                    customStyles={customStyles}
                                    paginationRowsPerPageOptions={[5, 10, 15, 20]} 
                                    paginationPerPage={5}
                                />
                            </div>
                        ) : (
                            <div className="py-10 text-center text-gray-500">No debit transactions found.</div>
                        )}
                        <div className="bg-gray-50 py-3 px-4 border-t">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Total Debits:</span>
                                <span className="text-lg font-bold text-rose-600">${parseFloat(report.total_debit).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {filtered && !loading && Array.isArray(report.credits) && Array.isArray(report.debits) && 
             report.credits.length === 0 && report.debits.length === 0 && (
                <div className="mt-6 p-4 border border-yellow-300 bg-yellow-50 rounded-md text-center text-yellow-800">
                    No transactions found between the selected dates.
                </div>
            )}

            <div className="mt-6 bg-gray-50 p-3 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                    <div>
                        <span className="block text-sm text-gray-500">Net Balance</span>
                        <span className={`text-xl font-bold ${parseFloat(report.total_credit - report.total_debit) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            ${parseFloat(report.total_credit - report.total_debit).toFixed(2)}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="block text-sm text-gray-500">Last Updated</span>
                        <span className="text-gray-700">{new Date().toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionReport;