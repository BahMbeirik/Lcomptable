import React, { useState } from 'react';
import axiosInstance from '../../api';
import './CurrencyConverter.css'
import { FcCurrencyExchange } from "react-icons/fc";
const CurrencyConverter = () => {
    const [fromCurrency, setFromCurrency] = useState('MRU');
    const [toCurrency, setToCurrency] = useState('USD');
    const [amount, setAmount] = useState('');
    const [convertedAmount, setConvertedAmount] = useState(null);

    const handleConvert = () => {
        axiosInstance.get(`/convert/${fromCurrency}/${toCurrency}/${amount}`)
            .then(response => {
                setConvertedAmount(response.data.converted_amount);
            })
            .catch(error => {
                console.log(error);
            });
    };

    return (
        <div >
            <div className="counvert rounded-top">
              <h1 className='d-flex justify-content-center text-white pt-5'>Currency Converter</h1>
            </div>
            <div class="card  dcard">
              <div class="card-header d-flex justify-content-center border-0">
                <b className='text-primary SC'> <FcCurrencyExchange /> Convert</b>
              </div>
              <div className="row g-3 p-5">
              <div class="col-md-4">
                <label for="validationServer01" class="form-label"><b>Amount</b></label>
                <input min="0"
                  type="number"
                  className="form-control "
                  id="validationServer01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                />
              </div>
              <div class="col-md-4">
                  <label for="validationServer01" class="form-label"><b>From</b></label>
                  <select value={fromCurrency} className="form-control "
                        id="validationServer01" onChange={(e) => setFromCurrency(e.target.value)}>
                      <option value="MRU">MRU</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="SAR">SAR</option>
                      {/* أضف المزيد من العملات حسب الحاجة */}
                  </select>
              </div>
              <div class="col-md-4">
                <label for="validationServer01" class="form-label"><b>To</b></label>
                <select value={toCurrency} className="form-control "
                  id="validationServer01" onChange={(e) => setToCurrency(e.target.value)}>
                  <option value="MRU">MRU</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="SAR">SAR</option>
                  {/* أضف المزيد من العملات حسب الحاجة */}
                </select>
              </div>
            
              {convertedAmount && <b>Converted Amount: {convertedAmount} {toCurrency}</b>}
              <button className='btn btn-outline-primary btn-sm' onClick={handleConvert}>Convert</button>
            
            </div>
          </div>
            
        </div>
    );
};

export default CurrencyConverter;
