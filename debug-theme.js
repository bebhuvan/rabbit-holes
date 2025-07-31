// Debug theme functionality
console.log('=== THEME DEBUG ===');

// Check current theme
const currentTheme = document.documentElement.getAttribute('data-theme');
console.log('Current data-theme attribute:', currentTheme);

// Check localStorage
const savedTheme = localStorage.getItem('theme');
console.log('Saved theme in localStorage:', savedTheme);

// Check if theme toggle button exists
const themeToggle = document.getElementById('theme-toggle');
console.log('Theme toggle button found:', !!themeToggle);

if (themeToggle) {
  console.log('Theme toggle button:', themeToggle);
  console.log('Button event listeners:', themeToggle.onclick);
  
  // Test clicking the button
  console.log('Testing theme toggle...');
  themeToggle.click();
  
  setTimeout(() => {
    const newTheme = document.documentElement.getAttribute('data-theme');
    console.log('Theme after click:', newTheme);
  }, 100);
}

// Check CSS variables
const computedStyle = getComputedStyle(document.documentElement);
console.log('CSS --color-bg:', computedStyle.getPropertyValue('--color-bg'));
console.log('CSS --color-text-primary:', computedStyle.getPropertyValue('--color-text-primary'));

// Check if dark mode styles are loaded
const darkModeTest = window.matchMedia('(prefers-color-scheme: dark)');
console.log('System prefers dark:', darkModeTest.matches);