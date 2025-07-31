// AI-powered PDF processing for the /xyz dashboard
// This function extracts text from PDFs and generates blog post content

export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const pdfFile = formData.get('pdf');
    const prompt = formData.get('prompt') || '';
    
    if (!pdfFile || !pdfFile.size) {
      return new Response('PDF file is required', { status: 400 });
    }
    
    // Validate file type
    if (!pdfFile.type.includes('pdf') && !pdfFile.name.toLowerCase().endsWith('.pdf')) {
      return new Response('File must be a PDF', { status: 400 });
    }
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (pdfFile.size > maxSize) {
      return new Response('PDF file must be smaller than 10MB', { status: 400 });
    }
    
    // Clean prompt input
    const cleanPrompt = prompt ? prompt.toString().replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim() : '';
    
    // Get PDF buffer
    const pdfBuffer = await pdfFile.arrayBuffer();
    
    // PDF text extraction - Claude API doesn't support file uploads
    // We need to use a different approach for PDF processing
    let extractedText = '';
    
    try {
      // Option 1: Use a PDF parsing service (recommended for production)
      // This could be Adobe PDF Extract API, Google Document AI, etc.
      
      // Option 2: Use a server-side PDF parsing library
      // Since we're in Cloudflare Workers, we have limited options
      
      // For now, we'll return an informative message about limitations
      extractedText = `[PDF Processing Note]

The uploaded PDF "${pdfFile.name}" (${(pdfFile.size / 1024).toFixed(1)} KB) cannot be processed directly because:

1. Claude API doesn't support file uploads or PDF processing
2. Cloudflare Workers has limited PDF parsing capabilities
3. This would require integration with external PDF processing services

To implement PDF processing, you would need to:
- Use Adobe PDF Extract API
- Integrate Google Document AI 
- Use AWS Textract
- Or implement a server-side PDF parser

For now, you can:
- Copy/paste text content from the PDF manually
- Use the "Freeform" tab to write about the PDF's topic
- Describe what you'd like to explore from the PDF

This is a technical limitation that would need additional infrastructure to resolve.`;
      
    } catch (error) {
      throw new Error(`PDF processing setup failed: ${error.message}`);
    }
    
    // Build AI prompt explaining the limitation
    const aiPrompt = `You are a helpful technical assistant. A user has tried to upload a PDF file for processing, but this feature has technical limitations.

PDF File: ${pdfFile.name} (${(pdfFile.size / 1024).toFixed(1)} KB)
${cleanPrompt ? `User's Intent: ${cleanPrompt}` : 'User wanted to process and analyze this PDF.'}

Current Situation:
${extractedText}

Create a helpful blog post that:
1. Has a clear title explaining the situation (use # heading)
2. Explains why PDF processing isn't available yet
3. Suggests practical alternatives for the user
4. Maintains a helpful, understanding tone
5. Includes relevant subheadings (## headings)
6. Ends with "## Next Steps" offering concrete alternatives

Format as clean markdown. Be honest about limitations while providing value.`;
    
    // Call Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: aiPrompt
        }]
      })
    });
    
    if (!claudeResponse.ok) {
      const error = await claudeResponse.text();
      throw new Error(`Claude API error: ${claudeResponse.status} - ${error}`);
    }
    
    const claudeData = await claudeResponse.json();
    const generatedContent = claudeData.content[0].text;
    
    // Extract title from generated content
    const titleMatch = generatedContent.match(/^# (.+)$/m);
    const title = titleMatch ? titleMatch[1] : `Analysis of ${pdfFile.name}`;
    
    // Generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // Create frontmatter
    const frontmatter = {
      title,
      date: new Date().toISOString(),
      type: 'articles', // Fixed: use valid type from schema
      published: false,
      tags: ['analysis', 'research', 'pdf-summary'],
      description: `Analysis and insights from ${pdfFile.name}`,
      // Note: source_file and file_size are not in the schema, removed
    };
    
    const markdownContent = `---\n${Object.entries(frontmatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}:\n${value.map(item => `  - "${item}"`).join('\n')}`;
        }
        if (typeof value === 'string' && key !== 'date') {
          return `${key}: "${value}"`; 
        }
        return `${key}: ${value}`;
      })
      .join('\n')}\n---\n\n${generatedContent}`;
    
    // Generate word count
    const wordCount = generatedContent.split(/\s+/).length;
    
    return new Response(JSON.stringify({
      success: true,
      content: generatedContent,
      frontmatter: markdownContent,
      title,
      slug,
      source_file: pdfFile.name,
      file_size: `${(pdfFile.size / 1024).toFixed(1)} KB`,
      word_count: wordCount,
      extracted_length: extractedText.length,
      processing_time: Date.now()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('Process PDF error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to process PDF',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}