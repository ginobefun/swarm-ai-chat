# LangGraph Orchestrator for SwarmAI.chat

This module implements multi-agent collaboration using LangGraph for the SwarmAI.chat platform.

## Architecture Overview

The orchestrator uses LangGraph to create a state machine that manages the flow of tasks between multiple AI agents:

```
User Message → Moderator → Task Planning → Task Router → Agent Execution → Results Summary
                  ↓
             Clarification
             (if needed)
```

## Core Components

### 1. Moderator Node
The moderator is the central coordinator that:
- Analyzes user intent
- Requests clarification when needed
- Plans tasks based on available agents
- Summarizes results from all agents

### 2. Task Router
Routes tasks to appropriate agents based on:
- Agent capabilities
- Task requirements
- Concurrency limits

### 3. Agent Nodes
Specialized agents that execute specific tasks:
- **Research Analyst**: Information gathering and analysis
- **Critical Thinker**: Logical evaluation and critique
- **Technical Architect**: Software design and implementation

## User Stories

### Story 1: Article Reading Assistant

```typescript
// User sends article link
"Please analyze this article: https://example.com/article"

// Moderator clarifies
"What aspects of the article would you like me to focus on? 
(e.g., key points, critical analysis, business insights)"

// User confirms
"Focus on the business model and potential risks"

// Moderator creates tasks
Task 1: Extract key business model points → Research Analyst
Task 2: Analyze competitive advantages → Research Analyst
Task 3: Evaluate risks and assumptions → Critical Thinker

// Agents work in parallel, then moderator summarizes
```

### Story 2: Requirements Development

```typescript
// User sends requirements
"We need a real-time collaboration feature for our app"

// Moderator clarifies
"Could you specify: 1) Target users? 2) Key features? 3) Technical constraints?"

// User provides details
"For remote teams, with video/audio/screen sharing, must work on web and mobile"

// Moderator creates tasks
Task 1: Design system architecture → Technical Architect
Task 2: Identify technical challenges → Technical Architect  
Task 3: Analyze similar solutions → Research Analyst
Task 4: Review scalability concerns → Critical Thinker

// Results are compiled into comprehensive technical plan
```

## API Usage

### 1. Dispatch Endpoint

```typescript
POST /api/chat/{sessionId}/dispatch
{
  "message": "Your request here",
  "userId": "user-id",
  "confirmedIntent": "optional - for clarification responses"
}

Response:
{
  "success": true,
  "turnIndex": 1,
  "shouldClarify": false,
  "clarificationQuestion": "...",
  "summary": "Final summary...",
  "events": [...],
  "tasks": [...],
  "results": [...],
  "costUSD": 0.0234
}
```

### 2. Control Endpoint

```typescript
POST /api/chat/{sessionId}/control
{
  "action": "cancel" | "resume",
  "userId": "user-id"
}
```

## Integration Guide

### 1. Create a Session with Agents

First, create a chat session with multiple AI agents:

```typescript
// Create session with article-reading agents
const session = await createSession({
  title: "Article Analysis",
  createdById: userId,
  participants: [
    'article-summarizer',  // Research Analyst
    'critical-thinker',    // Critical Analysis Expert
  ]
})
```

### 2. Use the OrchestratorChat Component

```typescript
import { OrchestratorChat } from '@/components/chat/OrchestratorChat'

function MyChat() {
  return (
    <OrchestratorChat 
      sessionId={session.id} 
      userId={currentUser.id} 
    />
  )
}
```

### 3. Handle Clarifications

When the orchestrator needs clarification:

1. The API returns `shouldClarify: true` with a `clarificationQuestion`
2. Display the question to the user
3. Send their response with `confirmedIntent` in the next request

## Technical Details

### State Management

The orchestrator maintains state using LangGraph's channels:

```typescript
interface OrchestratorState {
  sessionId: string
  turnIndex: number
  userMessage: string
  confirmedIntent?: string
  tasks: Task[]
  inFlight: Record<string, Task>
  results: Result[]
  summary?: string
  events: GraphEvent[]
  costUSD: number
  shouldClarify?: boolean
  clarificationQuestion?: string
  isCancelled?: boolean
}
```

### Adding New Agents

1. Create agent class extending `BaseAgentNode`:

```typescript
export class MyCustomAgent extends BaseAgentNode {
  protected getModelName(): string {
    return 'openai/gpt-4o'
  }
  
  protected getSystemPrompt(): string {
    return `You are a specialized agent...`
  }
}
```

2. Register in `agentCatalog.ts`:

```typescript
this.registerAgent(myAgentCapability, MyCustomAgent)
```

### Cost Tracking

Each agent execution tracks:
- Token usage
- Processing time
- Estimated cost based on model pricing

Total cost is accumulated in `state.costUSD`.

## Troubleshooting

### Common Issues

1. **"No agents in session"**
   - Ensure session has participants with agent IDs
   - Check that agents are registered in catalog

2. **Tasks not executing**
   - Verify agent capabilities match task types
   - Check concurrency limits
   - Look for failed dependencies

3. **High latency**
   - Consider using faster models (e.g., Gemini Flash)
   - Reduce number of parallel tasks
   - Cache common patterns

### Debug Mode

Enable detailed logging:

```typescript
console.log('🎯 Moderator processing state:', state)
console.log('🚦 TaskRouter processing:', taskInfo)
console.log('🤖 Agent processing task:', task)
```

## Future Enhancements

- [ ] Streaming responses via SSE
- [ ] Agent hot-reloading
- [ ] Custom task types
- [ ] Advanced collaboration patterns (debate, voting)
- [ ] Integration with external tools
- [ ] Performance metrics dashboard