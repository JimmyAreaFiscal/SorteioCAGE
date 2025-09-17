import React, { useState, useEffect } from 'react';
import ChooseBox from './components/choosebox/ChooseBox';
import SearchBar from './components/searchbar/SearchBar';
import Sidebar from './components/sidebar/Sidebar';
import database from './utils/database';
import { loadEmployees, loadGuesses } from './utils/dataLoader';
import './App.css';

function App() {
  const [employees, setEmployees] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [choices, setChoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Initialize app data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Starting app initialization...');
        setLoading(true);
        
        // Initialize database
        console.log('Initializing database...');
        await database.init();
        console.log('Database initialized successfully');
        
        // Load employees and guesses
        console.log('Loading employees and guesses...');
        const [employeesData, guessesData] = await Promise.all([
          loadEmployees(),
          loadGuesses()
        ]);
        console.log('Data loaded - employees:', employeesData.length, 'guesses:', guessesData.length);
        
        // Load data into database
        console.log('Loading data into database...');
        await database.loadEmployees(employeesData);
        await database.loadGuesses(guessesData);
        console.log('Data loaded into database successfully');
        
        // Get saved choices
        const savedChoices = await database.getChoices();
        console.log('Loaded choices:', savedChoices);
        console.log('Database initialized:', database.initialized);
        console.log('Using localStorage fallback:', database.useLocalStorage);
        
        setEmployees(employeesData);
        setGuesses(guessesData);
        setChoices(savedChoices);
        console.log('App initialization completed successfully');
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle choice confirmation
  const handleChoiceConfirm = async (employeeId, division) => {
    console.log('Choice confirm called:', { employeeId, division });
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
      console.log('Employee not found:', employeeId);
      return;
    }

    console.log('Saving choice for employee:', employee.name);
    // Save to database (handles both new and update cases)
    const success = await database.saveChoice(
      parseInt(employeeId),
      employee.name,
      division
    );

    console.log('Save result:', success);
    if (success) {
      // Reload choices from database to get the updated state
      const updatedChoices = await database.getChoices();
      console.log('Updated choices after save:', updatedChoices);
      setChoices(updatedChoices);
    }
  };

  // Check if employee has been chosen
  const isEmployeeChosen = (employeeId) => {
    return choices.some(choice => choice.employeeId === employeeId);
  };

  // Get chosen division for employee
  const getChosenDivision = (employeeId) => {
    const choice = choices.find(choice => choice.employeeId === employeeId);
    return choice ? choice.division : null;
  };

  // Reset database
  const handleResetDatabase = async () => {
    if (window.confirm('Are you sure you want to reset all choices and reload employee data? This cannot be undone.')) {
      try {
        setLoading(true);
        
        // Reset choices
        const success = await database.resetDatabase();
        if (success) {
          // Reload employees and guesses from CSV
          const [employeesData, guessesData] = await Promise.all([
            loadEmployees(),
            loadGuesses()
          ]);
          
          // Load data into database
          await database.loadEmployees(employeesData);
          await database.loadGuesses(guessesData);
          
          // Update state
          setEmployees(employeesData);
          setGuesses(guessesData);
          setChoices([]);
          
          console.log('Database reset and data reloaded successfully');
        }
      } catch (error) {
        console.error('Failed to reset database:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando dados...</p>
        <p>Se esta tela persistir, verifique o console do navegador para erros.</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          Sorteio das Divisões - CAGE-RS
        </h1>
        <p className="app-subtitle">
          Escolha a divisão para cada funcionário e acompanhe o ranking de palpites
        </p>
        <button 
          onClick={handleResetDatabase}
          className="reset-button"
          title="Reset all choices"
        >
          🔄 Reset Database
        </button>
      </header>

      <div className="app-content">
        <div className="sidebar-container">
          <Sidebar
            choices={choices}
            guesses={guesses}
            onChoiceUpdate={setChoices}
          />
        </div>
        
        <div className="main-content">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            totalEmployees={employees.length}
            filteredCount={filteredEmployees.length}
          />

          <div className="employees-grid">
            {filteredEmployees.map(employee => (
              <ChooseBox
                key={employee.id}
                employee={employee}
                onConfirm={handleChoiceConfirm}
                isConfirmed={isEmployeeChosen(employee.id)}
                chosenDivision={getChosenDivision(employee.id)}
              />
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="no-results">
              <p>Nenhum funcionário encontrado com o termo "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
