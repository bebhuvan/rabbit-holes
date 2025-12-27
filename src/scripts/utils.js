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
    const platform = button.dataset.platform || 'default';
    
    if (!url) return;

    // Platform-specific sharing
    if (platform !== 'default') {
      this.shareToPlatform(platform, title, url);
      return;
    }

    // Use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: title,
        url: url,
        text: title
      }).catch(() => {
        // If share is cancelled or fails, show platform options
        this.showShareMenu(button, title, url);
      });
    } else {
      // Show platform options
      this.showShareMenu(button, title, url);
    }
  },

  shareToPlatform(platform, title, url) {
    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(url);
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      hackernews: `https://news.ycombinator.com/submitlink?u=${encodedUrl}&t=${encodedTitle}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedTitle}%0A%0A${encodedUrl}`
    };

    if (shareUrls[platform]) {
      if (platform === 'email') {
        window.location.href = shareUrls[platform];
      } else {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      }
    }
  },

  showShareMenu(button, title, url) {
    // Remove existing menu
    const existingMenu = document.querySelector('.share-menu');
    if (existingMenu) {
      existingMenu.remove();
    }

    // Create share menu
    const menu = document.createElement('div');
    menu.className = 'share-menu';
    menu.innerHTML = `
      <div class="share-menu-content">
        <h3>Share this post</h3>
        <div class="share-options">
          <button class="share-option" data-platform="twitter">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
            </svg>
            Twitter
          </button>
          <button class="share-option" data-platform="facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
          <button class="share-option" data-platform="linkedin">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </button>
          <button class="share-option" data-platform="reddit">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.726-.73a.326.326 0 0 0-.018-.094z"/>
            </svg>
            Reddit
          </button>
          <button class="share-option" data-platform="email">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Email
          </button>
          <button class="share-option copy-option">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            Copy Link
          </button>
        </div>
        <button class="share-menu-close">&times;</button>
      </div>
    `;

    // Position menu
    const rect = button.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = '50%';
    menu.style.left = '50%';
    menu.style.transform = 'translate(-50%, -50%)';
    menu.style.zIndex = '1000';

    document.body.appendChild(menu);

    // Add event listeners
    menu.addEventListener('click', (e) => {
      if (e.target.closest('.share-option')) {
        const platform = e.target.closest('.share-option').dataset.platform;
        if (platform) {
          this.shareToPlatform(platform, title, url);
        } else if (e.target.closest('.copy-option')) {
          this.copyToClipboard(url);
        }
        menu.remove();
      } else if (e.target.closest('.share-menu-close')) {
        menu.remove();
      }
    });

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target)) {
          menu.remove();
        }
      }, { once: true });
    }, 100);
  }
};

// Theme Management - Simplified and more reliable
export const theme = {
  init() {
    // Theme already initialized by inline script, just update toggle button
    this.updateToggle();
    
    // Theme system ready
  },

  set(theme) {
    // Setting theme
    
    // Set the data-theme attribute
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update button state
    this.updateToggle();
    
    // Log for debugging
    // Theme set successfully
  },

  toggle() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Toggling theme
    this.set(newTheme);
  },

  updateToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) {
      // Theme toggle button not found
      return;
    }
    
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const isDark = currentTheme === 'dark';
    
    toggle.setAttribute('aria-pressed', isDark.toString());
    
    // Toggle updated
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
    // mobileMenu.init(); // Handled inline in Base.astro
    shortcuts.init();
    postActions.init();
    
    // App initialized
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}