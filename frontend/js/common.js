// It waits for the DOM to be fully loaded before running the script, its standard practice on basically every site.
document.addEventListener('DOMContentLoaded', function() {

  // Light/Dark Theme Toggle
  const themeToggleButton = document.getElementById('theme-toggle-button');
  const themeIcon = document.getElementById('theme-icon');

  // Checks for saved theme preference in localStorage (or sets light as default)
  let currentTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', currentTheme);

  // Sets Icon based on theme
  if (currentTheme === 'dark') {
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
  }

  themeToggleButton.addEventListener('click', () => {
    currentTheme = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    
    // Toggle the Icon
    if (currentTheme === 'dark') {
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
    } else {
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
    }
  });

  // Audio Controls
  const audio = document.getElementById('theme-audio');
  const playPauseButton = document.getElementById('play-pause-button');
  const playPauseIcon = document.getElementById('play-pause-icon');
  const volumeSlider = document.getElementById('volume-slider');

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

  volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
  });
});