// Shared validation utilities for API endpoints

export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  // Remove control characters and dangerous patterns
  return input
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Control characters
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Script tags
    .replace(/javascript:/gi, '') // Javascript URLs
    .replace(/on\w+\s*=/gi, '') // Event handlers
    .trim()
    .slice(0, 5000); // Limit length
}

export function validateUrl(url) {
  try {
    const parsed = new URL(url);
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    // Prevent local URLs
    if (['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname)) {
      throw new Error('Local URLs not allowed');
    }
    return parsed.href;
  } catch (error) {
    throw new Error('Invalid URL format');
  }
}

export function validatePrompt(prompt, minLength = 10, maxLength = 2000) {
  const cleaned = sanitizeInput(prompt);
  
  if (cleaned.length < minLength) {
    throw new Error(`Prompt must be at least ${minLength} characters`);
  }
  
  if (cleaned.length > maxLength) {
    throw new Error(`Prompt must be less than ${maxLength} characters`);
  }
  
  return cleaned;
}

export function createErrorResponse(message, status = 400) {
  return new Response(JSON.stringify({
    error: true,
    message,
    timestamp: new Date().toISOString()
  }), {
    status,
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}

export function createSuccessResponse(data) {
  return new Response(JSON.stringify({
    success: true,
    ...data,
    timestamp: new Date().toISOString()
  }), {
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}