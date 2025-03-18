import React, { useState ,useEffect} from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { AiFillDashboard, AiOutlineTransaction, AiOutlineAccountBook } from "react-icons/ai";
import { SiConvertio } from "react-icons/si";
import { MdAssuredWorkload } from "react-icons/md";
import { CiCalculator2 } from "react-icons/ci";
import { GrDocumentCloud, GrDocumentPerformance } from "react-icons/gr";
import { BsFillJournalBookmarkFill } from "react-icons/bs";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

const Sidebar = ({ onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };
  useEffect(() => {
    onToggle(isExpanded);
  }, [isExpanded, onToggle]);

  return (
    <div className='ts'>
    <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button className="toggle-btn toggle" onClick={toggleSidebar}>
        {isExpanded ? <FaAngleLeft /> : <FaAngleRight />}
      </button>
      <ul className='nav nav-pills flex-column mb-sm-auto mb-0' id="menu">
        <li className='nav-item'>
          <NavLink className='nav-link align-middle px-0' to="/dashboard">
            <AiFillDashboard className='Icons' />
            {isExpanded && <span className="ms-1">Dashbord</span>}
          </NavLink>
        </li>
        <li className='nav-item'>
          <NavLink className='nav-link align-middle px-0' to="/accounts">
            <AiOutlineAccountBook className='Icons' />
            {isExpanded && <span className="ms-1">Accounts</span>}
          </NavLink>
        </li>
        <li className='nav-item'>
          <NavLink className='nav-link align-middle px-0' to="/transactions">
            <AiOutlineTransaction className='Icons' />
            {isExpanded && <span className="ms-1">Transactions Agence</span>}
          </NavLink>
        </li>
        <li className='nav-item'>
          <NavLink className='nav-link align-middle px-0' to="/journal">
            <BsFillJournalBookmarkFill className='Icons' />
            {isExpanded && <span className="ms-1">Le Journal</span>}
          </NavLink>
        </li>
        <li className='nav-item'>
          <NavLink className='nav-link align-middle px-0' to="/transaction-reports">
            <GrDocumentPerformance className='Icons' />
            {isExpanded && <span className="ms-1">Transaction Reports</span>}
          </NavLink>
        </li>
        <li className='nav-item'>
          <NavLink className='nav-link align-middle px-0' to="/loans-deposits">
            <MdAssuredWorkload className='Icons' />
            {isExpanded && <span className="ms-1">Loans & Deposits</span>}
          </NavLink>
        </li>
        <li className='nav-item'>
          <NavLink className='nav-link align-middle px-0' to="/reports">
            <GrDocumentCloud className='Icons' />
            {isExpanded && <span className="ms-1">Financial Reports</span>}
          </NavLink>
        </li>
        <li className='nav-item'>
          <NavLink className='nav-link align-middle px-0' to="/currency-converter">
            <SiConvertio className='Icons' />
            {isExpanded && <span className="ms-1">Currency Converter</span>}
          </NavLink>
        </li>
        <li className='nav-item'>
          <NavLink className='nav-link align-middle px-0' to="/interest-calculator">
            <CiCalculator2 className='Icons' />
            {isExpanded && <span className="ms-1">Interest Calculator</span>}
          </NavLink>
        </li>
      </ul>
    </div>
    </div>
  );
};

export default Sidebar;

