// Simple CSV parser for our data files
export const parseCSV = (csvText) => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = values[index]?.trim() || '';
      });
      return obj;
    });
};

// Load employees data
export const loadEmployees = async () => {
  try {
    console.log('Loading employees from CSV...');
    const response = await fetch('/data/employees.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    console.log('CSV text loaded:', csvText.substring(0, 200) + '...');
    const employees = parseCSV(csvText);
    console.log('Parsed employees:', employees);
    return employees;
  } catch (error) {
    console.error('Failed to load employees:', error);
    return [];
  }
};

// Load guesses data
export const loadGuesses = async () => {
  try {
    console.log('Loading guesses from CSV...');
    const response = await fetch('/data/guesses.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    console.log('Guesses CSV text loaded:', csvText.substring(0, 200) + '...');
    const guesses = parseCSV(csvText);
    console.log('Parsed guesses:', guesses);
    return guesses;
  } catch (error) {
    console.error('Failed to load guesses:', error);
    return [];
  }
};
