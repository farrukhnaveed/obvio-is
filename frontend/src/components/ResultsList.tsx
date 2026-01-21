import React from 'react';

interface ResultsListProps {
  results: string[];
}

const ResultsList = ({ results }: ResultsListProps) => {
  return (
    <div className="card">
      <h3>Search Results (Top 3)</h3>
      {results.length > 0 ? (
        <ul>
          {results.map((docName, index) => (
            <li key={index} style={{ listStyle: 'none', padding: '5px 0' }}>
              📄 {docName}
            </li>
          ))}
        </ul>
      ) : (
        <p>No documents found for this term.</p>
      )}
    </div>
  );
};

export default ResultsList;
