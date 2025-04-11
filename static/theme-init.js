// Theme initialization script
(function() {
  // Get saved theme or default to light
  const savedTheme = localStorage.getItem('theme') || 'light';
  
  // Apply theme immediately
  document.documentElement.classList.add(savedTheme + '-theme');
  
  // Add a class to indicate the script has run
  document.documentElement.classList.add('theme-initialized');
})(); 