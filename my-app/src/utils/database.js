import initSqlJs from 'sql.js';

class Database {
  constructor() {
    this.db = null;
    this.initialized = false;
    this.useLocalStorage = true; // Force localStorage for now
  }

  async init() {
    if (this.initialized) return;

    console.log('Initializing database with localStorage...');
    this.initialized = true;
    console.log('Database initialized successfully with localStorage');
  }

  createTables() {
    if (this.useLocalStorage) return;

    // Create choices table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS choices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        employee_name TEXT NOT NULL,
        division TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create employees table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        photo TEXT NOT NULL
      )
    `);

    // Create guesses table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS guesses (
        id INTEGER PRIMARY KEY,
        guesser_name TEXT NOT NULL,
        employee_id INTEGER NOT NULL,
        division_guess TEXT NOT NULL,
        points INTEGER NOT NULL
      )
    `);
  }

  async saveChoice(employeeId, employeeName, division) {
    console.log('Database saveChoice called:', { employeeId, employeeName, division });
    console.log('Using localStorage fallback:', this.useLocalStorage);
    
    if (this.useLocalStorage) {
      return this.saveChoiceToLocalStorage(employeeId, employeeName, division);
    }

    try {
      // First, check if employee already has a choice
      const existingChoice = this.db.prepare(`
        SELECT id FROM choices WHERE employee_id = ?
      `).get([employeeId]);

      console.log('Existing choice found:', existingChoice);

      if (existingChoice) {
        // Update existing choice
        console.log('Updating existing choice');
        const updateStmt = this.db.prepare(`
          UPDATE choices 
          SET employee_name = ?, division = ?, created_at = CURRENT_TIMESTAMP
          WHERE employee_id = ?
        `);
        updateStmt.run([employeeName, division, employeeId]);
      } else {
        // Insert new choice
        console.log('Inserting new choice');
        const insertStmt = this.db.prepare(`
          INSERT INTO choices (employee_id, employee_name, division)
          VALUES (?, ?, ?)
        `);
        insertStmt.run([employeeId, employeeName, division]);
      }
      return true;
    } catch (error) {
      console.error('Failed to save choice:', error);
      return false;
    }
  }

  async getChoices() {
    if (this.useLocalStorage) {
      return this.getChoicesFromLocalStorage();
    }

    try {
      const stmt = this.db.prepare(`
        SELECT 
          id,
          employee_id as employeeId,
          employee_name as employeeName,
          division,
          created_at as timestamp
        FROM choices 
        ORDER BY created_at DESC
      `);
      const result = stmt.all();
      return result;
    } catch (error) {
      console.error('Failed to get choices:', error);
      return [];
    }
  }

  async loadEmployees(employees) {
    if (this.useLocalStorage) {
      return this.loadEmployeesToLocalStorage(employees);
    }

    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO employees (id, name, department, photo)
        VALUES (?, ?, ?, ?)
      `);

      employees.forEach(employee => {
        stmt.run([employee.id, employee.name, employee.department, employee.photo]);
      });
      return true;
    } catch (error) {
      console.error('Failed to load employees:', error);
      return false;
    }
  }

  async loadGuesses(guesses) {
    if (this.useLocalStorage) {
      return this.loadGuessesToLocalStorage(guesses);
    }

    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO guesses (id, guesser_name, employee_id, division_guess, points)
        VALUES (?, ?, ?, ?, ?)
      `);

      guesses.forEach(guess => {
        stmt.run([guess.id, guess.guesser_name, guess.employee_id, guess.division_guess, guess.points]);
      });
      return true;
    } catch (error) {
      console.error('Failed to load guesses:', error);
      return false;
    }
  }

  async getGuesses() {
    if (this.useLocalStorage) {
      return this.getGuessesFromLocalStorage();
    }

    try {
      const stmt = this.db.prepare('SELECT * FROM guesses');
      return stmt.all();
    } catch (error) {
      console.error('Failed to get guesses:', error);
      return [];
    }
  }

  // LocalStorage fallback methods
  saveChoiceToLocalStorage(employeeId, employeeName, division) {
    try {
      console.log('LocalStorage saveChoice called:', { employeeId, employeeName, division });
      const choices = this.getChoicesFromLocalStorage();
      console.log('Current choices in localStorage:', choices);
      
      // Check if employee already has a choice
      const existingIndex = choices.findIndex(choice => choice.employeeId === employeeId);
      console.log('Existing choice index:', existingIndex);
      
      const newChoice = {
        id: existingIndex >= 0 ? choices[existingIndex].id : Date.now(),
        employeeId: employeeId,
        employeeName: employeeName,
        division: division,
        timestamp: new Date().toISOString()
      };
      
      if (existingIndex >= 0) {
        // Update existing choice
        console.log('Updating existing choice in localStorage');
        choices[existingIndex] = newChoice;
      } else {
        // Add new choice
        console.log('Adding new choice to localStorage');
        choices.unshift(newChoice);
      }
      
      console.log('Updated choices:', choices);
      localStorage.setItem('sorteio_choices', JSON.stringify(choices));
      return true;
    } catch (error) {
      console.error('Failed to save choice to localStorage:', error);
      return false;
    }
  }

  getChoicesFromLocalStorage() {
    try {
      const choices = localStorage.getItem('sorteio_choices');
      return choices ? JSON.parse(choices) : [];
    } catch (error) {
      console.error('Failed to get choices from localStorage:', error);
      return [];
    }
  }

  loadEmployeesToLocalStorage(employees) {
    try {
      localStorage.setItem('sorteio_employees', JSON.stringify(employees));
      return true;
    } catch (error) {
      console.error('Failed to load employees to localStorage:', error);
      return false;
    }
  }

  loadGuessesToLocalStorage(guesses) {
    try {
      localStorage.setItem('sorteio_guesses', JSON.stringify(guesses));
      return true;
    } catch (error) {
      console.error('Failed to load guesses to localStorage:', error);
      return false;
    }
  }

  getGuessesFromLocalStorage() {
    try {
      const guesses = localStorage.getItem('sorteio_guesses');
      return guesses ? JSON.parse(guesses) : [];
    } catch (error) {
      console.error('Failed to get guesses from localStorage:', error);
      return [];
    }
  }

  // Calculate points for each guesser based on choices
  calculatePoints(choices, guesses) {
    console.log('Calculating points for choices:', choices);
    console.log('Calculating points for guesses:', guesses);
    
    const pointsMap = {};
    
    // Initialize points for each guesser
    guesses.forEach(guess => {
      const guesserName = guess['NOME COMPLETO'] || guess.guesser_name;
      pointsMap[guesserName] = 0;
    });
    
    // For each choice, check if any guesser predicted it correctly
    choices.forEach(choice => {
      const employeeName = choice.employeeName;
      const chosenDivision = choice.division;
      
      console.log(`Checking predictions for ${employeeName} -> ${chosenDivision}`);
      
      // Check each guesser's prediction for this employee
      guesses.forEach(guess => {
        const guesserName = guess['NOME COMPLETO'] || guess.guesser_name;
        // Convert employee name to uppercase to match CSV column names
        const employeeNameUpper = employeeName.toUpperCase();
        const predictedDivision = guess[employeeNameUpper];
        
        if (predictedDivision && predictedDivision === chosenDivision) {
          pointsMap[guesserName]++;
          console.log(`${guesserName} got a point! Predicted ${predictedDivision} for ${employeeName}`);
        }
      });
    });
    
    console.log('Final points map:', pointsMap);
    return pointsMap;
  }

  // Get ranking with calculated points
  async getRanking() {
    try {
      const choices = await this.getChoices();
      const guesses = await this.getGuesses();
      const pointsMap = this.calculatePoints(choices, guesses);
      
      // Convert to array and sort by points
      const ranking = Object.entries(pointsMap)
        .map(([guesser_name, points]) => ({
          guesser_name,
          points,
          id: guesses.find(g => (g['NOME COMPLETO'] || g.guesser_name) === guesser_name)?.Id || 0
        }))
        .sort((a, b) => b.points - a.points);
      
      console.log('Generated ranking:', ranking);
      return ranking;
    } catch (error) {
      console.error('Failed to get ranking:', error);
      return [];
    }
  }

  // Reset database - clear all data
  async resetDatabase() {
    try {
      if (this.useLocalStorage) {
        localStorage.removeItem('sorteio_choices');
        localStorage.removeItem('sorteio_employees');
        localStorage.removeItem('sorteio_guesses');
        console.log('LocalStorage data cleared');
      } else {
        this.db.exec('DELETE FROM choices');
        this.db.exec('DELETE FROM employees');
        this.db.exec('DELETE FROM guesses');
        console.log('SQLite data cleared');
      }
      return true;
    } catch (error) {
      console.error('Failed to reset database:', error);
      return false;
    }
  }
}

export default new Database();
