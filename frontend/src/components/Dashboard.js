import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import axiosInstance from '../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Loader from './Loader';

ChartJS.register(ArcElement, Tooltip, Legend);


const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    let [loading, setLoading] = useState(false);
    useEffect(() => {
        setLoading(true)
        axiosInstance.get('/dashboard-data/')
            .then(
              (response) => {
                setDashboardData(response.data)
                setLoading(false)
              })
            .catch((error) => console.error('Error fetching dashboard data:', error));
    }, []);

    if (!dashboardData) {
        return <div>{loading && <Loader loading={loading}/>}</div>;
    }

    // Check if total_balances_by_type exists before using map
    const accountTypeLabels = dashboardData.account_balances_by_type ? dashboardData.account_balances_by_type.map(item => item.account_type) : [];
    const accountTypeData = dashboardData.account_balances_by_type ? dashboardData.account_balances_by_type.map(item => item.total_balance) : [];
    const colors = ['#36a2eb', '#ff6384', '#ffce56', '#4bc0c0', '#9966ff']; // ألوان مخصصة لكل نوع حساب

    const totalBalance = accountTypeData.reduce((a, b) => a + b, 0);

    // Data for the credit/debit chart
    const creditDebitData = {
        labels: ['Credit', 'Debit'],
        datasets: [
            {
                label: 'Credit vs Debit',
                data: [dashboardData.transactions.total_credit, dashboardData.transactions.total_debit],
                backgroundColor: ['#4e73df', '#1cc88a'],
                hoverBackgroundColor: ['#2e59d9', '#17a673'],
                borderWidth: 1,
            },
        ],
    };

    const accountTypeChartData = {
        labels: accountTypeLabels,
        datasets: accountTypeData.map((value, index) => ({
            data: [value, totalBalance - value], // جزء الحساب والنسبة المتبقية
            backgroundColor: [colors[index], '#f0f0f0'], // لون الحساب و جزء فارغ
            hoverBackgroundColor: [colors[index], '#f0f0f0'],
            borderWidth: 10,
            borderRadius: 10,
            cutout: '50%', // للتحكم في حجم الدائرة الداخلية
        }))
    };
    
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      circumference: 290,  // رسم نصف الدائرة
      rotation: 0,  // بدء الرسم من الأعلى
      plugins: {
          tooltip: {
              callbacks: {
                  label: function (tooltipItem) {
                      const value = accountTypeData[tooltipItem.dataIndex];
                      const percentage = ((value / totalBalance) * 100).toFixed(2);
                      return `${tooltipItem.label}: ${value} (${percentage}%)`;
                  },
              },
          },
          legend: {
              display: false, // Hides the legend to customize
          },
      },
  };

    return (
        <div className='ps-2 pe-2 bg-white'>
            <h4 className='d-flex justify-content-center mb-2'>Dashboard</h4>

            <div className='d-flex justify-content-between'>
               <div  style={{ width: 32 +'%'}}>
                  <h5>Credit vs Debit</h5>
                  <hr />
                 {/* Doughnut chart for Credit/Debit */}
                    <div style={{ width: '200px', margin: 'auto' }}>
                    
                    <Doughnut data={creditDebitData} />
                </div>
               </div>

               <div  style={{width: 32 +'%'}} >
                {/* Top 3 Loans */}
                 <div className='card border-0' style={{width: 21 +'rem'}}>
                  <div className='card-header bg-white' style={{height:'40px'}}><h5>Top 3 Loans</h5></div>
                  
                  
                    {dashboardData.top_loans && dashboardData.top_loans.length > 0 ? (
                      <ul className='list-group list-group-flush'>
                          {dashboardData.top_loans.map((loan, index) => (
                              <li key={index} className={`list-group-item  d-flex justify-content-between border-3 border-top-0  border-bottom-0  border-primary mb-1 bg-light-subtle ${index%2===0 ? "border-end-0" : "border-start-0"}`} style={{height:'30px'}}>
                                
                                  <b>{loan.account}</b> 
                                  <b>{loan.amount} MRU</b> 
                              
                              </li>
                          ))}
                      </ul>
                    ) : (
                        <p>No loan data available</p>
                    )}
                    </div>

                  {/* Top 3 Deposits */}
                  <div className='card border-0' style={{width: 21 +'rem'}}>
                  <div className='card-header bg-white' style={{height:'40px'}}><h5>Top 3 Deposits</h5></div>
                  
                  
                    {dashboardData.top_deposits && dashboardData.top_deposits.length > 0 ? (
                      <ul className='list-group list-group-flush'>
                          {dashboardData.top_deposits.map((deposit, index) => (
                              <li key={index} className={`list-group-item  d-flex justify-content-between border-3 border-top-0  border-bottom-0  border-warning mb-1 bg-light-subtle ${index%2===0 ? "border-end-0" : "border-start-0"}`} style={{height:'30px'}}>
                              <b>{deposit.account}</b>
                              <b>{deposit.amount} MRU</b>
                              </li>
                          ))}
                      </ul>
                    ) : (
                        <p>No deposit data available</p>
                    )}
                  </div>
                  
               </div>
               {/* Doughnut chart for Account Types */}
               <div style={{ width: '32%'}}>
               <h5>Account Types</h5>
               <hr />
               <div className='d-flex' style={{ height:'240px'}} >
               <div className='SCCT'  >
                    {accountTypeLabels.map((label, index) => {
                      const percentage = ((accountTypeData[index] / totalBalance) * 100).toFixed(2);
                        return(
                        <div key={index} style={{ color: colors[index], fontWeight: 'bold' }}>
                            {label}: {accountTypeData[index]} MRU
                            <span> ({percentage}%)</span>
                        </div>
                        )
                    })}
                </div>
                <div className='ms-5'>
                <Doughnut data={accountTypeChartData} options={options} />
                </div>
                
                </div>
               
               </div>
            </div>

            <div className='d-flex justify-content-between mt-4'>
               <div  style={{ width: 32 +'%'}}>
                  <h5>Top 5 Accounts</h5>
                  <hr />
                  <table className='table table-sm table-striped  border-start border-primary border border-3 border-top-0 border-end-0 border-bottom-0 ' >
                        {dashboardData.top_account && dashboardData.top_account.length > 0 ? (
                          <tbody className='border border-light-subtle'>
                              {dashboardData.top_account.slice(0, 5).map((account, index) => (
                                  <tr key={index}>
                                  <td className='d-flex justify-content-between'>
                                    <b>{account.name}</b> 
                                    <b>{account.balance} MRU</b> 
                                  </td>
                                  
                                  </tr>
                              ))}
                          </tbody>
                      ) : (
                          <p>No credit transactions available</p>
                      )}
                  </table>
                  
                </div>
                <div  style={{ width: 33 +'%'}}>
                  <h5>Top 5 Credits</h5>
                  <hr />
                  <table className="table table-sm table-striped border-start-0 border-warning border border-3 border-top-0 border-end-0 border-bottom ">
                    {dashboardData.top_credit && dashboardData.top_credit.length > 0 ? (
                      <tbody className='border border-light-subtle'>
                          {dashboardData.top_credit.slice(0, 5).map((transaction, index) => (
                              <tr key={index}>
                              <td className='d-flex justify-content-between'>
                                <b>{transaction.account}</b> 
                                <b>{transaction.amount} MRU</b> 
                                <b>{new Date(transaction.date).toLocaleDateString()}</b>
                              </td>
                              
                              </tr>
                          ))}
                        </tbody>
                  ) : (
                      <p>No credit transactions available</p>
                  )}
                    
                    
                  </table>
                  
                </div>
                <div  style={{ width: 32 +'%'}}>
                  <h5>Top 5 Debits</h5>
                  <hr />
                  <table class="table table-sm table-striped  border-start-0 border-primary border border-3 border-top-0 border-end border-bottom-0 ">
                      {dashboardData.top_debit && dashboardData.top_debit.length > 0 ? (
                        <tbody className='border border-light-subtle'>
                            {dashboardData.top_debit.slice(0, 5).map((transaction, index) => (
                                <tr key={index}>
                                <td className='d-flex justify-content-between'>
                                  <b>{transaction.account}</b> 
                                  <b>{transaction.amount} MRU</b> 
                                  <b>{new Date(transaction.date).toLocaleDateString()}</b>
                              </td>
                                </tr>
                            ))}
                        </tbody>
                    ) : (
                        <p>No debit transactions available</p>
                    )}
                  </table>
                  
                </div>
            </div>
            
            
        </div>
    );
};

export default Dashboard;
