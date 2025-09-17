import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, TrendingDown, Users, Award, ThumbsDown } from 'lucide-react';
import database from '../../utils/database';
import './Sidebar.css';

const Sidebar = ({ choices, guesses, onChoiceUpdate }) => {
  const [ranking, setRanking] = useState([]);
  const [previousRanking, setPreviousRanking] = useState([]);

  // Calculate ranking using database method
  useEffect(() => {
    const calculateRanking = async () => {
      try {
        const newRanking = await database.getRanking();
        setPreviousRanking(ranking);
        setRanking(newRanking);
      } catch (error) {
        console.error('Failed to calculate ranking:', error);
        setRanking([]);
      }
    };

    calculateRanking();
  }, [choices, guesses]);

  const getRankingChange = (currentIndex, name) => {
    const previousIndex = previousRanking.findIndex(item => item.guesser_name === name);
    if (previousIndex === -1) return 'new';
    if (currentIndex < previousIndex) return 'up';
    if (currentIndex > previousIndex) return 'down';
    return 'same';
  };

  const getRankIcon = (index, isWorst = false) => {
    if (isWorst) {
      switch (index) {
        case 0: return <ThumbsDown className="rank-icon worst" size={20} />;
        case 1: return <ThumbsDown className="rank-icon worst" size={20} />;
        case 2: return <ThumbsDown className="rank-icon worst" size={20} />;
        default: return <span className="rank-number">{index + 1}</span>;
      }
    } else {
      switch (index) {
        case 0: return <Trophy className="rank-icon gold" size={20} />;
        case 1: return <Award className="rank-icon silver" size={20} />;
        case 2: return <Award className="rank-icon bronze" size={20} />;
        default: return <span className="rank-number">{index + 1}</span>;
      }
    }
  };

  const getChangeIcon = (change) => {
    switch (change) {
      case 'up': return <TrendingUp className="change-icon up" size={16} />;
      case 'down': return <TrendingDown className="change-icon down" size={16} />;
      case 'new': return <span className="change-icon new">NEW</span>;
      default: return null;
    }
  };

  // Get top 3 and worst 3
  const topRanking = ranking.slice(0, 3);
  const worstRanking = ranking.slice(-3).reverse();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          <Trophy size={24} />
          Ranking de Palpites
        </h2>
        <div className="total-choices">
          <Users size={16} />
          {choices.length} auditores com divisão definida
        </div>
      </div>

      {/* Melhores Apostas */}
      <div className="ranking-section">
        <h3 className="ranking-subtitle">
          <Trophy size={18} />
          Melhores Apostas
        </h3>
        <div className="ranking-list">
          {topRanking.map((guesser, index) => {
            const change = getRankingChange(index, guesser.guesser_name);
            return (
              <div 
                key={`top-${guesser.guesser_name}`} 
                className={`ranking-item ${change !== 'same' ? 'updated' : ''}`}
              >
                <div className="rank-info">
                  {getRankIcon(index)}
                  <div className="guesser-details">
                    <span className="guesser-name">{guesser.guesser_name}</span>
                    <span className="guesser-points">{guesser.points} pontos</span>
                  </div>
                </div>
                <div className="rank-change">
                  {getChangeIcon(change)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Piores Apostas */}
      <div className="ranking-section">
        <h3 className="ranking-subtitle">
          <ThumbsDown size={18} />
          Piores Apostas
        </h3>
        <div className="ranking-list">
          {worstRanking.map((guesser, index) => {
            const originalIndex = ranking.findIndex(item => item.guesser_name === guesser.guesser_name);
            const change = getRankingChange(originalIndex, guesser.guesser_name);
            return (
              <div 
                key={`worst-${guesser.guesser_name}`} 
                className={`ranking-item worst ${change !== 'same' ? 'updated' : ''}`}
              >
                <div className="rank-info">
                  {getRankIcon(index, true)}
                  <div className="guesser-details">
                    <span className="guesser-name">{guesser.guesser_name}</span>
                    <span className="guesser-points">{guesser.points} pontos</span>
                  </div>
                </div>
                <div className="rank-change">
                  {getChangeIcon(change)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {ranking.length === 0 && (
        <div className="no-data">
          <Users size={48} />
          <p>Nenhum palpite ainda</p>
          <span>As escolhas aparecerão aqui</span>
        </div>
      )}

      <div className="sidebar-footer">
        <div className="progress-info">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(choices.length / 30) * 100}%` }}
            />
          </div>
          <span className="progress-text">
            {choices.length}/30 auditores escolhidos
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
