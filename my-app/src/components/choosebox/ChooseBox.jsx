import React, { useState } from 'react';
import { User, CheckCircle, MapPin, Edit3 } from 'lucide-react';
import './ChooseBox.css';

const ChooseBox = ({ employee, onConfirm, isConfirmed = false, chosenDivision = null }) => {
  const [selectedDivision, setSelectedDivision] = useState(chosenDivision || '');
  const [isEditing, setIsEditing] = useState(false);
  
  const divisions = [
    'DCD',
    'DCI', 
    'Contabilidade',
    'Transparência',
    'Orientação',
    'Apuração e Combate à Corrupção',
    'DIE',
    'DTI',
    'Projetos e Processos'
  ];

  const handleConfirm = () => {
    if (selectedDivision) {
      onConfirm(employee.id, selectedDivision);
      setIsEditing(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className={`choose-box ${isConfirmed ? 'confirmed' : ''}`}>
      <div className="employee-photo">
        {employee.photo ? (
          <img 
            src={`/photos/${employee.photo}`} 
            alt={employee.name}
            className="employee-photo-img"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="employee-photo-fallback" style={{ display: employee.photo ? 'none' : 'flex' }}>
          <User size={48} />
        </div>
      </div>
      
      <div className="employee-info">
        <h3 className="employee-name">{employee.name}</h3>
        <p className="employee-department">{employee.department}</p>
      </div>

      <div className="division-selector">
        <label htmlFor={`division-${employee.id}`} className="division-label">
          <MapPin size={16} />
          {isConfirmed && !isEditing ? 'Divisão Atual:' : 'Escolher Divisão:'}
        </label>
        <select
          id={`division-${employee.id}`}
          value={selectedDivision}
          onChange={(e) => setSelectedDivision(e.target.value)}
          disabled={isConfirmed && !isEditing}
          className="division-select"
        >
          <option value="">Selecione uma divisão</option>
          {divisions.map((division) => (
            <option key={division} value={division}>
              {division}
            </option>
          ))}
        </select>
      </div>

      {isConfirmed && !isEditing ? (
        <div className="confirmed-actions">
          <div className="confirmed-info">
            <CheckCircle size={16} />
            <span>Confirmado: {selectedDivision}</span>
          </div>
          <button
            onClick={handleEdit}
            className="edit-button"
          >
            <Edit3 size={16} />
            Alterar
          </button>
        </div>
      ) : (
        <button
          onClick={handleConfirm}
          disabled={!selectedDivision}
          className="confirm-button"
        >
          {isConfirmed ? 'Atualizar' : 'Confirmar'}
        </button>
      )}
    </div>
  );
};

export default ChooseBox;
