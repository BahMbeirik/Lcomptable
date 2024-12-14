import React, { useState, useEffect } from 'react';
import axiosInstance from '../api';
import { CiExport } from "react-icons/ci";
import {PDFExport} from '@progress/kendo-react-pdf'
const FinancialReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const ref = React.createRef();
  
  useEffect(() => {
    // Fetch report data from API
    const fetchReport = async () => {
      try {
        const response = await axiosInstance.get('/financial-report/');
        console.log(response.data); // Log the response data for debugging
        setReport(response.data);
      } catch (err) {
        console.log(err); // Log the error for debugging
        setError('Error fetching financial report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  // Ensure that the report object is not null and contains the required keys
  if (!report || !report.accounts || !report.transactions || !report.loans || !report.deposits) {
    return <p>Invalid data received from the server</p>;
  }

  return (
    <div className='p-2' >
      <PDFExport paperSize="A4" margin="0.5cm" ref={ref} fileName='Finacial_Report'>
      <div className='d-flex justify-content-between'>
        <h4 className='d-flex justify-content-center'>Financial Report</h4>
        <CiExport className='text-success' style={{fontSize: '30px'}} onClick={() => {
          if (ref.current){
            ref.current.save();
          }
        }} role='button'/>
      </div>
      <section>
        <div className='bg-secondary text-white mb-1'><b className='d-flex justify-content-center p-1' >Accounts</b></div>
        
        <div class="card border-0" style={{width: 100 + '%'}}>
      <div class="card-header bg-dark-subtle">
        <b>Total Balances by Account Type</b>
      </div>
      <ul className="list-group list-group-flush">
          {report.total_balances_by_type.map((balance, index) => (
            <li className='list-group-item' key={index}>
              <div className='d-flex justify-content-between'>
                <b><strong>{balance.account_type}</strong> </b>
                <span>Total Balance : <b>{balance.total_balance} MRU</b></span>
              </div>
            </li>
          ))}
        </ul>
        <div class="card-footer bg-body-secondary text-primary-emphasis">
        <div className='d-flex justify-content-between'>
          <b><strong>Total Balance of All Accounts</strong></b>
          <b> {report.total_balances} MRU</b>
        </div>
        </div>
        </div>
        
      </section>

      <section>
        <div className='bg-secondary text-white mb-1'><b className='d-flex justify-content-center mt-1 p-1' >Transactions</b></div>
        <div className='d-flex justify-content-between'>
        <table class="table" style={{width: 49 + '%'}}>
          <thead class="bg-dark-subtle ">
            <th>Credits</th>
            
          </thead>
          <tbody className='bg-white'>
            <td className='d-flex justify-content-between'>
              <b>Total Credit </b>
              <b>{report.transactions.total_credit} MRU</b></td>
          </tbody>
                
        </table>
        

        <table class="table" style={{width: 49 + '%'}}>
          <thead class="bg-dark-subtle ">
            <th>Debits</th>
            
          </thead>
          <tbody className='bg-white'>
            <td className='d-flex justify-content-between'>
              <b>Total Debit </b>
              <b>{report.transactions.total_debit} MRU</b></td>
          </tbody>
                
        </table>
        </div>
      
      </section>

      <section>
      <div className='bg-secondary text-white mb-1'><b className='d-flex justify-content-center p-1' >Loans & Deposits</b></div>
        <div className='d-flex justify-content-between'>
        <table class="table" style={{width: 49 + '%'}}>
          <thead class="bg-dark-subtle ">
            <th>Loans</th>
            
          </thead>
          <tbody className='bg-white'>
            <tr>
            <td className='d-flex justify-content-between'>
              <b>Total Loans Amount</b>
              <b>{report.loans.total_loan_amount} MRU</b>
            </td>
            <td className='d-flex justify-content-between'>
              <b>Total Interest</b>
              <b>{report.loans.total_interest} MRU</b>
            </td>
            </tr>
          </tbody>
                
        </table>
        

        <table class="table" style={{width: 49 + '%'}}>
          <thead class="bg-dark-subtle ">
            <th>Deposits</th>
            
          </thead>
          <tbody className='bg-white'>
          <tr>
            <td className='d-flex justify-content-between'>
              <b>Total Deposits Amount</b>
              <b>{report.deposits.total_deposit_amount} MRU</b>
            </td>
            <td className='d-flex justify-content-between'>
              <b>Total Interest</b>
              <b>{report.deposits.total_interestDeposit} MRU</b>
            </td>
            </tr>
          </tbody>
                
        </table>
        </div>
      
      </section>
      </PDFExport>
      
    </div>
  );
};

export default FinancialReport;
