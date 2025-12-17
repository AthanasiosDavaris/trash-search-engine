// Global Variable that stores the full data of the displayed hits
let allHitsData = {};

document.addEventListener('DOMContentLoaded', () => {
  // Search Bar Logic
  const searchInput = document.getElementById('header-search-input');
  const clearSearchButton = document.getElementById('clear-search-button');
  const toggleClearButton = () => {
    if (searchInput && clearSearchButton) {
      clearSearchButton.style.display = searchInput.value.length > 0 ? 'block' : 'none';
    }
  };
  if (clearSearchButton && searchInput) {
    clearSearchButton.addEventListener('click', () => {
      searchInput.value = '';
      searchInput.focus();
      toggleClearButton();
    });
    searchInput.addEventListener('input', toggleClearButton);
  }

  // Fetch and Display Results
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('query');
  if (query) {
    if (searchInput) {
      searchInput.value = query;
      toggleClearButton();
    }
    fetchResults(query);
  } else {
    const resultsList = document.getElementById('results-list');
    if (resultsList) {
      resultsList.innerHTML = '<p>Please enter a search term on the homepage.</p>'
    }
  }

  // Click handler on the results list
  const resultsList = document.getElementById('results-list');
  if (resultsList) {
    resultsList.addEventListener('click', handleResultClick);
  }

  // Details Modal Logic
  const detailsModal = document.getElementById('details-modal');
  const closeDetailsModalButton = document.querySelector('.details-close-button');
  if (detailsModal && closeDetailsModalButton) {
    closeDetailsModalButton.addEventListener('click', () => detailsModal.style.display = 'none');
    detailsModal.addEventListener('click', (event) => {
      if (event.target === detailsModal) {
        detailsModal.style.display = 'none';
      }
    });
  }
});

/**
 * Main function that handles clicks on each result.
 * @param {Event} event - The click event.
 */
function handleResultClick(event) {
  const button = event.target.closest('.action-button');
  if (!button) return;

  const resultArticle = button.closest('.search-result');
  const postId = resultArticle.dataset.id;

  if (button.classList.contains('delete-button')) {
    handleDelete(postId, resultArticle);
  } else if (button.classList.contains('find-similar-button')) {
    fetchSimilar(postId);
  } else if (button.classList.contains('view-details-button')) {
    showDetails(postId);
  }
}

/**
 * Fetches search results from the backend API
 * @param {string} query - The search term.
 */
async function fetchResults(query, apiUrl = `http://localhost:5000/api/search?query=${encodeURIComponent(query)}`) {
  const resultsList = document.getElementById('results-list');
  if (!resultsList) return;

  resultsList.innerHTML = `
    <div class="loading-container">
      <div class="spinner"></div>
      <p class="loading-message">Searching for "<strong>${query}</strong>"...</p>
    </div>`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    renderResults(data.hits);
  } catch (error) {
    console.error("Error fetching results:", error);
    resultsList.innerHTML = '<p class="error-message">Sorry, something went wrong.</p>';
  }
}

/**
 * Renders the search results on the page
 * @param {Array} hits - hits the array
 */
function renderResults(hits) {
  const resultsList = document.getElementById('results-list');
  if (!resultsList) return;

  allHitsData = {};
  resultsList.innerHTML = '';

  if (hits.length === 0) {
    resultsList.innerHTML = '<p>No results found for your query.</p>';
    return;
  }

  // Loops through each result and creates the html for it
  hits.forEach(hit => {
    allHitsData[hit._id] = hit._source;

    const post = hit._source;
    const score = hit._score;

    const snippet = hit.highlight && hit.highlight.status_message
      ? hit.highlight.status_message[0]
      : (post.status_message || 'No content available.').substring(0, 280) + '...';

    const resultElement = document.createElement('article');
    resultElement.className = 'search-result';
    resultElement.dataset.id = hit._id;

    resultElement.innerHTML = `
      <p class="result-meta">
        <span class="result-score" title="Relevance Score">${score.toFixed(2)}</span> | 
        <span class="result-type">${post.status_type || 'N/A'}</span> | 
        <span class="result-date">${new Date(post.status_published).toLocaleDateString()}</span>
      </p>
      <h2 class="result-title">${post.link_name || 'Untitled Post'}</h2>
      <p class="result-snippet">${snippet}</p> <!-- Use the generated snippet -->
      <div class="result-actions">
        <button class="action-button find-similar-button"><i class="fas fa-search-plus"></i> Find Similar</button>
        <button class="action-button view-details-button"><i class="fas fa-eye"></i> View Details</button>
        <button class="action-button delete-button"><i class="fas fa-trash"></i> Delete</button>
      </div>
    `;
    resultsList.appendChild(resultElement);
  });
}

/**
 * Handles the Delete button.
 * @param {string} postId - The ID of the post to delete 
 * @param {HTMLElement} elementToRemove - The HTML element to remove from the database.
 */
function handleDelete(postId, elementToRemove) {
  if(confirm(`Are you sure you want to delete this post? This action cannot be undone.`)) {
    fetch(`http://localhost:5000/api/delete/${postId}`, {method: 'DELETE'})
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          showToast(data.message, 'success');
          elementToRemove.style.transition = 'opacity 0.5s ease';
          elementToRemove.style.opacity = '0';
          setTimeout(() => elementToRemove.remove(), 500);
        } else {
          showToast(`Error: ${data.message}`, 'error');
        }
      })
      .catch(error => {
        console.error('Error deleting post:', error);
        showToast('An error occurred while trying to delete the post.', 'error');
      });
  }
}

/**
 * Fetches and displays posts similar to the given post ID.
 * @param {string} postId - The ID of the post to find similar ones to.
 */
async function fetchSimilar(postId) {
  const resultsList = document.getElementById('results-list');
  if (!resultsList) return;

  const postTitle = allHitsData[postId]?.link_name || `post ${postId}`;
  resultsList.innerHTML = `
    <div class="loading-container">
      <div class="spinner"></div>
      <p class="loading-message">Finding posts similar to "<strong>${postTitle}</strong>"...</p>
    </div>`;

  try {
    const apiURL = `http://localhost:5000/api/similar/${postId}`;
    const response = await fetch(apiURL);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    renderResults(data.hits);
  } catch (error) {
    console.error("Error fetching similar posts:", error);
    resultsList.innerHTML = '<p class="error-message">Could not fetch similar posts.</p>';
  }
}

/**
 * Displays the full details of a post in a modal.
 * @param {string} postId - The ID of the post to show details for.
 */
function showDetails(postId) {
  const postData = allHitsData[postId];
  if (!postData) {
    alert('Could not find details for this post.');
    return;
  }

  const modalTitle = document.getElementById('details-modal-title');
  const modalBody = document.getElementById('details-modal-body');
  const detailsModal = document.getElementById('details-modal');

  modalTitle.textContent = postData.link_name || 'Post Details';

  modalBody.innerHTML = '';

  const list = document.createElement('dl');

  for (const [key, value] of Object.entries(postData)) {
    const dt = document.createElement('dt');
    dt.textContent = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const dd = document.createElement('dd');

    const displayValue = value !== null ? value : 'N/A';

    if (typeof displayValue === 'string' && displayValue.startsWith('http')) {
      const link = document.createElement('a');
      link.href = displayValue;
      link.textContent = displayValue;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      dd.appendChild(link);
    } else {
      dd.textContent = displayValue;
    }

    list.appendChild(dt);
    list.appendChild(dd);
  }

  modalBody.appendChild(list);
  detailsModal.style.display = 'flex';
}