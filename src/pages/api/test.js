export async function GET({ request }) {
  const url = new URL(request.url);
  return new Response(JSON.stringify({
    message: 'Test endpoint working',
    url: request.url,
    searchParams: Object.fromEntries(url.searchParams.entries())
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    return new Response(JSON.stringify({
      message: 'POST working',
      received: body
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'POST failed',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}