import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DollarSign } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CgProfile } from "react-icons/cg";

const Navbar = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Vérifier l'état de connexion au chargement du composant
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <div>
      <nav className="bg-white  fixed top-0 left-0 w-full z-50 rounded-b-3xl"> 
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <DollarSign className="text-white" size={24} />
            </div>
            <a href="/" ><h1 className="text-xl font-bold text-indigo-800 ml-3">Système Comptable Bancaire</h1></a>
          </div>

          <div className="flex items-center">
            {!isLoggedIn ? (
              <>
                <a href="/login" className="ml-4">
                  <button className="px-4 py-2 text-indigo-600 font-medium hover:text-indigo-800">
                    Se connecter
                  </button>
                </a>
                <a href="/register" className="ml-4">
                <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                  Essai gratuit
                </button>
                </a>
              </>
            ) : (
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    onClick={toggleUserMenu}
                    className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    id="user-menu-button"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    <CgProfile className="h-8 w-8 text-indigo-600" />
                      
                  </button>
                </div>

                {isUserMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabIndex="-1"
                  >
                    <a
                      href="/profil"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      tabIndex="-1"
                    >
                      Mon profil
                    </a>
                    <a
                      href="/parametres"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      tabIndex="-1"
                    >
                      Paramètres
                    </a>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      role="menuitem"
                      tabIndex="-1"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
      <ToastContainer />
    </div>
  );
};

export default Navbar;