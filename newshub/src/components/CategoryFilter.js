import React from 'react';

const CategoryFilter = ({ currentCategory, onCategoryChange }) => {
  const categories = [
    { id: 'top', label: 'Top News' },
    { id: 'business', label: 'Business' },
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'environment', label: 'Environment' },
    { id: 'food', label: 'Food' },
    { id: 'health', label: 'Health' },
    { id: 'politics', label: 'Politics' },
    { id: 'science', label: 'Science' },
    { id: 'sports', label: 'Sports' },
    { id: 'technology', label: 'Technology' },
    { id: 'crime', label: 'Crime' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.scroll}>
        {categories.map((category) => (
          <button
            key={category.id}
            style={{
              ...styles.button,
              ...(currentCategory === category.id ? styles.activeButton : {})
            }}
            onClick={() => onCategoryChange(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginTop: '20px'
  },
  scroll: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    padding: '10px 0'
  },
  button: {
    background: '#f8f9fa',
    border: '2px solid #e9ecef',
    color: '#495057',
    padding: '8px 20px',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.3s'
  },
  activeButton: {
    background: '#3498db',
    color: 'white',
    borderColor: '#3498db'
  }
};

export default CategoryFilter;