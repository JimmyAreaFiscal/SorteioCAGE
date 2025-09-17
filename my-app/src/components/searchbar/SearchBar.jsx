import React from 'react';
import { Search, Filter } from 'lucide-react';
import './SearchBar.css';

const SearchBar = ({ searchTerm, onSearchChange, totalEmployees, filteredCount }) => {
  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Buscar funcionários por nome..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        <Filter className="filter-icon" size={20} />
      </div>
      
      <div className="search-stats">
        <span className="employee-count">
          Mostrando {filteredCount} de {totalEmployees} auditores
        </span>
      </div>
    </div>
  );
};

export default SearchBar;
