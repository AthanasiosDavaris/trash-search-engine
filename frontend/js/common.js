// It waits for the DOM to be fully loaded before running the script, its standard practice on basically every site.
document.addEventListener('DOMContentLoaded', () => {

  // Light/Dark Theme Toggle
  const themeToggleButton = document.getElementById('theme-toggle-button');
  const themeIcon = document.getElementById('theme-icon');

  // Checks for saved theme preference in localStorage (or sets light as default)
  let currentTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', currentTheme);

  // Sets Icon based on theme
  if (currentTheme === 'dark') {
    if (themeIcon) {
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
    }
  }

  if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
      // Toggles the themes
      currentTheme = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.body.setAttribute('data-theme', currentTheme);
      localStorage.setItem('theme', currentTheme);

      // Toggle the Icons
      if (currentTheme === 'dark') {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
      } else {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
      }
    });
  }

  // Audio Controls
  const audio = document.getElementById('theme-audio');
  const playPauseButton = document.getElementById('play-pause-button');
  const playPauseIcon = document.getElementById('play-pause-icon');
  const volumeSlider = document.getElementById('volume-slider');

  if (playPauseButton && audio) {
    playPauseButton.addEventListener('click', () => {
      if (audio.paused) {
        audio.play();
        playPauseIcon.classList.remove('fa-play');
        playPauseIcon.classList.add('fa-pause');
      } else {
        audio.pause();
        playPauseIcon.classList.remove('fa-pause');
        playPauseIcon.classList.add('fa-play');
      }
    });
  }

  if (volumeSlider && audio) {
    volumeSlider.addEventListener('input', (e) => {
      audio.volume = e.target.value;
    });
  }

  // Image Modal
  const imageModal = document.getElementById('image-modal');
  const imageButton = document.getElementById('image-button');
  const imageCloseButton = document.querySelector('.image-close-button');

  // When the user clicks the image button, open the modal
  if (imageButton && imageModal) {
    imageButton.addEventListener('click', () => {
      imageModal.style.display = 'flex';
    });
  }

  // When the user clicks on (x), close the modal
  if (imageCloseButton && imageModal) {
    imageCloseButton.addEventListener('click', () => {
      imageModal.style.display = 'none';
    });
  }

  // When the user clicks anywhere outside of the modal content, close it
  if (imageModal) {
    imageModal.addEventListener('click', (event) => {
      if (event.target === imageModal) {
        imageModal.style.display = 'none';
      }
    });
  }
});