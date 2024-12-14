import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api';
import { useNavigate } from "react-router-dom";
import { IoIosAddCircle } from "react-icons/io";
import DataTable from 'react-data-table-component';
import './AccountsPage.css';
import Loader from './../../components/Loader';

const AccountsPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [filteredAccounts, setFilteredAccounts] = useState([]); // To store filtered accounts
    const [searchText, setSearchText] = useState(''); // To store the search text
    let [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
       setLoading(true)
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');  
        } else {
            axiosInstance.get('/accounts/')
                .then(response => {
                  setLoading(false)
                  setAccounts(response.data);
                  setFilteredAccounts(response.data); // Set initial filtered data
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }, [navigate]);

    // Define columns for DataTable
    const columns = [
        {
            name: 'Account Number',
            selector: row => row.account_number,
            sortable: true,
        },
        {
            name: 'Account Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Account Type',
            selector: row => row.account_type,
            sortable: true,
        },
        {
            name: 'Balance',
            selector: row => row.balance,
            sortable: true,
            right: true,
        },
    ];

    // Handle search functionality
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

    return (
        <div>
           
            <div className='d-flex justify-content-sm-between ms-4 me-4 mb-4 mt-2'>
              <h2>Accounts</h2>
              <div>
              <input style={{width:'400px'}}
                    type="text"
                    placeholder="Search Accounts"
                    className="form-control mt-2"
                    value={searchText}
                    onChange={handleSearch}
                />
              </div>
              <IoIosAddCircle className='add mt-1' onClick={() => navigate('/new-account')}/>
            </div>
            
            
            <div className="ms-2">
            
                <DataTable
                    columns={columns}
                    data={filteredAccounts} // Display filtered data
                    pagination
                    highlightOnHover
                    striped
                    paginationRowsPerPageOptions={[7, 10, 15, 20]} 
                    paginationPerPage={7}
                />
                {loading && <Loader loading={loading}/>}
            </div>
        </div>
    );
};

export default AccountsPage;
