import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import axiosInstance from '../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Loader from './Loader';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/dashboard-data/')
      .then((response) => {
        setDashboardData(response.data);
        setLoading(false);
      })
      .catch((error) => console.error('Error fetching dashboard data:', error));
  }, []);

  if (!dashboardData) {
    return <div className="flex justify-center items-center h-screen">{loading && <Loader loading={loading} />}</div>;
  }

  // Account type data
  const accountTypeLabels = dashboardData.account_balances_by_type?.map(item => item.account_type) || [];
  const accountTypeData = dashboardData.account_balances_by_type?.map(item => item.total_balance) || [];
  const colors = ['#36a2eb', '#ff6384', '#ffce56', '#4bc0c0', '#9966ff'];
  const totalBalance = accountTypeData.reduce((a, b) => a + b, 0);

  // Credit/Debit chart data
  const creditDebitData = {
    labels: ['Credit', 'Debit'],
    datasets: [
      {
        label: 'Credit vs Debit',
        data: [dashboardData.transactions.total_credit, dashboardData.transactions.total_debit],
        backgroundColor: ['#4e73df', '#1cc88a'],
        hoverBackgroundColor: ['#2e59d9', '#17a673'],
        borderWidth: 0,
      },
    ],
  };

  // Account type chart data
  const accountTypeChartData = {
    labels: accountTypeLabels,
    datasets: [{
      data: accountTypeData,
      backgroundColor: colors.slice(0, accountTypeLabels.length),
      hoverBackgroundColor: colors.slice(0, accountTypeLabels.length),
      borderWidth: 0,
    }]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      },
    },
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credit vs Debit Section */}
        <div className="bg-white rounded-lg shadow-md p-4 h-full">
          <h3 className="text-lg font-bold text-indigo-800 mb-2">Credit vs Debit</h3>
          <div className="border-b border-gray-200 mb-4"></div>
          <div className="h-64 flex items-center justify-center">
            <div className="w-48">
              <Doughnut data={creditDebitData} options={{ maintainAspectRatio: true }} />
            </div>
          </div>
        </div>

        {/* Loans and Deposits Section */}
        <div className="bg-white rounded-lg shadow-md p-4 h-full">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-indigo-800 mb-2">Top 3 Loans</h3>
            <div className="border-b border-gray-200 mb-4"></div>
            {dashboardData.top_loans && dashboardData.top_loans.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {dashboardData.top_loans.map((loan, index) => (
                  <li key={index} className="py-2 flex justify-between items-center">
                    <span className="font-semibold">{loan.account}</span>
                    <span className="font-semibold text-indigo-700">{loan.amount} MRU</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No loan data available</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-indigo-800 mb-2">Top 3 Deposits</h3>
            <div className="border-b border-gray-200 mb-4"></div>
            {dashboardData.top_deposits && dashboardData.top_deposits.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {dashboardData.top_deposits.map((deposit, index) => (
                  <li key={index} className="py-2 flex justify-between items-center">
                    <span className="font-semibold">{deposit.account}</span>
                    <span className="font-semibold text-amber-600">{deposit.amount} MRU</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No deposit data available</p>
            )}
          </div>
        </div>

        {/* Account Types Section */}
        <div className="bg-white rounded-lg shadow-md p-4 h-full">
          <h3 className="text-lg font-bold text-indigo-800 mb-2">Account Types</h3>
          <div className="border-b border-gray-200 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-64">
              <Doughnut data={accountTypeChartData} options={options} />
            </div>
            <div className="flex flex-col justify-center space-y-2">
              {accountTypeLabels.map((label, index) => {
                const percentage = ((accountTypeData[index] / totalBalance) * 100).toFixed(2);
                return (
                  <div key={index} className="flex items-center">
                    <div className="w-4 h-4 mr-2" style={{ backgroundColor: colors[index] }}></div>
                    <span className="text-sm">{label}: <span className="font-semibold">{accountTypeData[index]} MRU</span> <span className="text-gray-600 text-xs">({percentage}%)</span></span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Top Accounts */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-bold text-indigo-800 mb-2">Top 5 Accounts</h3>
          <div className="border-b border-gray-200 mb-4"></div>
          {dashboardData.top_account && dashboardData.top_account.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-100">
                  {dashboardData.top_account.slice(0, 5).map((account, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="py-3 pl-4">
                        <div className="flex justify-between">
                          <span className="font-medium">{account.name}</span>
                          <span className="font-medium text-indigo-700">{account.balance} MRU</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">No account data available</p>
          )}
        </div>

        {/* Top Credits */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-bold text-indigo-800 mb-2">Top 5 Credits</h3>
          <div className="border-b border-gray-200 mb-4"></div>
          {dashboardData.top_credit && dashboardData.top_credit.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-100">
                  {dashboardData.top_credit.slice(0, 5).map((transaction, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="py-3 pl-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{transaction.account}</span>
                          <span className="font-medium text-green-600">{transaction.amount} MRU</span>
                          <span className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">No credit transactions available</p>
          )}
        </div>

        {/* Top Debits */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-bold text-indigo-800 mb-2">Top 5 Debits</h3>
          <div className="border-b border-gray-200 mb-4"></div>
          {dashboardData.top_debit && dashboardData.top_debit.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-100">
                  {dashboardData.top_debit.slice(0, 5).map((transaction, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="py-3 pl-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{transaction.account}</span>
                          <span className="font-medium text-red-600">{transaction.amount} MRU</span>
                          <span className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">No debit transactions available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;