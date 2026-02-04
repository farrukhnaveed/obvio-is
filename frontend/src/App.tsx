import { useState } from 'react';
import FileUpload from './components/FileUpload';
import SearchBar from './components/SearchBar';
import ResultsList from './components/ResultsList';
import './App.css';
const apiUrl = import.meta.env.VITE_API_URL;

function App() {
  const [results, setResults] = useState<string[]>([]);

  const handleSearch = async (term: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/search?term=${term}`);
      const data = await response.json();
      // Expecting { results: ["doc1.txt", "doc2.txt", ...] }
      setResults(data.result.map((doc: any) => doc.name) || []);
    } catch (error) {
      console.error("Search failed", error);
    }
  };

  return (
    <div className="App">
      <h1>Obvio Search Engine</h1>
      <FileUpload />
      <hr />
      <SearchBar onSearch={handleSearch} />
      <ResultsList results={results} />
    </div>
  );
}

export default App;
