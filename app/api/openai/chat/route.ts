import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { message, assistantId } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!assistantId) {
      return NextResponse.json(
        { error: 'Assistant ID is required' },
        { status: 400 }
      );
    }

    // Create a thread
    const thread = await openai.beta.threads.create();

    // Add a message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: message,
    });

    // Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    // Poll for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    
    // Wait for the run to complete (with a timeout)
    const startTime = Date.now();
    const timeout = 30000; // 30 seconds timeout
    
    while (runStatus.status !== 'completed' && runStatus.status !== 'failed') {
      // Check for timeout
      if (Date.now() - startTime > timeout) {
        return NextResponse.json(
          { error: 'Request timed out' },
          { status: 504 }
        );
      }
      
      // Wait for a second before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    if (runStatus.status === 'failed') {
      return NextResponse.json(
        { error: 'Assistant run failed', details: runStatus },
        { status: 500 }
      );
    }

    // Get the messages from the thread
    const messages = await openai.beta.threads.messages.list(thread.id);
    
    // Find the assistant's response (the last message from the assistant)
    const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
    
    if (assistantMessages.length === 0) {
      return NextResponse.json(
        { error: 'No response from assistant' },
        { status: 500 }
      );
    }

    // Get the latest assistant message
    const latestMessage = assistantMessages[0];
    
    // Extract the text content from the message
    let assistantResponse = '';
    if (latestMessage.content && latestMessage.content.length > 0) {
      const textContent = latestMessage.content.filter(content => content.type === 'text');
      if (textContent.length > 0 && 'text' in textContent[0]) {
        assistantResponse = textContent[0].text.value;
      }
    }

    // Return the assistant's response
    return NextResponse.json({ assistantResponse });
    
  } catch (error) {
    console.error('Error in OpenAI chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
