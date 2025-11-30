document.addEventListener('DOMContentLoaded', () => {
  
  // Logic for the Ai search button
  const aiSearchButton = document.getElementById('ai-search-button');
  if (aiSearchButton) {
    aiSearchButton.addEventListener('click', () => {
      alert("did you really think that we implemented an ai feautere sir?");
    });
  }

  // Logic for the Random Post Button
  const randomPostButton = document.getElementById('random-post-button');
  if (randomPostButton) {
    randomPostButton.addEventListener('click', () => {
      // Placeholder
      alert("This will show a random post soon!");
    });
  }

  // Logic forf the main submission
  const searchForm = document.querySelector('.search-form');
  const searchInput = document.querySelector('.search-input');

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const query = searchInput.value.trim();

      if (query) {
        window.location.href = `search.html?query=${encodeURIComponent(query)}`;
      }
    });
  }
});