import React, { useState, useEffect } from 'react';
import axiosInstance from '../api';
import DataTable from 'react-data-table-component';

const TransactionReport = () => {
    const [report, setReport] = useState({ credits: [], debits: [], total_credit: 0, total_debit: 0 });
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filtered, setFiltered] = useState(false);

    const fetchTransactions = () => {
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
            })
            .catch(error => {
                console.log(error);
                setFiltered(true);
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
        },
        {
            name: 'Date',
            selector: row => row.date ? new Date(row.date).toLocaleDateString() : 'N/A',
            sortable: true,
        },
    ];

    return (
        <div className='p-2'>
            <h3 className='d-flex justify-content-center'>Transaction Report</h3>
            <div className='d-flex justify-content-center  mb-1'>
                <div className='me-2 col-md-4'>
                    <label className='form-label'>Start Date </label>
                    <input 
                    className='form-control'
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                    />
                </div>
                <div className='ms-2 col-md-4'>
                    <label className='form-label'>End Date </label>
                    <input 
                        className='form-control'
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                    />
                </div>
            </div>

            <div className='d-flex justify-content-between'>
                <div className='w-50 p-1'>
                    <div className='bg-secondary text-white mb-1'>
                        <b className='d-flex justify-content-center p-2'>Credit</b>
                    </div>
                    {Array.isArray(report.credits) && report.credits.length > 0 ? (
                        <DataTable
                            columns={creditColumns}
                            data={report.credits} 
                            pagination
                            highlightOnHover
                            striped
                            paginationRowsPerPageOptions={[5, 10, 15, 20]} 
                            paginationPerPage={5}
                        />
                    ) : (
                        <p className="text-center">No credit transactions found.</p>
                    )}
                    <div className='d-flex justify-content-center bg-white border border-dark-subtle rounded mt-2'>
                        <h5 className='pt-2'>TOTAL: {report.total_credit}</h5>
                    </div>
                </div>

                <div className='w-50 p-1'>
                    <div className='bg-secondary text-white mb-1'>
                        <b className='d-flex justify-content-center p-2'>Debit</b>
                    </div>
                    {Array.isArray(report.debits) && report.debits.length > 0 ? (
                        <DataTable
                            columns={debitColumns}
                            data={report.debits} 
                            pagination
                            highlightOnHover
                            striped
                            paginationRowsPerPageOptions={[5, 10, 15, 20]} 
                            paginationPerPage={5}
                        />
                    ) : (
                        <p className="text-center">No debit transactions found.</p>
                    )}
                    <div className='d-flex justify-content-center bg-white border border-dark-subtle rounded mt-2'>
                        <h5 className='pt-2'>TOTAL: {report.total_debit}</h5>
                    </div>
                </div>
            </div>

            {filtered && Array.isArray(report.credits) && Array.isArray(report.debits) && report.credits.length === 0 && report.debits.length === 0 && (
                <p className="text-center text-danger mt-4">No transactions found between the selected dates.</p>
            )}
        </div>
    );
};

export default TransactionReport;
