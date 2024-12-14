import React, { useState, useEffect } from 'react';
import axiosInstance from '../api';
import { IoIosAddCircle } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import DataTable from 'react-data-table-component';
import Loader from './../components/Loader';
const JournalEntryList = () => {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredEntries, setFilteredEntries] = useState([]);
    let [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true)
    // جلب البيانات من الـ backend
    axiosInstance.get('/journal-entries/')
      .then(response => {
        setLoading(false)
        setEntries(response.data);
        setFilteredEntries(response.data);
      })
      .catch(error => console.error(error));
  }, []);

    // Define columns for DataTable
    const columns = [
      {
          name: 'Date',
          selector: row => row.date,
          sortable: true,
      },
      {
          name: 'Description',
          selector: row => row.description,
          sortable: true,
      },
      {
          name: 'Debit Account',
          selector: row => row.debit_account,
          sortable: true,
      },
      {
          name: 'debit_amount',
          selector: row => row.debit_amount,
          sortable: true,
      },
      {
        name: 'Credit Account',
        selector: row => row.credit_account,
        sortable: true,
    },
    {
        name: 'credit_amount',
        selector: row => row.credit_amount,
        sortable: true,
        right: true,
    },
  ];

  // دالة البحث
  const handleSearch = (event) => {
    const value = event.target.value;
    setSearch(value);

    const filteredData = entries.filter(entrie =>
        entrie.date.toLowerCase().includes(value.toLowerCase()) ||
        entrie.description.toLowerCase().includes(value.toLowerCase()) ||
        entrie.debit_account.toLowerCase().includes(value.toLowerCase()) ||
        entrie.debit_amount.toString().includes(value) ||
        entrie.credit_account.toLowerCase().includes(value.toLowerCase()) ||
        entrie.credit_amount.toString().includes(value)
    );

    setFilteredEntries(filteredData);
  };
  return (
    <div className="">
      <div className='d-flex justify-content-sm-between ms-4 me-4 mb-4 mt-2'>
          <h2>Le Journal</h2>
          <div>
            <input style={{width:'400px'}}
              type="text"
              className="form-control mb-3"
              placeholder="Search..."
              value={search}
              onChange={handleSearch}
            />
          </div>
          <IoIosAddCircle className='add mt-1 text-primary' onClick={() => navigate('/add-journal')} style={{ cursor: 'pointer', fontSize: '35px' }}/>
        </div>

        <div className="ms-2">
            
                <DataTable
                    columns={columns}
                    data={filteredEntries} // Display filtered data
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

export default JournalEntryList;
