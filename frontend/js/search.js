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
 * Function that handles clicks on the results list
 * @param {Event} event - The click event.
 */
function handleResultClick(event) {
  const button = event.target.closest('.action-button');
  if (!button) return; // If the click was not on a button

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

