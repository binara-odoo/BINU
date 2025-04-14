// Function to update video source based on theme
function updateVideoSource() {
  const isDarkTheme = document.documentElement.classList.contains('dark-theme');
  const videoSource = document.querySelector('#video-bg source');
  
  if (videoSource) {
    const lightSrc = videoSource.getAttribute('data-light-src');
    const darkSrc = videoSource.getAttribute('data-dark-src');
    
    if (isDarkTheme && videoSource.src !== darkSrc) {
      videoSource.src = darkSrc;
      // Reload the video
      const video = document.getElementById('video-bg');
      if (video) {
        video.load();
        video.play();
      }
    } else if (!isDarkTheme && videoSource.src !== lightSrc) {
      videoSource.src = lightSrc;
      // Reload the video
      const video = document.getElementById('video-bg');
      if (video) {
        video.load();
        video.play();
      }
    }
  }
}

// Update video source when theme changes
document.addEventListener('DOMContentLoaded', updateVideoSource);

// Create a MutationObserver to watch for theme changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'class') {
      updateVideoSource();
    }
  });
});

// Start observing the html element for class changes
observer.observe(document.documentElement, { attributes: true }); 