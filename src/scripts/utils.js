// JavaScript Utilities - Clean & Functional

// Post Actions (Copy Link & Share)
export const postActions = {
  init() {
    // Copy link buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.copy-link-btn')) {
        this.copyLink(e.target.closest('.copy-link-btn'));
      }
    });

    // Share buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.share-btn')) {
        this.share(e.target.closest('.share-btn'));
      }
    });
  },

  async copyLink(button) {
    const url = button.dataset.url;
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      
      // Visual feedback
      const originalText = button.querySelector('svg').nextSibling.textContent.trim();
      button.classList.add('copied');
      button.querySelector('svg').nextSibling.textContent = ' Copied!';
      
      setTimeout(() => {
        button.classList.remove('copied');
        button.querySelector('svg').nextSibling.textContent = ` ${originalText}`;
      }, 2000);
      
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      // Still show feedback
      button.classList.add('copied');
      setTimeout(() => button.classList.remove('copied'), 2000);
    }
  },

  share(button) {
    const url = button.dataset.url;
    const title = button.dataset.title;
    
    if (!url) return;

    // Use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: title,
        url: url
      }).catch(() => {
        // If share is cancelled or fails, fall back to copy
        this.copyLink(button);
      });
    } else {
      // Fallback: open share menu or copy link
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
      window.open(shareUrl, '_blank', 'width=550,height=420');
    }
  }
};

// Theme Management - Simplified and more reliable
export const theme = {
  init() {
    // Theme already initialized by inline script, just update toggle button
    this.updateToggle();
    
    console.log('Theme system ready. Current theme:', document.documentElement.getAttribute('data-theme'));
  },

  set(theme) {
    console.log('Setting theme to:', theme);
    
    // Set the data-theme attribute
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update button state
    this.updateToggle();
    
    // Log for debugging
    console.log('Theme set. Current attribute:', document.documentElement.getAttribute('data-theme'));
  },

  toggle() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    console.log('Toggling theme from', currentTheme, 'to', newTheme);
    this.set(newTheme);
  },

  updateToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) {
      console.log('Theme toggle button not found');
      return;
    }
    
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const isDark = currentTheme === 'dark';
    
    toggle.setAttribute('aria-pressed', isDark.toString());
    
    console.log('Toggle updated. Theme:', currentTheme, 'isDark:', isDark);
  }
};

// Share Functionality
export const share = {
  async sharePost(title, url) {
    const fullUrl = window.location.origin + url;
    
    if (navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl });
        return { success: true, method: 'native' };
      } catch (error) {
        if (error.name !== 'AbortError') {
          return this.copyToClipboard(fullUrl);
        }
        return { success: false, error: 'Share cancelled' };
      }
    }
    
    return this.copyToClipboard(fullUrl);
  },

  async copyToClipboard(text) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      this.showFeedback('Link copied to clipboard');
      return { success: true, method: 'clipboard' };
    } catch (error) {
      this.showFeedback('Failed to copy link', 'error');
      return { success: false, error: error.message };
    }
  },

  showFeedback(message, type = 'success') {
    // Create or update feedback element
    let feedback = document.getElementById('share-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.id = 'share-feedback';
      feedback.className = 'share-feedback';
      document.body.appendChild(feedback);
    }
    
    feedback.textContent = message;
    feedback.className = `share-feedback share-feedback--${type} share-feedback--visible`;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      feedback.className = 'share-feedback';
    }, 3000);
  }
};

// Mobile Menu
export const mobileMenu = {
  init() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('nav-links');
    
    if (!toggle || !menu) return;
    
    toggle.addEventListener('click', () => this.toggle());
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('nav-links--open')) {
        this.close();
      }
    });
    
    // Close when clicking nav links
    menu.addEventListener('click', (e) => {
      if (e.target.classList.contains('nav-link')) {
        this.close();
      }
    });
  },

  toggle() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('nav-links');
    
    const isOpen = menu.classList.contains('nav-links--open');
    
    if (isOpen) {
      this.close();
    } else {
      this.open();
    }
  },

  open() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('nav-links');
    
    menu.classList.add('nav-links--open');
    toggle.classList.add('mobile-menu-toggle--active');
    toggle.setAttribute('aria-expanded', 'true');
  },

  close() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('nav-links');
    
    menu.classList.remove('nav-links--open');
    toggle.classList.remove('mobile-menu-toggle--active');
    toggle.setAttribute('aria-expanded', 'false');
  }
};

