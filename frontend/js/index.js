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
    randomPostButton.addEventListener('click', async () => {
      const originalButtonContent = randomPostButton.innerHTML;
      randomPostButton.innerHTML = 'Feeling Lucky...';
      randomPostButton.disabled = true;

      try {
        const response = await fetch('http://localhost:5000/api/random');
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        const post = data._source;
        if (post && post.status_link && post.status_link.startsWith('http')) {
          window.open(post.status_link, '_blank');
        } else {
          alert('The random post found does not have a valid link to open.');
        }

      } catch (error) {
        console.error('Error fetching random post:', error);
        alert('Could not fetch a random post. Please ensure the backend server is running.');
      } finally {
        randomPostButton.innerHTML = originalButtonContent;
        randomPostButton.disabled = false;
      }
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

  const importForm = document.getElementById('import-form');
  const fileInput = document.getElementById('csv-file-input');
  const importButton = document.getElementById('import-button');
  const statusMessage = document.getElementById('import-status-message');

  if (importForm) {
    importForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!fileInput.files || fileInput.files.length === 0) {
        statusMessage.textContent = 'Please select a CSV file to upload.'
        statusMessage.style.color = 'var(--accent-color)';
        return;
      }

      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append('csv_file', file);

      importButton.textContent = 'Uploading...';
      importButton.disabled = true;
      statusMessage.textContent = '';

      try {
        const response = await fetch('http://localhost:5000/api/import', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'An unknown error occurred.');
        }

        statusMessage.textContent = data.message;
        statusMessage.style.color = 'var(--primary-color)';
        importForm.reset();
      } catch (error) {
        console.error('Error uploading file:', error);
        statusMessage.textContent = `Upload failed: ${error.message}`;
        statusMessage.style.color = 'var(--accent-color)';
      } finally {
        importButton.textContent = 'Upload';
        importButton.disabled = false;
      }
    });
  }
});