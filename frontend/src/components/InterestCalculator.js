import React, { useState, useEffect } from 'react';
import axiosInstance from '../api';
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto'; 

const InterestCalculator = () => {
    const [loans, setLoans] = useState([]); 
    const [deposits, setDeposits] = useState([]); 
    const [selectedLoan, setSelectedLoan] = useState(''); 
    const [selectedDeposit, setSelectedDeposit] = useState(''); 
    const [interest, setInterest] = useState(null);
    const [principal, setPrincipal] = useState(null);
    const [rate, setRate] = useState(null); 
    const [tenure, setTenure] = useState(null); 
    const [totalPayable, setTotalPayable] = useState(null); 
    const [activeButton, setActiveButton] = useState('load');

    
    useEffect(() => {
        axiosInstance.get('/loans/')
            .then(response => {
                setLoans(response.data); 
            })
            .catch(error => {
                console.log(error);
            });

            axiosInstance.get('/deposits/')
            .then(response => {
                setDeposits(response.data); 
            })
            .catch(error => {
                console.log(error);
            });
    }, []);
    

    const handleCalculate = () => {
        if (selectedLoan) {
            axiosInstance.get(`/loans/${selectedLoan}/calculate_interest`)
                .then(response => {
                    const { interest, principal, rate, tenure, total_payable } = response.data;
                    setInterest(interest);
                    setPrincipal(principal);
                    setRate(rate);
                    setTenure(tenure);
                    setTotalPayable(total_payable);
                })
                .catch(error => {
                    console.log(error);
                });
        } else {
            alert("Please select a loan to calculate interest.");
        }
    };

    const handleCalculateDeposit = () => {
      if (selectedDeposit) {
          axiosInstance.get(`/deposits/${selectedDeposit}/calculate_interestDeposit`)
              .then(response => {
                  const { interest, principal, rate, tenure, total_payable } = response.data;
                  setInterest(interest);
                  setPrincipal(principal);
                  setRate(rate);
                  setTenure(tenure);
                  setTotalPayable(total_payable);
              })
              .catch(error => {
                  console.log(error);
              });
      } else {
          alert("Please select a deposit to calculate interest.");
      }
  };

    
    const chartData = {
        labels: ['Principal amount', 'Interest amount'],
        datasets: [
            {
                label: 'Amount',
                data: [principal, interest],
                backgroundColor: ['#4CAF50', '#2196F3'], 
                hoverBackgroundColor: ['#66BB6A', '#42A5F5']
            }
        ]
    };

    const handleButtonClick = (state) => {
      setActiveButton(state);
    };
    return (
        <div className='p-4'>
            <h4 className='d-flex justify-content-center'>Interest Calculator</h4>
            <div className="d-flex justify-content-center">
              <b style={{width:'300px'}}
                className={`btn m-2 ps-5 pe-5 ${activeButton ? 'btn-secondary' : 'btn-outline-secondary'}`} 
                role="button"
                onClick={() => handleButtonClick('load')}
              >
                Load
              </b>
              
              <b style={{width:'300px'}}
                className={`btn m-2 ps-5 pe-5 ${!activeButton ? 'btn-secondary' : 'btn-outline-secondary'}`} 
                role="button"
                onClick={() => handleButtonClick()}
              >
                Deposit
              </b>
            </div>

            <div className="row g-3 ms-5 ps-5 mt-2 mb-2">
                <div className="col-md-8">
                    <select value={activeButton? selectedLoan : selectedDeposit} className="form-control"
                            id="validationServer01" onChange={(e) =>activeButton? setSelectedLoan(e.target.value) : setSelectedDeposit(e.target.value)}>
                        <option value=""> Select Account</option>
                        {
                          activeButton?
                          loans.map((loan) => (
                            <option key={loan.id} value={loan.id}>
                                {loan.account_name}
                            </option>
                          )) :
                          deposits.map((deposit) => (
                            <option key={deposit.id} value={deposit.id}>
                                {deposit.account_name}
                            </option>
                          ))
                        }
                    </select>
                </div>
                <div className="col-md-4">
                    <button className='btn btn-outline-secondary' onClick={activeButton? handleCalculate : handleCalculateDeposit}>Calculate Interest</button>
                </div>
            </div>

            

            
            {interest !== null && (
                <div className="row mt-4">
                    <div className="col-md-6">
                        <div className="slider-section bg-white p-4 rounded-top">
                            <div>
                                {principal !== null && (
                                    <>
                                       <div className='d-flex justify-content-between'>
                                       <label>Amount Principal</label>
                                       <p>{parseFloat(principal).toLocaleString()} MRU</p>
                                       </div>
                                       
                                        <input 
                                            type="range" 
                                            min="1000" 
                                            max="500000" 
                                            value={principal} 
                                            className="form-range" 
                                            disabled 
                                        />
                                        
                                    </>
                                )}
                            </div>

                            <div>
                                
                                {rate !== null && (
                                    <>
                                       <div className='d-flex justify-content-between'>
                                        <label>Rate of interest (monthly)</label>
                                        <p>{rate}%</p>
                                       </div>
                                        <input 
                                            type="range" 
                                            min="0.1" 
                                            max="20" 
                                            step="0.1" 
                                            value={rate} 
                                            className="form-range" 
                                            disabled 
                                        />
                                        
                                    </>
                                )}
                            </div>

                            <div>
                                
                                {tenure !== null && (
                                    <>
                                    <div className='d-flex justify-content-between'>
                                      <label>Tenure</label>
                                      <p>{tenure} months</p>
                                    </div>
                                        <input 
                                            type="range" 
                                            min="1" 
                                            max="60" 
                                            value={tenure} 
                                            className="form-range" 
                                            disabled 
                                        />
                                        
                                    </>
                                )}
                            </div>
                        </div>
                      
                        {interest !== null && (
                            <div className="result-container bg-primary rounded-bottom text-white  p-2">
                            <div class="row">
                              <div class="col-6 col-md-4 ">
                                  <p className='d-flex justify-content-center'>{isNaN(parseFloat(principal)) ? '0.00' : parseFloat(principal).toFixed(2)} MRU</p>
                                  <b className='d-flex justify-content-center'>Principal</b>
                              </div>
                              <div class="col-6 col-md-4">
                                  <p className='d-flex justify-content-center'>{isNaN(parseFloat(interest)) ? '0.00' : parseFloat(interest).toFixed(2)} MRU</p>
                                  <b className='d-flex justify-content-center'>Total Interest</b>
                              </div>
                              <div class="col-6 col-md-4">
                                  <p className='d-flex justify-content-center'>{isNaN(parseFloat(totalPayable)) ? '0.00' : parseFloat(totalPayable).toFixed(2)} MRU</p>
                                  <b className='d-flex justify-content-center'>Total Payable</b>
                              </div>
                            </div>
                              
                          </div>

                        )}
                    </div>

                    <div className="col-md-6">
                        {/* عرض المخطط */}
                        <div style={{ width: '70%', margin: 'auto' }}>
                            <Doughnut data={chartData} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterestCalculator;
