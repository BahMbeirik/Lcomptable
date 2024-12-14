import React, { useState, useEffect } from 'react';
import axiosInstance from '../api';
import { IoIosAddCircle } from "react-icons/io";
import { Modal, Button, Form } from 'react-bootstrap';
import { MdEdit ,MdOutlineDelete } from "react-icons/md";
import DataTable from 'react-data-table-component';
import Loader from './../components/Loader';
import { toast } from 'react-toastify';
const LoansDepositsPage = () => {
    const [loans, setLoans] = useState([]);
    const [deposits, setDeposits] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [newTransaction, setNewTransaction] = useState({ type: 'loan', amount: '', interest_rate: '', account: '' });
    let [loading, setLoading] = useState(false);
    const [totalLoans, setTotalLoans] = useState(0);
    const [totalDeposits, setTotalDeposits] = useState(0);

    const [filteredLoans, setFilteredLoans] = useState([]); // To store filtered accounts
    const [searchTextLoan, setSearchTextLoan] = useState(''); // To store the search text

    const [filteredDeposits, setFilteredDeposits] = useState([]); // To store filtered accounts
    const [searchTextDeposit, setSearchTextDeposit] = useState(''); // To store the search text

    useEffect(() => {
      setLoading(true)
        // جلب القروض
        axiosInstance.get('/loans/')
            .then(response => {
                setLoans(response.data);
                calculateTotal(response.data, 'loan');
                setFilteredLoans(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.log(error);
            });

        // جلب الودائع
        axiosInstance.get('/deposits/')
            .then(response => {
                setDeposits(response.data);
                calculateTotal(response.data, 'deposit');
                setFilteredDeposits(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.log(error);
            });

        // جلب الحسابات
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
      console.log('Editing transaction:', transaction);
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
                        toast.success("A new loan has been Updated!")
                    } else {
                        setLoans([...loans, response.data]);
                        calculateTotal([...loans, response.data], 'loan');
                        toast.success("A new loan has been created!")
                    }
                } else {
                    if (editMode) {
                        const updatedDeposits = deposits.map(deposit => deposit.id === selectedTransaction.id ? response.data : deposit);
                        setDeposits(updatedDeposits);
                        calculateTotal(updatedDeposits, 'deposit');
                        toast.success("A new deposit has been Updated!")
                    } else {
                        setDeposits([...deposits, response.data]);
                        calculateTotal([...deposits, response.data], 'deposit');
                        toast.success("A new deposit has been created!")
                    }
                }
                setShowModal(false);
            })
            .catch(error => {
                console.error('Error:', error.response ? error.response.data : error.message);
                alert('An error occurred. Please check the console for details.');
            });
    };

    const handleDeleteTransaction = (id, type) => {
        const deleteUrl = type === 'loan' ? `/loans/${id}` : `/deposits/${id}`;
        axiosInstance.delete(deleteUrl)
            .then(() => {
                if (type === 'loan') {
                    const updatedLoans = loans.filter(loan => loan.id !== id);
                    setLoans(updatedLoans);
                    calculateTotal(updatedLoans, 'loan');
                    toast.success("A loan has been deleted!")
                } else {
                    const updatedDeposits = deposits.filter(deposit => deposit.id !== id);
                    setDeposits(updatedDeposits);
                    calculateTotal(updatedDeposits, 'deposit');
                    toast.success("A deposit has been deleted!")
                }
            })
            .catch(error => {
                console.log(error);
            });
    };

    // Define columns for DataTable
    const columnsLoan = [
      {
          name: 'Account',
          selector: row => row.account_name,
          sortable: true,
      },
      {
          name: 'Amount',
          selector: row => row.amount,
          sortable: true,
      },
      {
          name: 'Interest Rate',
          selector: row => row.interest_rate,
          sortable: true,
      },
      {
          name: 'Start Date',
          selector: row => row.start_date,
          sortable: true,
      },
      {
        name: 'End Date',
        selector: row => row.end_date,
        sortable: true,
      },
      {
        name: 'Actions',
        cell: (row) => (
            <div className='d-flex'>
              <p className='me-1 text-primary ' role="button" onClick={() => handleEditTransaction(row)}><MdEdit /></p>
              <p className='ms-1 text-danger' role="button" onClick={() => handleDeleteTransaction(row.id)}><MdOutlineDelete /></p>
            </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
    },
  ];

  const columnsDeposit = [
    {
        name: 'Account',
        selector: row => row.account_name,
        sortable: true,
    },
    {
        name: 'Amount',
        selector: row => row.amount,
        sortable: true,
    },
    {
        name: 'Interest Rate',
        selector: row => row.interest_rate,
        sortable: true,
    },
    {
        name: 'Deposit Date',
        selector: row => row.deposit_date,
        sortable: true,
    },
    {
      name: 'Maturity Date',
      selector: row => row.maturity_date,
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
          <div className='d-flex'>
          <p className='me-1 text-primary ' role="button" onClick={() => handleEditTransaction(row)}><MdEdit className=''/></p>
          <p className='ms-1 text-danger' role="button" onClick={() => handleDeleteTransaction(row.id)}><MdOutlineDelete /></p>
          </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
  },
  ];

  // Handle search functionality
    const handleSearchLoan = (event) => {
      const value = event.target.value;
      setSearchTextLoan(value);

      const filteredData = loans.filter(loan =>
          loan.interest_rate.toLowerCase().includes(value.toLowerCase()) ||
          loan.start_date.toLowerCase().includes(value.toLowerCase()) ||
          loan.amount.toString().includes(value) ||
          loan.end_date.toLowerCase().includes(value.toLowerCase()) ||
          loan.account_name.toLowerCase().includes(value.toLowerCase())
      );

      setFilteredLoans(filteredData);
    };
    const handleSearchDeposit = (event) => {
      const value = event.target.value;
      setSearchTextDeposit(value);

      const filteredData = deposits.filter(deposit =>
          deposit.interest_rate.toLowerCase().includes(value.toLowerCase()) ||
          deposit.deposit_date.toLowerCase().includes(value.toLowerCase()) ||
          deposit.amount.toString().includes(value) ||
          deposit.maturity_date.toLowerCase().includes(value.toLowerCase()) ||
          deposit.account_name.toLowerCase().includes(value.toLowerCase())
      );

      setFilteredDeposits(filteredData);
    };
    return (
        <div >
            <h3 className='d-flex justify-content-center mb-4'>Loans and Deposits</h3>
            
            <div className='d-flex justify-content-between' >
                <div className="card" style={{ width: '88vh' }}>
                    <div className="card-header d-flex justify-content-between">
                        <b className='mt-1'>Loans</b>
                        <div>
                          <input style={{height: '30px' ,width: '300px'}}
                              type="text"
                              placeholder="Search Loans"
                              className="form-control"
                              value={searchTextLoan}
                              onChange={handleSearchLoan}
                          />
                        </div>
                        <IoIosAddCircle className='mt-1 text-primary' role='button' onClick={() => handleAddTransaction('loan')} style={{fontSize: '27px'}}/>
                    </div>
                    <DataTable
                        columns={columnsLoan}
                        data={filteredLoans} // Display filtered data
                        pagination
                        highlightOnHover
                        striped
                        paginationRowsPerPageOptions={[5, 10, 15, 20]} 
                        paginationPerPage={5}
                    />
                    {loading && <Loader loading={loading}/>}
                    <div className="card-footer ">
                        <b className='d-flex justify-content-end'>TOTAL: {totalLoans}</b>
                    </div>
                </div>

                <div className="card" style={{ width: '88vh' }}>
                    <div className="card-header d-flex justify-content-between">
                        <b className='mt-1'>Deposits</b>
                        <div>
                          <input style={{height: '30px' ,width: '300px'}}
                              type="text"
                              placeholder="Search Deposits"
                              className="form-control"
                              value={searchTextDeposit}
                              onChange={handleSearchDeposit}
                          />
                        </div>
                        <IoIosAddCircle className='mt-1 text-primary' role='button' onClick={() => handleAddTransaction('deposit')} style={{fontSize: '27px'}}/>
                    </div>
                    <DataTable
                        columns={columnsDeposit}
                        data={filteredDeposits} // Display filtered data
                        pagination
                        highlightOnHover
                        striped
                        paginationRowsPerPageOptions={[5, 10, 15, 20]} 
                        paginationPerPage={5}
                    />
                    {loading && <Loader loading={loading}/>}
                    <div className="card-footer">
                        <b className='d-flex justify-content-end'>TOTAL: {totalDeposits}</b>
                    </div>
                </div>
            </div>

            {/* Modal for Adding or Editing Transaction */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{editMode ? 'Edit' : 'Add New'} {newTransaction.type === 'loan' ? 'Loan' : 'Deposit'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formAccount">
                            <Form.Label>Account</Form.Label>
                            <Form.Control as="select" value={newTransaction.account} onChange={(e) => setNewTransaction({ ...newTransaction, account: e.target.value })}>
                                <option value="">Select Account</option>
                                {accounts.map(account => (
                                    <option key={account.id} value={account.id}>
                                        {account.name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formAmount">
                            <Form.Label>Amount</Form.Label>
                            <Form.Control type="number" placeholder="Enter amount" value={newTransaction.amount} onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })} />
                        </Form.Group>
                        <Form.Group controlId="formInterestRate">
                            <Form.Label>Interest Rate (%)</Form.Label>
                            <Form.Control type="number" placeholder="Enter interest rate" value={newTransaction.interest_rate} onChange={(e) => setNewTransaction({ ...newTransaction, interest_rate: e.target.value })} />
                        </Form.Group>
                        {newTransaction.type === 'loan' && (
                            <>
                                <Form.Group controlId="formStartDate">
                                    <Form.Label>Start Date</Form.Label>
                                    <Form.Control type="date" value={newTransaction.start_date} onChange={(e) => setNewTransaction({ ...newTransaction, start_date: e.target.value })} />
                                </Form.Group>
                                <Form.Group controlId="formEndDate">
                                    <Form.Label>End Date</Form.Label>
                                    <Form.Control type="date" value={newTransaction.end_date} onChange={(e) => setNewTransaction({ ...newTransaction, end_date: e.target.value })} />
                                </Form.Group>
                            </>
                        )}
                        {newTransaction.type === 'deposit' && (
                            <>
                                <Form.Group controlId="formDepositDate">
                                    <Form.Label>Deposit Date</Form.Label>
                                    <Form.Control type="date" value={newTransaction.deposit_date} onChange={(e) => setNewTransaction({ ...newTransaction, deposit_date: e.target.value })} />
                                </Form.Group>
                                <Form.Group controlId="formMaturityDate">
                                    <Form.Label>Maturity Date</Form.Label>
                                    <Form.Control type="date" value={newTransaction.maturity_date} onChange={(e) => setNewTransaction({ ...newTransaction, maturity_date: e.target.value })} />
                                </Form.Group>
                            </>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleSaveTransaction}>
                        {editMode ? 'Save Changes' : 'Add Transaction'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default LoansDepositsPage;
