# Dynamic Quick Prompts Feature

## Overview

The "Quick Prompts" section on the right sidebar now **dynamically changes according to the chat conversation**. Instead of showing static prompts, it intelligently generates relevant follow-up questions based on:

- 💬 **Chat History**: What the student has already asked
- 👤 **Student Profile**: Their interests, skills, and exam results
- 📊 **Conversation Stage**: Number of messages exchanged
- 🎯 **Detected Topics**: Keywords from recent messages

## How It Works

### Prompt Generation Logic

The `generateDynamicPrompts()` function analyzes:

#### **Conversation Stage 0 (No messages)**
- Shows foundational questions to get started
- Examples: "How can I improve my internship profile?", "What skills should I focus on learning?"
- Adapts based on whether student has interests defined

#### **Conversation Stage 1 (1 message)**
- Offers follow-up topics not yet covered
- If they didn't ask about profiles → suggests profile improvement
- If they didn't ask about interviews → suggests interview prep
- Varies based on student's skills and interests

#### **Conversation Stage 2-4 (2-4 messages)**
- Provides deeper dives into detected topics
- **If discussing skills**: "How do I build projects to showcase my skills?", "What certifications would help?"
- **If discussing career**: "What companies are hiring in my field?", "What growth opportunities exist?"
- **If discussing interviews**: "How should I answer behavioral questions?"
- **Otherwise**: General tech trends, networking advice

#### **Conversation Stage 5+ (5+ messages)**
- Advanced questions for ongoing learning
- Examples: "How can I improve my academic performance?", "What next steps after internship?"
- Personalized based on exam results and interests

### Topic Detection

The system detects conversation topics by scanning recent messages for keywords:

```javascript
{
  skills: ['skill', 'learn', 'capability'],
  career: ['career', 'path', 'role'],
  interview: ['interview', 'prepare', 'practice'],
  profile: ['profile', 'improve', 'strengthen'],
  internship: ['internship', 'placement', 'opportunity']
}
```

### Randomization

Each time prompts are regenerated, they're:
1. Deduplicated (no repeated suggestions)
2. Shuffled randomly 
3. Limited to top 4 most relevant options

## Code Structure

### State Management

```javascript
const [dynamicPrompts, setDynamicPrompts] = useState([])
const [chatHistory, setChatHistory] = useState([])
```

### Update Trigger

Updates whenever any of these change:

```javascript
useEffect(() => {
  const prompts = generateDynamicPrompts(
    chatHistory, 
    interests, 
    skills, 
    examResults
  )
  setDynamicPrompts(prompts)
}, [chatHistory, interests, skills, examResults])
```

### Rendering

```jsx
{dynamicPrompts.map((prompt) => (
  <button
    key={prompt}
    onClick={() => sendMessage(prompt)}
    // ... styling
  >
    {prompt}
  </button>
))}
```

## User Experience Benefits

✅ **Guided Conversation**: Students always know what to ask next  
✅ **Progressive Learning**: Questions get more advanced as chat deepens  
✅ **Contextual Relevance**: Prompts match student's profile and progress  
✅ **No Repetition**: Avoids redundant suggestions  
✅ **Smart**: Understands what's already been discussed  

## Example Flow

### Start of Chat (0 messages)
```
"How can I improve my internship profile?"
"What skills should I focus on learning?"
"Help me prepare for internship interviews"
"Suggest career paths based on my interests"
```

### After 1 message about skills
```
"How do I build projects to showcase my skills?"
"Give me interview preparation tips"
"What new technical skills should I learn?"
"What makes a strong internship application?"
```

### After 4 messages discussing careers
```
"How do I build projects to showcase my skills?"
"What companies are hiring in my field?"
"What growth opportunities exist in these roles?"
"How should I answer behavioral questions?"
```

### After 5+ messages
```
"How can I improve my academic performance?" (if has exam results)
"How do my interests align with market demand?" (if has interests)
"What next steps should I take after this internship?"
"How do I create a 6-month learning roadmap?"
```

## Customization

To adjust the prompt generation logic, edit the `generateDynamicPrompts()` function in:

**File**: `client/src/components/student_guidance/AskInternConnectSection.jsx`

### Common Customizations

**Add more stages:**
```javascript
else if (messageCount === 6) {
  prompts.push('Advanced question here...')
}
```

**Change topic keywords:**
```javascript
const topics = {
  customTopic: recentChat.includes('keyword1') || recentChat.includes('keyword2')
}
```

**Modify prompt options:**
```javascript
prompts.push('Your new prompt here')
```

## Testing the Feature

1. **Start a fresh chat**: See foundational prompts
2. **Ask about skills**: Observe prompts shift to skill-building focus
3. **Ask about careers**: See career-specific suggestions
4. **Continue chatting**: Prompts evolve with conversation
5. **Update interests/skills**: Prompts regenerate automatically

## Technical Notes

- **Computation**: Lightweight logic, runs on every chat history change
- **Performance**: No API calls; purely client-side generation
- **Responsive**: Updates in real-time as user interacts
- **Fallback**: Always shows at least 2-4 relevant prompts

## Related Components

- **Component**: [AskInternConnectSection.jsx](../../client/src/components/student_guidance/AskInternConnectSection.jsx)
- **Function**: `generateDynamicPrompts(chatHistory, interests, skills, examResults)`
- **Triggers**: Chat history, interests, skills, exam results changes

## Future Enhancements

- 🤖 AI-powered prompt generation using LLM
- 📝 Personalized prompts based on resume/CV
- 🎯 A/B testing different prompt strategies
- 📈 Analytics on which prompts are most clicked
- 🌐 Multi-language support

---

**Status**: ✅ Implemented and tested  
**Build**: ✅ Passes without errors  
**Last Updated**: 2026-04-10
