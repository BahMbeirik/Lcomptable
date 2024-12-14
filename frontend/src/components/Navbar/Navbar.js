import React from 'react';
import './Navbar.css';
import { useNavigate ,Link } from 'react-router-dom';
import { IoIosLogOut } from "react-icons/io";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/login'); 
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg mainav">
        <div className="container-fluid d-flex justify-content-between">
          <Link className="navbar-brand" to="/"> <svg className="w-32" fill="none" height="100%" viewBox="0 0 312 80" width="100%" 
          xmlns="http://www.w3.org/2000/svg">
          <path d="M33.78 0H44.22V43.8H25.8L11.22 8.88H10.32V43.8H0V0H18.3L32.88 34.92H33.78V0ZM81.74 33.36C81.26 35.6 80.31 37.6 78.89 39.36C77.47 41.12 75.67 42.5 73.49 43.5C71.31 44.5 68.8 45 65.96 45C63.12 45 60.68 44.52 58.52 43.56C56.36 42.6 54.54 41.3 53.06 39.66C51.58 38.02 50.45 36.18 49.67 34.14C48.89 32.1 48.5 30 48.5 27.84V26.64C48.5 24.4 48.89 22.25 49.67 20.19C50.45 18.13 51.57 16.3 53.03 14.7C54.49 13.1 56.28 11.83 58.4 10.89C60.52 9.95 62.92 9.48 65.6 9.48C69.16 9.48 72.18 10.28 74.66 11.88C77.14 13.48 79.04 15.59 80.36 18.21C81.68 20.83 82.34 23.68 82.34 26.76V30.24H58.85C58.98 30.89 59.14 31.51 59.36 32.07C59.88 33.41 60.68 34.44 61.76 35.16C62.84 35.88 64.24 36.24 65.96 36.24C67.48 36.24 68.73 35.98 69.71 35.46C70.69 34.94 71.38 34.24 71.78 33.36H81.74ZM59.42 22.23C59.16 22.86 58.96 23.57 58.82 24.36H72.06C71.94 23.58 71.75 22.87 71.51 22.23C71.01 20.93 70.27 19.94 69.29 19.26C68.31 18.58 67.08 18.24 65.6 18.24C64.12 18.24 62.91 18.57 61.85 19.23C60.79 19.89 59.98 20.89 59.42 22.23ZM116.74 10.68H105.7L100.66 21.54H99.7L94.36 10.68H82.6L91.53 26.92L82.3 43.8H93.34L99.34 32.22H100.3L106.78 43.8H118.54L108.4 26.86L116.74 10.68ZM142.98 18.6V10.68H133.9L133.92 2.04H123.84L123.82 10.68H118.98V18.6H123.8L123.78 30.3C123.78 33.78 124.26 36.54 125.22 38.58C126.18 40.62 127.73 42.08 129.87 42.96C132.01 43.84 134.88 44.28 138.48 44.28H142.98V35.16H138.42C136.94 35.16 135.81 34.77 135.03 33.99C134.25 33.21 133.86 32.08 133.86 30.6L133.89 18.6H142.99H142.98Z" fill="#1453F3"></path><path d="M0 56.9H16.26V59.54H9.6V78.8H6.66V59.54H0V56.9Z" fill="#60646C"></path><path d="M33.2 68.99H42.29V66.35H33.2V59.54H42.92V56.9H33.2H32.6H30.26V78.8H32.6H33.2H43.22V76.16H33.2V68.99Z" fill="#60646C"></path><path d="M72.97 75.23C71.69 76.17 70.11 76.64 68.23 76.64C66.89 76.64 65.72 76.41 64.72 75.93C63.72 75.46 62.89 74.82 62.22 74C61.55 73.18 61.05 72.24 60.72 71.18C60.39 70.12 60.22 69 60.22 67.82C60.22 66.58 60.39 65.43 60.72 64.37C61.05 63.31 61.54 62.38 62.19 61.57C62.84 60.76 63.65 60.13 64.64 59.68C65.62 59.23 66.76 59.01 68.06 59.01C69.26 59.01 70.35 59.21 71.31 59.61C72.28 60.01 73.09 60.62 73.73 61.43C74.37 62.24 74.77 63.26 74.93 64.5H77.93C77.75 62.84 77.25 61.4 76.43 60.18C75.61 58.96 74.5 58.01 73.1 57.33C71.7 56.65 70.02 56.31 68.06 56.31C66.1 56.31 64.49 56.64 63.11 57.3C61.73 57.96 60.61 58.83 59.75 59.91C58.89 60.99 58.25 62.19 57.84 63.51C57.43 64.83 57.22 66.15 57.22 67.47V68.13C57.22 69.35 57.42 70.62 57.82 71.93C58.22 73.24 58.85 74.45 59.71 75.57C60.57 76.69 61.71 77.6 63.12 78.3C64.53 79 66.23 79.35 68.24 79.35C70.25 79.35 72.01 78.98 73.44 78.24C74.87 77.5 75.99 76.51 76.8 75.27C77.61 74.03 78.12 72.66 78.31 71.16H75.31C75.03 72.94 74.25 74.3 72.97 75.24V75.23Z" fill="#60646C"></path><path d="M107.13 66.59H95.25V56.9H92.31V78.8H95.25V69.23H107.13V78.8H110.07V56.9H107.13V66.59Z" fill="#60646C"></path><path d="M140.36 76.16H140L128.87 56.9H124.07V78.8H126.83V59.54H127.19L138.32 78.8H143.18V56.9H140.36V76.16Z" fill="#60646C"></path><path d="M179.11 63.53C178.65 62.21 177.95 61.01 177.01 59.92C176.07 58.83 174.89 57.95 173.49 57.3C172.08 56.64 170.41 56.31 168.49 56.31C166.57 56.31 164.91 56.64 163.49 57.3C162.08 57.96 160.91 58.84 159.96 59.92C159.01 61 158.32 62.21 157.86 63.53C157.4 64.85 157.17 66.16 157.17 67.46V68.12C157.17 69.32 157.4 70.57 157.85 71.87C158.3 73.17 158.98 74.39 159.9 75.53C160.82 76.67 161.99 77.59 163.41 78.29C164.83 78.99 166.52 79.34 168.48 79.34C170.44 79.34 172.13 78.99 173.55 78.29C174.97 77.59 176.14 76.67 177.06 75.53C177.98 74.39 178.66 73.17 179.11 71.87C179.56 70.57 179.78 69.32 179.78 68.12V67.46C179.78 66.16 179.55 64.85 179.09 63.53H179.11ZM176.23 71.13C175.85 72.18 175.3 73.12 174.58 73.95C173.86 74.78 172.98 75.44 171.96 75.92C170.93 76.4 169.77 76.64 168.5 76.64C167.23 76.64 166.06 76.4 165.04 75.92C164.01 75.44 163.13 74.79 162.42 73.95C161.7 73.12 161.15 72.18 160.77 71.13C160.39 70.08 160.2 68.98 160.2 67.82C160.2 66.6 160.39 65.46 160.77 64.4C161.15 63.34 161.7 62.4 162.42 61.59C163.14 60.78 164.01 60.15 165.04 59.69C166.07 59.23 167.22 59 168.5 59C169.78 59 170.93 59.23 171.96 59.69C172.99 60.15 173.87 60.78 174.58 61.59C175.29 62.4 175.85 63.34 176.23 64.4C176.61 65.46 176.8 66.6 176.8 67.82C176.8 69.04 176.61 70.09 176.23 71.13Z" fill="#60646C"></path><path d="M196.74 56.9H193.8V78.8H196.14H196.74H206.16V76.16H196.74V56.9Z" fill="#60646C"></path><path d="M242.09 63.53C241.63 62.21 240.93 61.01 239.99 59.92C239.05 58.83 237.87 57.95 236.47 57.3C235.06 56.64 233.39 56.31 231.47 56.31C229.55 56.31 227.89 56.64 226.47 57.3C225.06 57.96 223.89 58.84 222.94 59.92C221.99 61 221.3 62.21 220.84 63.53C220.38 64.85 220.15 66.16 220.15 67.46V68.12C220.15 69.32 220.38 70.57 220.83 71.87C221.28 73.17 221.96 74.39 222.88 75.53C223.8 76.67 224.97 77.59 226.39 78.29C227.81 78.99 229.5 79.34 231.46 79.34C233.42 79.34 235.11 78.99 236.53 78.29C237.95 77.59 239.12 76.67 240.04 75.53C240.96 74.39 241.64 73.17 242.09 71.87C242.54 70.57 242.76 69.32 242.76 68.12V67.46C242.76 66.16 242.53 64.85 242.07 63.53H242.09ZM239.21 71.13C238.83 72.18 238.28 73.12 237.56 73.95C236.84 74.78 235.96 75.44 234.94 75.92C233.91 76.4 232.75 76.64 231.48 76.64C230.21 76.64 229.04 76.4 228.02 75.92C226.99 75.44 226.11 74.79 225.4 73.95C224.68 73.12 224.13 72.18 223.75 71.13C223.37 70.08 223.18 68.98 223.18 67.82C223.18 66.6 223.37 65.46 223.75 64.4C224.13 63.34 224.68 62.4 225.4 61.59C226.12 60.78 226.99 60.15 228.02 59.69C229.05 59.23 230.2 59 231.48 59C232.76 59 233.91 59.23 234.94 59.69C235.97 60.15 236.85 60.78 237.56 61.59C238.27 62.4 238.83 63.34 239.21 64.4C239.59 65.46 239.78 66.6 239.78 67.82C239.78 69.04 239.59 70.09 239.21 71.13Z" fill="#60646C"></path><path d="M267.28 70.64H274.39V74.32C273.87 74.83 273.26 75.28 272.55 75.66C271.26 76.35 269.76 76.69 268.06 76.69C266.86 76.69 265.75 76.5 264.74 76.12C263.73 75.74 262.86 75.17 262.12 74.42C261.38 73.67 260.81 72.73 260.4 71.6C259.99 70.47 259.78 69.16 259.78 67.66C259.78 66.34 259.97 65.15 260.35 64.09C260.73 63.03 261.27 62.12 261.96 61.36C262.65 60.6 263.47 60.02 264.43 59.61C265.39 59.2 266.44 59 267.58 59C268.72 59 269.74 59.21 270.71 59.61C271.68 60.02 272.5 60.63 273.15 61.44C273.81 62.25 274.21 63.27 274.35 64.48H277.35C277.21 62.86 276.71 61.44 275.85 60.21C274.99 58.98 273.85 58.02 272.43 57.33C271.01 56.64 269.39 56.29 267.57 56.29C265.89 56.29 264.38 56.6 263.04 57.21C261.7 57.82 260.56 58.65 259.63 59.7C258.7 60.75 257.99 61.93 257.5 63.24C257.01 64.55 256.76 65.91 256.76 67.3V67.96C256.76 69.6 257.03 71.12 257.57 72.5C258.11 73.89 258.87 75.1 259.86 76.12C260.85 77.14 262.03 77.93 263.41 78.49C264.79 79.05 266.33 79.33 268.03 79.33C270.03 79.33 271.8 78.97 273.34 78.25C274.88 77.53 276.14 76.53 277.12 75.25V70.63H278.98V68.17H267.25V70.63L267.28 70.64Z" fill="#60646C"></path><path d="M311.55 56.9H308.67L303.31 68.03H301.78L296.07 56.9H293.01L299.97 70.28H301.05V78.8H303.93V70.28H305.01L311.55 56.9Z" fill="#60646C"></path></svg></Link>
          <IoIosLogOut className='logout' onClick={handleLogout}/>
        </div>
      </nav>
      <ToastContainer />
    </div>
  );
};

export default Navbar;
