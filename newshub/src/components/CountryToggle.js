import React from 'react';

const CountryToggle = ({ currentCountry, onToggle }) => {
  return (
    <div style={styles.container}>
      <div style={styles.toggleContainer}>
        <button
          style={{
            ...styles.toggleButton,
            ...(currentCountry === 'ph' ? styles.activeButton : {})
          }}
          onClick={() => onToggle('ph')}
        >
          🇵🇭 Philippines
        </button>
        <button
          style={{
            ...styles.toggleButton,
            ...(currentCountry === 'world' ? styles.activeButton : {})
          }}
          onClick={() => onToggle('world')}
        >
          🌍 Worldwide
        </button>
      </div>
      <div style={styles.indicator}>
        Currently showing: {currentCountry === 'ph' ? 'Philippine News' : 'Worldwide News'}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '20px'
  },
  toggleContainer: {
    display: 'inline-flex',
    background: '#f8f9fa',
    borderRadius: '30px',
    padding: '5px',
    border: '2px solid #e9ecef'
  },
  toggleButton: {
    padding: '10px 25px',
    border: 'none',
    background: 'none',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  activeButton: {
    background: '#3498db',
    color: 'white'
  },
  indicator: {
    marginTop: '10px',
    fontSize: '14px',
    color: '#7f8c8d',
    fontWeight: '500'
  }
};

export default CountryToggle;