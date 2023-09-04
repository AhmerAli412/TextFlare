import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import 'tailwindcss/tailwind.css';
import Papa from 'papaparse';

function App() {
  const [paragraph, setParagraph] = useState('');
  const [word, setWord] = useState('');
  const [excludeWord, setExcludeWord] = useState('');
  const [overallCount, setOverallCount] = useState(0);
  const [searchedCount, setSearchedCount] = useState(0);
  const [wordCloudData, setWordCloudData] = useState([]);
  const [highlightedText, setHighlightedText] = useState('');
  const [excludedWords, setExcludedWords] = useState([]);
  const [statistics, setStatistics] = useState({
    longestWord: '',
    shortestWord: '',
    averageWordLength: 0,
  });

  const chartCanvasRef = useRef(null);

  const filterExcludedWords = (text) => {
    return text
      .split(' ')
      .filter((w) => !excludedWords.includes(w.toLowerCase()))
      .join(' ');
  };

  useEffect(() => {
    if (chartCanvasRef.current && chartCanvasRef.current.chartInstance) {
      chartCanvasRef.current.chartInstance.destroy();
    }

    // Update the paragraph word count calculation
    const filteredParagraph = filterExcludedWords(paragraph);
    const wordsInParagraph = filteredParagraph.split(/\s+/).filter(Boolean);
    setOverallCount(wordsInParagraph.length);

    const filteredWordCloudData = wordCloudData.filter(
      (wordData) => !excludedWords.includes(wordData.text.toLowerCase())
    );

    const newChartInstance = new Chart(chartCanvasRef.current, {
      type: 'bar',
      data: {
        labels: filteredWordCloudData.map((wordData) => wordData.text),
        datasets: [
          {
            label: 'Word Frequency',
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(75, 192, 192, 0.8)',
            hoverBorderColor: 'rgba(75, 192, 192, 1)',
            data: filteredWordCloudData.map((wordData) => wordData.value),
          },
        ],
      },
      options: {
        scales: {
          x: {
            type: 'category',
          },
          y: {},
        },
      },
    });

    const words = filteredParagraph.split(' ');

    setStatistics({
      longestWord: words.reduce((longest, word) => (word.length > longest.length ? word : longest), ''),
      shortestWord: words.reduce((shortest, word) => (word.length < shortest.length ? word : shortest), words[0]),
      averageWordLength: words.reduce((acc, word) => acc + word.length, 0) / words.length,
    });

    chartCanvasRef.current.chartInstance = newChartInstance;
  }, [paragraph, excludedWords, wordCloudData]);

  const handleSearch = () => {
    const wordToSearch = word.toLowerCase();
    const words = paragraph.toLowerCase().split(/\s+/).filter(Boolean);

    const wordCountInParagraph = words.filter((w) => w === wordToSearch).length;
    setSearchedCount(wordCountInParagraph);

    const highlightedText = paragraph.replace(
      new RegExp(`\\b${wordToSearch}\\b`, 'gi'),
      (match) => `<span class="bg-yellow-200 text-red-600">${match}</span>`
    );

    setHighlightedText(highlightedText);
  };

  const handleExcludeWord = () => {
    const newExcludedWords = [...excludedWords, excludeWord.toLowerCase()];
    setExcludedWords(newExcludedWords);
    setExcludeWord('');
  };




   // Function to export data as CSV
   const exportCSV = () => {
    const dataToExport = [
      // Prepare your data here, e.g., word counts and statistics
      ['Metric', 'Value'],
      ['Overall Word Count', overallCount],
      ['Searched Word Count', searchedCount],
      ['Longest Word', statistics.longestWord],
      ['Shortest Word', statistics.shortestWord],
      ['Average Word Length', statistics.averageWordLength.toFixed(2)],
    ];

    // Convert data to CSV format
    const csv = Papa.unparse(dataToExport);

    // Create a Blob containing the CSV data
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    // Create a download link and trigger the download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'text-analysis-results.csv';
    link.click();
  };





  const fetchWordCloud = () => {
    axios
      .post('http://localhost:5000/api/word-cloud', { paragraph })
      .then((response) => {
        setWordCloudData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching word cloud data:', error);
      });
  };

  // Call fetchWordCloud when the paragraph changes
  useEffect(() => {
    if (paragraph) {
      fetchWordCloud();
    }
  }, [paragraph]);

  return (
    <div className="container mx-auto p-8">
  <div className="grid grid-cols-2 gap-8">
    <div>
      <textarea
        name="paragraph"
        placeholder="Enter a paragraph..."
        rows="13"
        className="w-full p-2 border rounded-lg mb-4"
        value={filterExcludedWords(paragraph)}
        onChange={(e) => setParagraph(e.target.value)}
      />
      <div className="flex items-center space-x-2">
        <input
          type="text"
          name="word"
          placeholder="Search word..."
          className="w-full p-2 border rounded-lg"
          value={word}
          onChange={(e) => setWord(e.target.value)}
        />
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onClick={handleSearch}>
          Search
        </button>

        <button
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        onClick={exportCSV}
      >
        Export
      </button>
      </div>
      <div className="flex items-center space-x-2 mt-2">
        <input
          type="text"
          name="excludeWord"
          placeholder="Exclude word..."
          className="w-full p-2 border rounded-lg"
          value={excludeWord}
          onChange={(e) => setExcludeWord(e.target.value)}
        />
        <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600" onClick={handleExcludeWord}>
          Exclude
        </button>
      </div>
    </div>



    <div>
  <div className="bg-gray-100 p-4 rounded-lg shadow-md">
    <h2 className="text-2xl font-semibold mb-4">Text Analysis Summary</h2>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2">Overall Word Count</h3>
        <p className="text-2xl font-bold">{overallCount}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2">Searched Word Count</h3>
        <p className="text-2xl font-bold">{searchedCount}</p>
      </div>
    </div>
  </div>
  <div className="bg-gray-100 p-4 mt-4 rounded-lg shadow-md">
    <h2 className="text-2xl font-semibold mb-4">Word Statistics</h2>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2">Longest Word</h3>
        <p className="text-lg">{statistics.longestWord}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2">Shortest Word</h3>
        <p className="text-lg">{statistics.shortestWord}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2">Average Word Length</h3>
        <p className="text-lg">{statistics.averageWordLength.toFixed(2)} characters</p>
      </div>
    </div>
  </div>
</div>





  </div>
  <div className="mt-8">
    <h2 className="text-xl font-semibold mb-4">Word Frequency Chart</h2>
    <canvas ref={chartCanvasRef} />
  </div>
</div>

  );
}

export default App;
