/**
 * Generates a meaningful chat title based on the conversation content
 */

interface Message {
  content: string
  role: string
  is_ai?: boolean
}

export const generateChatTitle = (messages: Message[]): string => {
  if (messages.length === 0) {
    return 'New Chat'
  }

  // Get the first user message (usually the most descriptive)
  const firstUserMessage = messages.find(msg => !msg.is_ai && msg.role !== 'assistant')
  
  if (!firstUserMessage) {
    return 'New Chat'
  }

  const content = firstUserMessage.content.trim()
  
  // If message is too short, use it as is
  if (content.length <= 30) {
    return content
  }

  // Extract key topics and create a title
  const title = extractTitle(content)
  return title || content.substring(0, 30) + '...'
}

const extractTitle = (content: string): string | null => {
  const text = content.toLowerCase()
  
  // Common question patterns
  const questionPatterns = [
    /^(what|how|why|when|where|who|which|can|could|would|should|is|are|do|does|did)\s+(.+?)[?.]?$/,
    /^(tell me about|explain|describe|help me with|i need help with|i want to know about)\s+(.+?)[?.]?$/,
    /^(create|make|build|generate|write|design)\s+(.+?)[?.]?$/,
    /^(fix|solve|debug|troubleshoot|resolve)\s+(.+?)[?.]?$/
  ]

  for (const pattern of questionPatterns) {
    const match = text.match(pattern)
    if (match && match[2]) {
      let topic = match[2].trim()
      
      // Clean up the topic
      topic = topic.replace(/^(a|an|the)\s+/, '') // Remove articles
      topic = topic.replace(/\s+(please|for me|help)$/, '') // Remove politeness words
      topic = topic.charAt(0).toUpperCase() + topic.slice(1) // Capitalize first letter
      
      // Limit length
      if (topic.length > 40) {
        topic = topic.substring(0, 40) + '...'
      }
      
      return topic
    }
  }

  // Topic extraction patterns
  const topicPatterns = [
    /\b(about|regarding|concerning)\s+(.+?)[?.,]?$/,
    /\b(with|using|for)\s+([a-zA-Z0-9\s]+)/,
    /\b(problem|issue|error|bug)\s+(with|in|on)\s+(.+?)[?.,]?$/
  ]

  for (const pattern of topicPatterns) {
    const match = text.match(pattern)
    if (match && match[2]) {
      let topic = match[2].trim()
      topic = topic.charAt(0).toUpperCase() + topic.slice(1)
      
      if (topic.length > 40) {
        topic = topic.substring(0, 40) + '...'
      }
      
      return topic
    }
  }

  // Programming/technical keywords
  const techKeywords = [
    'javascript', 'python', 'react', 'node', 'api', 'database', 'sql', 'html', 'css',
    'typescript', 'vue', 'angular', 'express', 'mongodb', 'postgresql', 'mysql',
    'docker', 'kubernetes', 'aws', 'azure', 'git', 'github', 'deployment', 'server',
    'frontend', 'backend', 'fullstack', 'web development', 'mobile app', 'ios', 'android'
  ]

  for (const keyword of techKeywords) {
    if (text.includes(keyword)) {
      const words = content.split(' ')
      const keywordIndex = words.findIndex(word => word.toLowerCase().includes(keyword))
      
      if (keywordIndex !== -1) {
        // Take a few words around the keyword
        const start = Math.max(0, keywordIndex - 1)
        const end = Math.min(words.length, keywordIndex + 3)
        let title = words.slice(start, end).join(' ')
        
        title = title.charAt(0).toUpperCase() + title.slice(1)
        if (title.length > 40) {
          title = title.substring(0, 40) + '...'
        }
        
        return title
      }
    }
  }

  // Fallback: take first meaningful sentence
  const sentences = content.split(/[.!?]+/)
  if (sentences.length > 0 && sentences[0].trim().length > 5) {
    let title = sentences[0].trim()
    title = title.charAt(0).toUpperCase() + title.slice(1)
    
    if (title.length > 40) {
      title = title.substring(0, 40) + '...'
    }
    
    return title
  }

  return null
}

// Alternative: Use AI to generate title (if you want to use the AI for this)
export const generateAITitle = async (messages: Message[]): Promise<string> => {
  if (messages.length === 0) {
    return 'New Chat'
  }

  // This would require an API call to your AI service
  // For now, we'll use the rule-based approach above
  return generateChatTitle(messages)
}
