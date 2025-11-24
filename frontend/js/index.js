document.addEventListener('DOMContentLoaded', () => {

  const aiSearchButton = document.getElementById('ai-search-button');

  if (aiSearchButton) {
    aiSearchButton.addEventListener('click', () => {
      alert('did you really think that we implemented an ai feautere sir? 😐');
    });
  }

  // Future feature: Random Post Button
  const randomPostButton = document.getElementById('random-post-button');
  if(randomPostButton) {
    randomPostButton.addEventListener('click', () => {
      // Placeholder for future functionality
      alert('This will show a random post soon!');
    });
  }
});