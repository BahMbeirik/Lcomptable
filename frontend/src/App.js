// App.js
import {useState} from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AccountsPage from './pages/AccountsPage/AccountsPage';
import TransactionsPage from './pages/TransactionsPage';
import NewAccountForm from './components/NewAccountForm';
import FinancialReport from './pages/ReportsPage';
import TransactionReport from './pages/TransactionReport'
import CurrencyConverter from './components/CurrencyConverter/CurrencyConverter';
import LoansDepositsPage from './pages/LoansDepositsPage';
import InterestCalculator from './components/InterestCalculator';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Sidebar from './components/Sidebar/Sidebar';
import Navbar from './components/Navbar/Navbar';
import Dashboard from './components/Dashboard'
import AuthPage from './pages/AuthPage'
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import JournalEntryList from './pages/Journal';
import AddJournalEntry from './pages/addJournal'
function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const handleSidebarToggle = (expanded) => {
    setIsSidebarExpanded(expanded);
  };

  return (
    <Router>
      <>
        <Routes>
          {/* صفحات بدون sidebar و navbar */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path='/auth' element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password-confirm" element={<ResetPassword />} />
          {/* صفحات مع sidebar و navbar */}
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <div className={`main-container ${isSidebarExpanded ? '' : 'sidebar-collapsed'}`}>
                  <div className='sidebar-wrapper'>
                    <Sidebar onToggle={handleSidebarToggle} />
                  </div>
                  <div className='content-wrapper'>
                  <Routes >
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/accounts" element={<AccountsPage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/new-account" element={<NewAccountForm />} />
                    <Route path="/reports" element={<FinancialReport />} />
                    <Route path="/transaction-reports" element={<TransactionReport />} />
                    <Route path="/currency-converter" element={<CurrencyConverter />} />
                    <Route path="/loans-deposits" element={<LoansDepositsPage isSidebarMinimized={isSidebarExpanded.isMinimized} />} />
                    <Route path="/interest-calculator" element={<InterestCalculator />} />
                    <Route path="/journal" element={<JournalEntryList />} />
                    <Route path="/add-journal" element={<AddJournalEntry />} />
                  </Routes>
                  </div>
                </div>
              </>
            }
          />
        </Routes>
      </>
    </Router>
  );
}

export default App;