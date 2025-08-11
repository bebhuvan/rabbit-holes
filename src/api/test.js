// Comprehensive API test endpoint
export async function handleTest(request, env, ctx) {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  try {
    // Test environment variables and APIs
    const tests = {
      timestamp: new Date().toISOString(),
      environment: env.ENVIRONMENT || 'development',
      hasClaudeKey: !!env.CLAUDE_API_KEY,
      hasOpenAIKey: !!env.OPENAI_API_KEY,
      hasGitHubToken: !!env.GITHUB_TOKEN,
      hasGitHubRepo: !!env.GITHUB_REPO,
      hasCMSPassword: !!env.CMS_PASSWORD,
    };
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Workers API comprehensive test',
      tests
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}