import React, { useState, useEffect } from 'react';
import axiosInstance from '../api';
import { IoIosAddCircle } from "react-icons/io";
import { FiSearch, FiEdit, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import DataTable from 'react-data-table-component';
import Loader from './../components/Loader';
import { LuImport } from "react-icons/lu";
import { toast } from 'react-toastify';
import { HiOutlineDocumentText, HiOutlineInformationCircle, HiOutlineDownload, HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
const JournalEntryList = () => {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showImportGuide, setShowImportGuide] = useState(false);
  const [activeSection, setActiveSection] = useState('format');
  const navigate = useNavigate();


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    axiosInstance.get('/journal-entries/')
      .then(response => {
        setLoading(false);
        setEntries(response.data);
        setFilteredEntries(response.data);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('file', file);
  
    setLoading(true);
    axiosInstance.post('/import-csv/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(response => {
      setLoading(false);
      toast.success("CSV imported Successful!");
      fetchData(); // Refresh the data after import
    })
    .catch(error => {
      setLoading(false);
      if (error.response && error.response.data.error) {
        toast.error("Error importing CSV!");
        console.error('Error importing CSV:', error.response.data.error);
      } else {
        toast.error("Error importing CSV!");
        console.error('Error importing CSV:', error.message);
      }
    });
  };

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };
  
  

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Define columns for DataTable
  const columns = [
    {
      name: 'Date',
      selector: row => row.date,
      sortable: true,
      cell: row => (
        <div className="font-medium text-gray-800">
          {formatDate(row.date)}
        </div>
      ),
    },
    {
      name: 'Description',
      selector: row => row.description,
      sortable: true,
      cell: row => (
        <div className="max-w-sm truncate">
          {row.description}
        </div>
      ),
    },
    {
      name: 'Débit - Compte',
      selector: row => row.debit_account,
      sortable: true,
      cell: row => (
        <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
          {row.debit_account}
        </div>
      ),
    },
    {
      name: 'Montant Débit',
      selector: row => row.debit_amount,
      sortable: true,
      right: true,
      cell: row => (
        <div className="font-medium text-gray-900">
          {formatCurrency(row.debit_amount)}
        </div>
      ),
    },
    {
      name: 'Crédit - Compte',
      selector: row => row.credit_account,
      sortable: true,
      cell: row => (
        <div className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 whitespace-nowrap">
          {row.credit_account}
        </div>
      ),
    },
    {
      name: 'Montant Crédit',
      selector: row => row.credit_amount,
      sortable: true,
      right: true,
      cell: row => (
        <div className="font-medium text-gray-900">
          {formatCurrency(row.credit_amount)}
        </div>
      ),
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/view-journal/${row.id}`)}
            className="p-1 rounded-full hover:bg-gray-100"
            title="View Details"
          >
            <FiEye className="text-blue-600 w-5 h-5" />
          </button>
          <button
            onClick={() => navigate(`/edit-journal/${row.id}`)}
            className="p-1 rounded-full hover:bg-gray-100"
            title="Edit Entry"
          >
            <FiEdit className="text-indigo-600 w-5 h-5" />
          </button>
        </div>
      ),
      button: true,
      width: '100px',
    },
  ];

  // Search function
  const handleSearch = (event) => {
    const value = event.target.value;
    setSearch(value);

    const filteredData = entries.filter(entry =>
      (entry.date && entry.date.toLowerCase().includes(value.toLowerCase())) ||
      (entry.description && entry.description.toLowerCase().includes(value.toLowerCase())) ||
      (entry.debit_account && entry.debit_account.toLowerCase().includes(value.toLowerCase())) ||
      (entry.debit_amount && entry.debit_amount.toString().includes(value)) ||
      (entry.credit_account && entry.credit_account.toLowerCase().includes(value.toLowerCase())) ||
      (entry.credit_amount && entry.credit_amount.toString().includes(value))
    );

    setFilteredEntries(filteredData);
  };

  // Custom styles for DataTable
  const customStyles = {
    header: {
      style: {
        minHeight: '56px',
        padding: '16px',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f9fafb',
        borderRadius: '8px 8px 0 0',
        borderBottom: '1px solid #e5e7eb',
      },
    },
    headCells: {
      style: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
    rows: {
      style: {
        fontSize: '0.875rem',
        minHeight: '56px',
        backgroundColor: 'white',
        borderBottom: '1px solid #f3f4f6',
        '&:hover': {
          backgroundColor: '#f9fafb',
        },
      },
    },
    cells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
    pagination: {
      style: {
        borderRadius: '0 0 8px 8px',
        backgroundColor: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
      },
    },
  };

  // Get total amounts
  const totalDebit = filteredEntries.reduce((sum, entry) => sum + parseFloat(entry.debit_amount || 0), 0);
  const totalCredit = filteredEntries.reduce((sum, entry) => sum + parseFloat(entry.credit_amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-b border-gray-200">
          
        <div className="flex items-center sm:mb-0">
            <HiOutlineDocumentText className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">Le Journal</h1>
          </div>
          
          
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Rechercher dans le journal..."
                value={search}
                onChange={handleSearch}
              />
              
            </div>
            <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
              id="csvUpload"
            />
            <button 
              onClick={() => setShowImportGuide(!showImportGuide)}
              className="cursor-pointer flex items-center px-3 py-2 border rounded-lg text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
            >
              <HiOutlineInformationCircle className="h-5 w-5 mr-1" /> Aide CSV
            </button>

            <label htmlFor="csvUpload" className="cursor-pointer flex items-center px-4 py-2 border rounded-lg shadow-sm text-sm font-medium bg-gray-200 hover:bg-gray-300">
              <LuImport className="h-5 w-5 mr-2" /> Importer CSV
            </label>

            <button
              onClick={() => navigate('/add-journal')}
              className="inline-flex items-center px-4 py-2 border rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <IoIosAddCircle className="h-5 w-5 mr-2" /> Nouvelle Écriture
            </button>
          </div>
        
            
            
          
        </div>

        <div className="px-4 py-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader loading={loading} />
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={filteredEntries}
                pagination
                highlightOnHover
                customStyles={customStyles}
                paginationRowsPerPageOptions={[5,7, 10, 15, 20]} 
                paginationPerPage={5}
                noDataComponent={
                  <div className="p-6 text-center text-gray-500">
                    Aucune écriture trouvée
                  </div>
                }
              />
              
              <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Nombre d'écritures</p>
                    <p className="text-xl font-bold text-indigo-700">{filteredEntries.length}</p>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Total Débit</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(totalDebit)}</p>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Total Crédit</p>
                    <p className="text-xl font-bold text-indigo-600">{formatCurrency(totalCredit)}</p>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-500 flex justify-between items-center">
                  <span>
                    Affichage de {filteredEntries.length} sur {entries.length} écritures
                  </span>
                  <span className={totalDebit === totalCredit ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {totalDebit === totalCredit ? "Journal équilibré" : "Journal déséquilibré"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Guide d'importation CSV */}
        {showImportGuide && (
          <div className="bg-white border-b border-gray-200">
            <div className="p-4">
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="p-4">
                  <p className="text-gray-600 mb-4">
                    Pour importer vos écritures comptables, veuillez suivre les instructions ci-dessous concernant le format du fichier CSV.
                  </p>
                  
                  {/* Format requis */}
                  <div className="border border-gray-200 rounded-lg mb-4">
                    <button
                      className="w-full flex justify-between items-center p-4 text-left font-medium text-gray-700 hover:bg-gray-50"
                      onClick={() => toggleSection('format')}
                    >
                      <span>1. Format requis du fichier CSV</span>
                      {activeSection === 'format' ? 
                        <HiOutlineChevronUp className="w-5 h-5 text-gray-500" /> : 
                        <HiOutlineChevronDown className="w-5 h-5 text-gray-500" />
                      }
                    </button>
                    
                    {activeSection === 'format' && (
                      <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <p className="mb-3">Votre fichier CSV doit contenir les colonnes suivantes (dans cet ordre exact) :</p>
                        <div className="overflow-x-auto mb-3">
                          <table className="min-w-full bg-white border border-gray-200">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="py-2 px-3 border-b border-r text-xs font-medium text-gray-600">date</th>
                                <th className="py-2 px-3 border-b border-r text-xs font-medium text-gray-600">description</th>
                                <th className="py-2 px-3 border-b border-r text-xs font-medium text-gray-600">debit_account</th>
                                <th className="py-2 px-3 border-b border-r text-xs font-medium text-gray-600">debit_amount</th>
                                <th className="py-2 px-3 border-b border-r text-xs font-medium text-gray-600">credit_account</th>
                                <th className="py-2 px-3 border-b text-xs font-medium text-gray-600">credit_amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="py-2 px-3 border-b border-r text-xs">2025-03-15</td>
                                <td className="py-2 px-3 border-b border-r text-xs">Achat fournitures</td>
                                <td className="py-2 px-3 border-b border-r text-xs">bahah</td>
                                <td className="py-2 px-3 border-b border-r text-xs">150.00</td>
                                <td className="py-2 px-3 border-b border-r text-xs">Ali</td>
                                <td className="py-2 px-3 border-b text-xs">150.00</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-md text-xs text-blue-700">
                          <div className="flex">
                            <HiOutlineInformationCircle className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium mb-1">Formats acceptés :</p>
                              <ul className="list-disc pl-5 space-y-1">
                                <li>Date : <span className="font-mono">YYYY-MM-DD</span> (ex: 2025-03-15)</li>
                                <li>Montants : Utiliser le point comme séparateur décimal (ex: 150.00)</li>
                                <li>Comptes : Numéros du plan comptable sans espaces ni tirets</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Règles d'équilibrage */}
                  <div className="border border-gray-200 rounded-lg mb-4">
                    <button
                      className="w-full flex justify-between items-center p-4 text-left font-medium text-gray-700 hover:bg-gray-50"
                      onClick={() => toggleSection('rules')}
                    >
                      <span>2. Règles d'équilibrage</span>
                      {activeSection === 'rules' ? 
                        <HiOutlineChevronUp className="w-5 h-5 text-gray-500" /> : 
                        <HiOutlineChevronDown className="w-5 h-5 text-gray-500" />
                      }
                    </button>
                    
                    {activeSection === 'rules' && (
                      <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <p className="mb-3">Chaque ligne importée doit respecter les règles comptables suivantes :</p>
                        <ul className="list-disc pl-5 space-y-2 mb-3">
                          <li>Les montants débit et crédit doivent être égaux pour chaque écriture</li>
                          <li>Les comptes débit et crédit doivent être des numéros valides selon votre plan comptable</li>
                          <li>Une description est obligatoire pour chaque écriture</li>
                          <li>Les dates doivent être valides et au format correct</li>
                        </ul>
                        <div className="bg-yellow-50 p-3 rounded-md text-xs text-yellow-700">
                          <div className="flex">
                            <HiOutlineInformationCircle className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                            <p>
                              <span className="font-medium">Attention :</span> Les écritures non équilibrées ou avec des erreurs ne seront pas importées. Le système vous indiquera les lignes problématiques.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Exemple et modèle */}
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      className="w-full flex justify-between items-center p-4 text-left font-medium text-gray-700 hover:bg-gray-50"
                      onClick={() => toggleSection('example')}
                    >
                      <span>3. Exemple et modèle</span>
                      {activeSection === 'example' ? 
                        <HiOutlineChevronUp className="w-5 h-5 text-gray-500" /> : 
                        <HiOutlineChevronDown className="w-5 h-5 text-gray-500" />
                      }
                    </button>
                    
                    {activeSection === 'example' && (
                      <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <p className="mb-3">Pour vous aider à démarrer, voici un exemple de contenu CSV valide :</p>
                        
                        <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto mb-4 text-gray-700">
                            date;description;debit_account;debit_amount;credit_account;credit_amount
                            2025-03-10;Vente marchandises;Sara;120.00;Med;120.00
                            2025-03-12;Paiement loyer;Sidi;800.00;Cheikh;800.00
                        </pre>
                        
                        <div className="flex justify-center mb-3">
                          <button className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition text-sm">
                            <HiOutlineDownload className="h-4 w-4 mr-2" />
                            Télécharger le modèle CSV
                          </button>
                        </div>
                        
                        <div className="bg-green-50 p-3 rounded-md text-xs text-green-700">
                          <div className="flex">
                            <HiOutlineInformationCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <p>
                              <span className="font-medium">Conseil :</span> Vous pouvez créer votre fichier CSV avec Excel ou Google Sheets, puis l'exporter au format CSV.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowImportGuide(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-sm"
                    >
                      Fermer
                    </button>
                    
                    <label 
                      htmlFor="csvUpload" 
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer text-sm flex items-center"
                      onClick={() => setShowImportGuide(false)}
                    >
                      Choisir un fichier CSV
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    
    </div>
  );
};

export default JournalEntryList;