// Search Functionality
export const search = {
  init(searchData) {
    this.data = searchData;
    this.setupEventListeners();
  },

  setupEventListeners() {
    const input = document.getElementById('search-input');
    const button = document.getElementById('search-button');
    
    if (input) {
      input.addEventListener('input', (e) => this.handleInput(e.target.value));
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.performSearch(e.target.value);
        }
      });
    }
    
    if (button) {
      button.addEventListener('click', () => {
        this.performSearch(input?.value || '');
      });
    }
  },

  handleInput(query) {
    if (query.length >= 3) {
      this.performSearch(query);
    } else if (query.length === 0) {
      this.clearResults();
    }
  },

  performSearch(query) {
    if (!query.trim()) return;
    
    const results = this.searchPosts(query);
    this.displayResults(results, query);
  },

  searchPosts(query) {
    const lowerQuery = query.toLowerCase();
    
    return this.data.filter(post => {
      const searchText = [
        post.title,
        post.content,
        post.description,
        ...post.tags
      ].join(' ').toLowerCase();
      
      return searchText.includes(lowerQuery);
    });
  },

  displayResults(results, query) {
    const container = document.getElementById('search-results');
    const status = document.getElementById('search-status');
    
    if (!container || !status) return;
    
    if (results.length === 0) {
      status.textContent = `No results found for "${query}"`;
      container.innerHTML = '';
      return;
    }
    
    status.textContent = `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`;
    
    container.innerHTML = results.map(post => `
      <article class="search-result">
        <h3 class="search-result-title">
          <a href="/posts/${post.slug}">${post.title}</a>
        </h3>
        <p class="search-result-snippet">${this.generateSnippet(post, query)}</p>
        <div class="search-result-meta">
          <span class="post-type-indicator post-type-indicator--${post.type}"></span>
          <span class="search-result-type">${post.type}</span>
          <span class="search-result-date">${new Date(post.date).toLocaleDateString()}</span>
        </div>
      </article>
    `).join('');
  },

  generateSnippet(post, query) {
    const content = post.content || post.description || '';
    const maxLength = 150;
    const lowerQuery = query.toLowerCase();
    
    const queryIndex = content.toLowerCase().indexOf(lowerQuery);
    
    if (queryIndex !== -1) {
      const start = Math.max(0, queryIndex - 50);
      const end = Math.min(content.length, queryIndex + 100);
      let snippet = content.slice(start, end);
      
      if (start > 0) snippet = '...' + snippet;
      if (end < content.length) snippet = snippet + '...';
      
      return snippet;
    }
    
    return content.length > maxLength ? 
      content.slice(0, maxLength) + '...' : 
      content;
  },

  clearResults() {
    const container = document.getElementById('search-results');
    const status = document.getElementById('search-status');
    
    if (container) container.innerHTML = '';
    if (status) status.textContent = 'Start typing to search...';
  }
};

// Keyboard Shortcuts
export const shortcuts = {
  init() {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
        } else {
          window.location.href = '/search';
        }
      }
      
      // Cmd/Ctrl + / for theme toggle
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        theme.toggle();
      }
    });
  }
};

// Form Utilities
export const forms = {
  validate(form) {
    const errors = [];
    const formData = new FormData(form);
    
    // Add validation rules as needed
    for (const [name, value] of formData.entries()) {
      const input = form.querySelector(`[name="${name}"]`);
      const required = input?.hasAttribute('required');
      
      if (required && !value.trim()) {
        errors.push(`${name} is required`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  showErrors(form, errors) {
    // Clear existing errors
    form.querySelectorAll('.form-error').forEach(el => el.remove());
    
    // Show new errors
    errors.forEach(error => {
      const errorEl = document.createElement('div');
      errorEl.className = 'form-error';
      errorEl.textContent = error;
      form.appendChild(errorEl);
    });
  }
};

// Initialize everything
export const app = {
  init() {
    mobileMenu.init();
    shortcuts.init();
    postActions.init();
    
    console.log('App initialized (theme handled separately)');
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}