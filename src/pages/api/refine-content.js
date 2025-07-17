// API endpoint for AI content refinement
// This endpoint takes existing content and refines it based on user instructions

export async function POST({ request }) {
  try {
    const { content, instructions } = await request.json();
    
    if (!content?.trim()) {
      return new Response(JSON.stringify({
        error: 'Content is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!instructions?.trim()) {
      return new Response(JSON.stringify({
        error: 'Refinement instructions are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // For now, return a mock refined response
    // In production, this would call Claude API with refinement instructions
    const refinedContent = `${content}

---

**Refined based on:** ${instructions}

This content has been refined according to your specific instructions to better meet your needs.
`;

    return new Response(JSON.stringify({
      content: refinedContent,
      refined: true,
      instructions: instructions
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Refinement error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to refine content',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}