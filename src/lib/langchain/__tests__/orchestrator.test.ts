/**
 * Multi-Agent Orchestrator Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createOrchestrator,
  createAgentConfig,
  OrchestrationMode,
  MultiAgentOrchestrator,
  SpecialistAgent,
  SupervisorAgent,
} from '../orchestrator';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

// Mock API key for tests
const MOCK_API_KEY = 'test-api-key';
const MOCK_BASE_URL = 'https://test.openrouter.ai/api/v1';

describe('Agent Configuration', () => {
  it('should create agent config with required fields', () => {
    const config = createAgentConfig(
      'test-agent',
      'Test Agent',
      'Test Role',
      'You are a test agent'
    );

    expect(config.id).toBe('test-agent');
    expect(config.name).toBe('Test Agent');
    expect(config.role).toBe('Test Role');
    expect(config.systemPrompt).toContain('You are a test agent');
    expect(config.systemPrompt).toContain('artifact'); // Should include artifact instructions
    expect(config.description).toBe('Test Role');
  });

  it('should create agent config with optional fields', () => {
    const config = createAgentConfig(
      'test-agent',
      'Test Agent',
      'Test Role',
      'You are a test agent',
      {
        description: 'Custom description',
        modelPreference: 'gpt-4',
        temperature: 0.5,
        maxTokens: 1000,
        capabilities: ['search', 'analyze'],
      }
    );

    expect(config.description).toBe('Custom description');
    expect(config.modelPreference).toBe('gpt-4');
    expect(config.temperature).toBe(0.5);
    expect(config.maxTokens).toBe(1000);
    expect(config.capabilities).toEqual(['search', 'analyze']);
  });
});

describe('Multi-Agent Orchestrator', () => {
  let orchestrator: MultiAgentOrchestrator;

  beforeEach(() => {
    orchestrator = createOrchestrator(MOCK_API_KEY, MOCK_BASE_URL);
  });

  describe('Initialization', () => {
    it('should create orchestrator with default mode', () => {
      expect(orchestrator).toBeDefined();
      expect(orchestrator.getMode()).toBe(OrchestrationMode.DYNAMIC);
    });

    it('should create orchestrator with specified mode', () => {
      const sequentialOrchestrator = createOrchestrator(
        MOCK_API_KEY,
        MOCK_BASE_URL,
        OrchestrationMode.SEQUENTIAL
      );

      expect(sequentialOrchestrator.getMode()).toBe(OrchestrationMode.SEQUENTIAL);
    });

    it('should initialize session', () => {
      orchestrator.initSession('test-session-123', {
        title: 'Test Session',
        type: 'GROUP',
      });

      const state = orchestrator.getState();
      expect(state.sessionId).toBe('test-session-123');
      expect(state.metadata.title).toBe('Test Session');
      expect(state.metadata.type).toBe('GROUP');
    });
  });

  describe('Agent Registration', () => {
    it('should register an agent', () => {
      const agentConfig = createAgentConfig(
        'agent-1',
        'Agent 1',
        'Assistant',
        'You are Agent 1'
      );

      orchestrator.registerAgent(agentConfig);

      const agents = orchestrator.getAgents();
      expect(agents).toHaveLength(1);
      expect(agents[0].id).toBe('agent-1');
      expect(agents[0].name).toBe('Agent 1');
    });

    it('should register multiple agents', () => {
      const agent1 = createAgentConfig('agent-1', 'Agent 1', 'Role 1', 'Prompt 1');
      const agent2 = createAgentConfig('agent-2', 'Agent 2', 'Role 2', 'Prompt 2');

      orchestrator.registerAgent(agent1);
      orchestrator.registerAgent(agent2);

      const agents = orchestrator.getAgents();
      expect(agents).toHaveLength(2);
    });

    it('should unregister an agent', () => {
      const agentConfig = createAgentConfig('agent-1', 'Agent 1', 'Role', 'Prompt');
      orchestrator.registerAgent(agentConfig);

      orchestrator.unregisterAgent('agent-1');

      const agents = orchestrator.getAgents();
      expect(agents).toHaveLength(0);
    });
  });

  describe('Conversation State', () => {
    it('should load conversation history', () => {
      const messages = [
        new HumanMessage('Hello'),
        new AIMessage('Hi there!'),
        new HumanMessage('How are you?'),
      ];

      orchestrator.loadHistory(messages);

      const state = orchestrator.getState();
      expect(state.messages).toHaveLength(3);
    });

    it('should get current state', () => {
      orchestrator.initSession('session-1');
      const agentConfig = createAgentConfig('agent-1', 'Agent 1', 'Role', 'Prompt');
      orchestrator.registerAgent(agentConfig);

      const state = orchestrator.getState();

      expect(state.sessionId).toBe('session-1');
      expect(state.participants).toContain('agent-1');
      expect(state.messages).toEqual([]);
    });
  });

  describe('Orchestration Mode', () => {
    it('should change orchestration mode', () => {
      expect(orchestrator.getMode()).toBe(OrchestrationMode.DYNAMIC);

      orchestrator.setMode(OrchestrationMode.PARALLEL);
      expect(orchestrator.getMode()).toBe(OrchestrationMode.PARALLEL);

      orchestrator.setMode(OrchestrationMode.SEQUENTIAL);
      expect(orchestrator.getMode()).toBe(OrchestrationMode.SEQUENTIAL);
    });
  });

  describe('Export Functionality', () => {
    it('should export conversation to markdown', () => {
      orchestrator.initSession('test-session');

      const agent1 = createAgentConfig('agent-1', 'Agent 1', 'Role', 'Prompt');
      orchestrator.registerAgent(agent1);

      const messages = [
        new HumanMessage('Hello'),
        new AIMessage('Hi there!'),
      ];
      orchestrator.loadHistory(messages);

      const markdown = orchestrator.exportToMarkdown();

      expect(markdown).toContain('# Multi-Agent Conversation');
      expect(markdown).toContain('Session ID: test-session');
      expect(markdown).toContain('agent-1');
      expect(markdown).toContain('**User:**');
      expect(markdown).toContain('**Agent:**');
    });
  });

  describe('Mention Parsing', () => {
    it('should parse @mentions from messages', () => {
      const agent1 = createAgentConfig('agent-1', 'Product Manager', 'PM', 'Prompt');
      const agent2 = createAgentConfig('agent-2', 'Tech Lead', 'Tech', 'Prompt');

      orchestrator.registerAgent(agent1);
      orchestrator.registerAgent(agent2);

      // This is an internal test - we'd need to expose the parseMentions method
      // or test it indirectly through processMessage
    });
  });
});

describe('Specialist Agent', () => {
  it('should create specialist agent', () => {
    const config = createAgentConfig(
      'specialist-1',
      'Specialist',
      'Expert',
      'You are an expert'
    );

    const agent = new SpecialistAgent(config, MOCK_API_KEY, MOCK_BASE_URL);

    const metadata = agent.getMetadata();
    expect(metadata.id).toBe('specialist-1');
    expect(metadata.name).toBe('Specialist');
    expect(metadata.role).toBe('Expert');
  });
});

describe('Supervisor Agent', () => {
  it('should create supervisor agent', () => {
    const supervisor = new SupervisorAgent(MOCK_API_KEY, MOCK_BASE_URL);
    expect(supervisor).toBeDefined();
  });
});

describe('Integration Tests', () => {
  it('should handle agent registration and state management', () => {
    const orchestrator = createOrchestrator(MOCK_API_KEY, MOCK_BASE_URL);

    orchestrator.initSession('integration-test', { type: 'test' });

    const agent1 = createAgentConfig('agent-1', 'Agent 1', 'Role 1', 'Prompt 1');
    const agent2 = createAgentConfig('agent-2', 'Agent 2', 'Role 2', 'Prompt 2');

    orchestrator.registerAgent(agent1);
    orchestrator.registerAgent(agent2);

    const state = orchestrator.getState();

    expect(state.sessionId).toBe('integration-test');
    expect(state.participants).toContain('agent-1');
    expect(state.participants).toContain('agent-2');
    expect(state.metadata.type).toBe('test');
  });

  it('should support mode switching and state persistence', () => {
    const orchestrator = createOrchestrator(
      MOCK_API_KEY,
      MOCK_BASE_URL,
      OrchestrationMode.SEQUENTIAL
    );

    orchestrator.initSession('mode-test');

    const messages = [new HumanMessage('Test message')];
    orchestrator.loadHistory(messages);

    orchestrator.setMode(OrchestrationMode.PARALLEL);

    const state = orchestrator.getState();
    expect(state.messages).toHaveLength(1);
    expect(orchestrator.getMode()).toBe(OrchestrationMode.PARALLEL);
  });
});
