import React, { useState, useEffect } from 'react';
import axiosInstance from './../api';
import { useParams ,useNavigate} from 'react-router-dom';

const AccountDetailPage = () => {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get(`/accounts/${id}/`)
      .then(response => {
        setAccount(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto border-4 border-t-indigo-500 border-blue-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading account details...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 max-w-md w-full bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <h2 className="mt-4 text-xl font-bold text-gray-800">Account Not Found</h2>
            <p className="mt-2 text-gray-600">We couldn't find the account you're looking for.</p>
            <button className="mt-6 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to determine account type badge color
  const getAccountTypeColor = (type) => {
    const types = {
      "Checking": "bg-green-100 text-green-800",
      "Savings": "bg-blue-100 text-blue-800",
      "Credit": "bg-purple-100 text-purple-800",
      "Investment": "bg-yellow-100 text-yellow-800"
    };
    return types[type] || "bg-gray-100 text-gray-800";
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Account Details</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAccountTypeColor(account.account_type)}`}>
                {account.account_type}
              </span>
            </div>
          </div>

          {/* Account Summary */}
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-sm text-gray-500">Account Number</p>
                <p className="text-lg font-mono font-medium">{account.account_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Balance</p>
                <p className="text-2xl font-bold text-indigo-600">{formatCurrency(account.balance)}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Account Holder</p>
              <p className="text-lg font-medium">{account.name}</p>
            </div>
          </div>

          {/* Account Details */}
          <div className="px-6 py-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Account Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Date Opened</p>
                <p className="text-md font-medium">{account.opened_date || "11/11/2024"}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Last Activity</p>
                <p className="text-md font-medium">{account.last_activity || "09/03/2025"}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Interest Rate</p>
                <p className="text-md font-medium">{account.interest_rate ? `${account.interest_rate}%` : "2.5%"}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {/* Quick Actions */}
          
            <button
                onClick={() => navigate('/accounts')}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Return to Accounts List
              </button>
            <div className="flex flex-wrap gap-3 justify-end">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                View Transactions
              </button>
              <button className="px-4 py-2 bg-indigo-500 rounded-md text-sm font-medium text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                Make Transfer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailPage;