/**
 * Orchestrator Chat Component
 * Handles multi-agent collaboration with LangGraph
 */

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, CheckCircle2, Clock, AlertCircle, Sparkles } from 'lucide-react'
import type { GraphEvent, Task, Result } from '@/lib/orchestrator/types'

interface OrchestratorChatProps {
  sessionId: string
  userId: string
}

interface OrchestratorResponse {
  success: boolean
  turnIndex: number
  shouldClarify?: boolean
  clarificationQuestion?: string
  summary?: string
  events: GraphEvent[]
  tasks: Task[]
  results: Array<{
    taskId: string
    agentId: string
    content: string
  }>
  costUSD: number
}

export function OrchestratorChat({ sessionId, userId }: OrchestratorChatProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentResponse, setCurrentResponse] = useState<OrchestratorResponse | null>(null)
  const [message, setMessage] = useState('')
  const [confirmedIntent, setConfirmedIntent] = useState<string>('')

  const handleSendMessage = async () => {
    if (!message.trim() || isProcessing) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/chat/${sessionId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          userId,
          confirmedIntent: confirmedIntent || undefined
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data: OrchestratorResponse = await response.json()
      setCurrentResponse(data)
      
      // Clear message and intent after successful send
      setMessage('')
      setConfirmedIntent('')
      
      // If clarification is needed, we'll need to handle the response
      if (data.shouldClarify) {
        console.log('Clarification needed:', data.clarificationQuestion)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancelFlow = async () => {
    try {
      await fetch(`/api/chat/${sessionId}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          userId
        })
      })
    } catch (error) {
      console.error('Error cancelling flow:', error)
    }
  }

  const renderEvent = (event: GraphEvent) => {
    const icons = {
      ask_user: <MessageCircle className="w-4 h-4" />,
      tasks_created: <Sparkles className="w-4 h-4" />,
      task_start: <Clock className="w-4 h-4" />,
      agent_reply: <MessageCircle className="w-4 h-4" />,
      task_done: <CheckCircle2 className="w-4 h-4" />,
      summary: <Sparkles className="w-4 h-4" />,
      flow_cancelled: <AlertCircle className="w-4 h-4" />,
      system: <AlertCircle className="w-4 h-4" />
    }

    return (
      <div key={event.id} className="flex items-start gap-3 p-3 border-b last:border-0">
        <div className="text-muted-foreground">
          {icons[event.type]}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium capitalize">
              {event.type.replace('_', ' ')}
            </span>
            {event.agentId && (
              <Badge variant="secondary" className="text-xs">
                {event.agentId}
              </Badge>
            )}
          </div>
          {event.content && (
            <p className="text-sm text-muted-foreground">
              {event.content}
            </p>
          )}
        </div>
      </div>
    )
  }

  const renderTask = (task: Task) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    }

    return (
      <Card key={task.id} className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium">{task.title}</h4>
          <Badge className={statusColors[task.status]}>
            {task.status.replace('_', ' ')}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          {task.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Assigned to: {task.assignedTo}</span>
          <span>•</span>
          <span>Priority: {task.priority}</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">AI Collaboration Session</h2>
        {currentResponse && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">
              Turn #{currentResponse.turnIndex}
            </span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              Cost: ${currentResponse.costUSD.toFixed(4)}
            </span>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="events" className="h-full">
          <TabsList className="mx-4">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="h-full overflow-y-auto">
            <div className="p-4">
              {currentResponse?.events.map(renderEvent)}
              {!currentResponse && (
                <p className="text-center text-muted-foreground py-8">
                  Send a message to start the collaboration
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="h-full overflow-y-auto">
            <div className="p-4 space-y-3">
              {currentResponse?.tasks.map(renderTask)}
              {!currentResponse?.tasks.length && (
                <p className="text-center text-muted-foreground py-8">
                  No tasks created yet
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="results" className="h-full overflow-y-auto">
            <div className="p-4 space-y-4">
              {currentResponse?.results.map((result) => (
                <Card key={result.taskId} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{result.agentId}</Badge>
                    <span className="text-sm text-muted-foreground">
                      Task: {result.taskId}
                    </span>
                  </div>
                  <p className="text-sm">{result.content}</p>
                </Card>
              ))}
              {!currentResponse?.results.length && (
                <p className="text-center text-muted-foreground py-8">
                  No results yet
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Clarification prompt */}
      {currentResponse?.shouldClarify && (
        <div className="p-4 bg-amber-50 border-t border-amber-200">
          <p className="text-sm font-medium text-amber-800 mb-2">
            Clarification needed:
          </p>
          <p className="text-sm text-amber-700 mb-3">
            {currentResponse.clarificationQuestion}
          </p>
          <input
            type="text"
            value={confirmedIntent}
            onChange={(e) => setConfirmedIntent(e.target.value)}
            placeholder="Your response..."
            className="w-full px-3 py-2 text-sm border rounded-md"
          />
        </div>
      )}

      {/* Summary */}
      {currentResponse?.summary && (
        <div className="p-4 bg-green-50 border-t border-green-200">
          <p className="text-sm font-medium text-green-800 mb-2">
            Summary:
          </p>
          <p className="text-sm text-green-700">
            {currentResponse.summary}
          </p>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={
              currentResponse?.shouldClarify 
                ? "Respond to the clarification..." 
                : "Send a message to start collaboration..."
            }
            className="flex-1 px-3 py-2 border rounded-md"
            disabled={isProcessing}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isProcessing || !message.trim()}
          >
            {isProcessing ? 'Processing...' : 'Send'}
          </Button>
          {isProcessing && (
            <Button variant="destructive" onClick={handleCancelFlow}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}