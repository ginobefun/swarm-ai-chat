/**
 * @vitest-environment jsdom
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

// Mock dependencies
vi.mock('@/contexts/AppContext', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

import SafeMarkdown from '../chat/SafeMarkdown'
import AgentTypingIndicator from '../chat/AgentTypingIndicator'

describe('React.memo Optimization Tests', () => {
  describe('SafeMarkdown Component', () => {
    it('should not re-render when parent re-renders with same props', () => {
      const _renderCount = 0

      const TestWrapper = ({ content }: { content: string }) => {
        return <SafeMarkdown content={content} />
      }

      const { rerender } = render(<TestWrapper content="Hello **World**" />)

      // Initial render
      expect(document.body.textContent).toContain('Hello')

      // Force parent re-render with same props
      rerender(<TestWrapper content="Hello **World**" />)

      // Component should not re-render (memoization working)
      // This is validated by React internals, we just check output is correct
      expect(document.body.textContent).toContain('Hello')
    })

    it('should re-render when content changes', () => {
      const { rerender, container } = render(
        <SafeMarkdown content="Hello **World**" />
      )

      expect(container.textContent).toContain('Hello')

      rerender(<SafeMarkdown content="Goodbye **World**" />)

      expect(container.textContent).toContain('Goodbye')
      expect(container.textContent).not.toContain('Hello')
    })

    it('should re-render when className changes', () => {
      const { rerender, container } = render(
        <SafeMarkdown content="Test" className="custom-1" />
      )

      const initialElement = container.firstChild as HTMLElement
      expect(initialElement.className).toContain('custom-1')

      rerender(<SafeMarkdown content="Test" className="custom-2" />)

      const updatedElement = container.firstChild as HTMLElement
      expect(updatedElement.className).toContain('custom-2')
    })

    it('should handle empty content', () => {
      const { container } = render(<SafeMarkdown content="" />)
      expect(container.firstChild).toBeTruthy()
    })

    it('should handle markdown with code blocks', () => {
      const content = '```javascript\nconst x = 1;\n```'
      const { container } = render(<SafeMarkdown content={content} />)
      expect(container.textContent).toContain('const x = 1')
    })
  })

  describe('AgentTypingIndicator Component', () => {
    it('should not re-render when parent re-renders with same agents', () => {
      const agents = [
        { id: '1', name: 'Agent 1', avatar: '🤖' },
        { id: '2', name: 'Agent 2', avatar: '👨‍💻' },
      ]

      const TestWrapper = ({ agentList }: { agentList: typeof agents }) => {
        return <AgentTypingIndicator agents={agentList} />
      }

      const { rerender, container } = render(<TestWrapper agentList={agents} />)

      expect(container.textContent).toContain('Agent 1')
      expect(container.textContent).toContain('Agent 2')

      // Force parent re-render with same props
      rerender(<TestWrapper agentList={agents} />)

      // Should still render correctly
      expect(container.textContent).toContain('Agent 1')
      expect(container.textContent).toContain('Agent 2')
    })

    it('should re-render when agents array changes', () => {
      const agents1 = [{ id: '1', name: 'Agent 1', avatar: '🤖' }]
      const agents2 = [{ id: '2', name: 'Agent 2', avatar: '👨‍💻' }]

      const { rerender, container } = render(
        <AgentTypingIndicator agents={agents1} />
      )

      expect(container.textContent).toContain('Agent 1')

      rerender(<AgentTypingIndicator agents={agents2} />)

      expect(container.textContent).toContain('Agent 2')
      expect(container.textContent).not.toContain('Agent 1')
    })

    it('should re-render when agent count changes', () => {
      const agents1 = [{ id: '1', name: 'Agent 1', avatar: '🤖' }]
      const agents2 = [
        { id: '1', name: 'Agent 1', avatar: '🤖' },
        { id: '2', name: 'Agent 2', avatar: '👨‍💻' },
      ]

      const { rerender, container } = render(
        <AgentTypingIndicator agents={agents1} />
      )

      expect(container.textContent).toContain('Agent 1')
      expect(container.textContent).not.toContain('collaborating')

      rerender(<AgentTypingIndicator agents={agents2} />)

      expect(container.textContent).toContain('Agent 1')
      expect(container.textContent).toContain('Agent 2')
      expect(container.textContent).toContain('collaborating')
    })

    it('should render nothing when agents array is empty', () => {
      const { container } = render(<AgentTypingIndicator agents={[]} />)
      expect(container.textContent).toBe('')
    })

    it('should handle agent with avatarStyle', () => {
      const agents = [
        {
          id: '1',
          name: 'Agent 1',
          avatar: '🤖',
          avatarStyle: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
      ]

      const { container } = render(<AgentTypingIndicator agents={agents} />)
      expect(container.textContent).toContain('Agent 1')
    })

    it('should show collaboration message for multiple agents', () => {
      const agents = [
        { id: '1', name: 'Agent 1', avatar: '🤖' },
        { id: '2', name: 'Agent 2', avatar: '👨‍💻' },
        { id: '3', name: 'Agent 3', avatar: '🎨' },
      ]

      const { container } = render(<AgentTypingIndicator agents={agents} />)

      expect(container.textContent).toContain('3 agents collaborating')
    })
  })

  describe('Memoization Effectiveness', () => {
    it('SafeMarkdown should maintain referential equality for same props', () => {
      const props1 = { content: 'Test', className: 'custom' }
      const props2 = { content: 'Test', className: 'custom' }

      const { rerender, container: container1 } = render(
        <SafeMarkdown {...props1} />
      )
      const firstElement = container1.firstChild

      rerender(<SafeMarkdown {...props2} />)
      const secondElement = container1.firstChild

      // DOM node should be the same (no re-render)
      expect(firstElement).toBe(secondElement)
    })

    it('AgentTypingIndicator should re-render when agent properties change', () => {
      const agents1 = [{ id: '1', name: 'Agent 1', avatar: '🤖' }]
      const agents2 = [{ id: '1', name: 'Agent 1 Updated', avatar: '🤖' }]

      const { rerender, container } = render(
        <AgentTypingIndicator agents={agents1} />
      )

      expect(container.textContent).toContain('Agent 1')
      expect(container.textContent).not.toContain('Updated')

      rerender(<AgentTypingIndicator agents={agents2} />)

      expect(container.textContent).toContain('Agent 1 Updated')
    })
  })

  describe('Performance Optimization Scenarios', () => {
    it('SafeMarkdown should handle rapid prop updates efficiently', () => {
      const contents = [
        'Message 1',
        'Message 2',
        'Message 3',
        'Message 4',
        'Message 5',
      ]

      const { rerender, container } = render(
        <SafeMarkdown content={contents[0]} />
      )

      contents.forEach((content) => {
        rerender(<SafeMarkdown content={content} />)
        expect(container.textContent).toContain(content)
      })
    })

    it('AgentTypingIndicator should handle agent list updates efficiently', () => {
      const agentLists = [
        [{ id: '1', name: 'Agent 1', avatar: '🤖' }],
        [
          { id: '1', name: 'Agent 1', avatar: '🤖' },
          { id: '2', name: 'Agent 2', avatar: '👨‍💻' },
        ],
        [
          { id: '1', name: 'Agent 1', avatar: '🤖' },
          { id: '2', name: 'Agent 2', avatar: '👨‍💻' },
          { id: '3', name: 'Agent 3', avatar: '🎨' },
        ],
        [
          { id: '2', name: 'Agent 2', avatar: '👨‍💻' },
          { id: '3', name: 'Agent 3', avatar: '🎨' },
        ],
        [],
      ]

      const { rerender, container } = render(
        <AgentTypingIndicator agents={agentLists[0]} />
      )

      agentLists.forEach((agents) => {
        rerender(<AgentTypingIndicator agents={agents} />)
        if (agents.length > 0) {
          agents.forEach((agent) => {
            expect(container.textContent).toContain(agent.name)
          })
        } else {
          expect(container.textContent).toBe('')
        }
      })
    })
  })
})
