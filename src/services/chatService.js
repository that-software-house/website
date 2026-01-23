import { marked } from 'marked';

// Configure marked options
marked.setOptions({
  breaks: true, // Convert \n to <br>
  gfm: true, // GitHub Flavored Markdown
});

const API_BASE = '/api/chat';

// Helper function to format structured response with clickable links
const formatStructuredResponse = (structuredData) => {
  if (!structuredData || !structuredData.message) return '';

  let messageText = structuredData.message;

  // Replace link values with markdown links BEFORE parsing
  if (structuredData.links && structuredData.links.length > 0) {
    structuredData.links.forEach(link => {
      const display = link.display || link.value;
      let markdownLink = '';

      // Escape special regex characters in link.value
      const escapedValue = link.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      switch (link.type) {
        case 'email':
          // Only replace if not already in a link format
          markdownLink = `[${display}](mailto:${link.value})`;
          messageText = messageText.replace(new RegExp(`(?<!\\[)${escapedValue}(?!\\])`, 'g'), markdownLink);
          break;
        case 'phone':
          markdownLink = `[${display}](tel:${link.value})`;
          messageText = messageText.replace(new RegExp(`(?<!\\[)${escapedValue}(?!\\])`, 'g'), markdownLink);
          break;
        case 'url':
          markdownLink = `[${display}](${link.value})`;
          // For URLs, be more careful to avoid double-linking
          messageText = messageText.replace(new RegExp(`(?<!\\[|\\()${escapedValue}(?!\\]|\\))`, 'g'), markdownLink);
          break;
        default:
          break;
      }
    });
  }

  // Then convert markdown to HTML with our custom class for links
  const html = marked.parse(messageText);

  // Add chat-link class to all anchor tags
  const formattedMessage = html.replace(/<a /g, '<a class="chat-link" ');

  return formattedMessage;
};

export const sendChatMessage = async (message, conversationHistory = []) => {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, conversationHistory }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const formattedReply = formatStructuredResponse(data.structuredData);
      return {
        success: false,
        reply: formattedReply,
        structuredData: data.structuredData
      };
    }

    const formattedReply = formatStructuredResponse(data.structuredData);

    return {
      success: true,
      reply: formattedReply,
      structuredData: data.structuredData
    };

  } catch (error) {
    console.error('Error calling chat API:', error);

    // Return a user-friendly error message
    const errorResponse = {
      message: 'Sorry, I encountered an error. Please try again or contact us at contact@thatsoftwarehouse.com',
      links: [
        {
          type: 'email',
          value: 'contact@thatsoftwarehouse.com',
          display: 'contact@thatsoftwarehouse.com'
        }
      ]
    };

    return {
      success: false,
      reply: formatStructuredResponse(errorResponse),
      structuredData: errorResponse
    };
  }
};
