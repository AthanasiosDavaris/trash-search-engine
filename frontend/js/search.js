// Makes the "X" button in the search bar work
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('header-search-input');
  const clearSearchButton = document.getElementById('clear-search-button');

  // Function that toggles the visibility of the clear button
  const toggleClearButton = () => {
    if (searchInput.value.length > 0) {
      clearSearchButton.style.display = 'block';
    } else {
      clearSearchButton.style.display = 'none';
    }
  };

  if (clearSearchButton && searchInput) {
    // Event listener for the clear button
    clearSearchButton.addEventListener('click', () => {
      searchInput.value = '';
      searchInput.focus();
      toggleClearButton();
    });

    // Event listener for when the user types in the search bar
    searchInput.addEventListener('input', toggleClearButton);
  }

  // Fetch and display search results
  
  // Gets the search query from the page's URL
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('query');

  // If the query exists, fetch the data from the backend API
  if (query) {
    // Show the query in the search bar
    if (searchInput) {
      searchInput.value = query;
      toggleClearButton();
    }
    
    fetchResults(query);
  } else {
    // if the query is empty, display a message
    const resultsList = document.getElementById('results-list');
    if (resultsList) {
      resultsList.innerHTML = '<p>Please enter a search term on the homepage.</p>';
    }
  }
});

/**
 * Fetch search results from the backend API.
 * @param {string} query - The search query.
 */
async function fetchResults(query) {
  const resultsList = document.getElementById('results-list');
  if (!resultsList) return;

  resultsList.innerHTML = '<p class="loading-message">Loading results for "' + query + '"...</p>';
  try {
    // This URL must match the one the flask server is running on!!!
    const apiURL = 'http://localhost:5000/api/search?query=${encodeURIComponent(query)}';
    const response = await fetch(apiURL);

    if (!response.ok) {
      throw new Error('HTTP error! status: + ${response.status}');
    }

    const data = await response.json();
    renderResults(data.hits); 
  } catch (error) {
    console.error("Error fetching search results:", error);
    resultsList.innerHTML = '<p class="error-message">Sorry, something went wrong. The backend server might not be running.</p>';
  }
}

/**
 * Renders the search results on the page
 * @param {Array} hits - The array of the results from the ElisticSearch
 */
function renderResults(hits) {
  const resultsList = document.getElementById('results-list');
  if (!resultsList) return;

  // Clear the loading message
  resultsList.innerHTML = '';

  if (hits.length === 0) {
    resultsList.innerHTML = '<p>No results found for your query.</p>';
    return;
  }

  // Loops through each result and creates the html structure for them
  hits.forEach(hit => {
    const post = hit._source; // Original post  data
    const score = hit._score; // Relevance score

    const resultElement = document.createElement('article');
    resultElement.className = 'search-result';

    const getField = (field, fallback = 'N/A') => post[field] || fallback;

    resultElement.innerHTML = `
      <p class="result-meta">
        <span class="result-score" title="Relevance Score">${score.toFixed(2)}</span> | 
        <span class="result-type">${getField('status_type')}</span> | 
        <span class="result-date">${new Date(getField('status_published', new Date())).toLocaleDateString()}</span>
      </p>
      <h2 class="result-title">${getField('link_name', 'Untitled Post')}</h2>
      <p class="result-snippet">
        ${getField('status_message', 'No content available.')}
      </p>
      <div class="result-actions">
        <button class="action-btn"><i class="fas fa-search-plus"></i> Find Similar</button>
        <button class="action-btn"><i class="fas fa-eye"></i> View Details</button>
        <button class="action-btn delete-btn"><i class="fas fa-trash"></i> Delete</button>
      </div>
    `;
    resultsList.appendChild(resultElement);
  });
}