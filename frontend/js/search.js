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

    // Runs once on page load just in case its already filled
    toggleClearButton();
  }

  // I will add the API call and results rendering here later #fml
});