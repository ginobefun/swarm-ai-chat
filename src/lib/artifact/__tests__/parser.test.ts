/**
 * Artifact Parser Tests
 */

import { describe, it, expect } from 'vitest';
import {
  parseArtifacts,
  isValidArtifactType,
  formatArtifact,
  getArtifactInstructions,
  type ParsedArtifact,
} from '../parser';

describe('parseArtifacts', () => {
  it('should parse a single code artifact', () => {
    const input = `Here's the authentication service:

<artifact type="code" language="typescript" title="Auth Service">
export class AuthService {
  async login(email: string, password: string) {
    // Login logic
  }
}
</artifact>

Let me know if you need any changes!`;

    const result = parseArtifacts(input);

    expect(result.artifacts).toHaveLength(1);
    expect(result.artifacts[0]).toEqual({
      type: 'code',
      language: 'typescript',
      title: 'Auth Service',
      content: expect.stringContaining('export class AuthService'),
      metadata: undefined,
    });

    expect(result.textContent).toContain("Here's the authentication service:");
    expect(result.textContent).toContain('Let me know if you need any changes!');
    expect(result.textContent).not.toContain('<artifact');
  });

  it('should parse multiple artifacts', () => {
    const input = `I'll create two files:

<artifact type="code" language="typescript" title="types.ts">
export interface User {
  id: string;
  name: string;
}
</artifact>

<artifact type="code" language="typescript" title="service.ts">
import { User } from './types';

export class UserService {
  async getUser(id: string): Promise<User> {
    // Implementation
  }
}
</artifact>

Both files are ready!`;

    const result = parseArtifacts(input);

    expect(result.artifacts).toHaveLength(2);
    expect(result.artifacts[0].title).toBe('types.ts');
    expect(result.artifacts[1].title).toBe('service.ts');
    expect(result.textContent).toContain("I'll create two files:");
    expect(result.textContent).toContain('Both files are ready!');
  });

  it('should parse document artifact', () => {
    const input = `<artifact type="document" title="Product Requirements">
# Product Requirements Document

## Overview
This product will revolutionize collaboration.

## Features
- Real-time chat
- AI assistance
- File sharing
</artifact>`;

    const result = parseArtifacts(input);

    expect(result.artifacts).toHaveLength(1);
    expect(result.artifacts[0].type).toBe('document');
    expect(result.artifacts[0].title).toBe('Product Requirements');
    expect(result.artifacts[0].content).toContain('# Product Requirements Document');
    expect(result.artifacts[0].language).toBeUndefined();
  });

  it('should parse chart artifact with metadata', () => {
    const input = `<artifact type="chart" title="Sales Data" format="json" chartType="bar">
{
  "labels": ["Q1", "Q2", "Q3"],
  "data": [100, 150, 200]
}
</artifact>`;

    const result = parseArtifacts(input);

    expect(result.artifacts).toHaveLength(1);
    expect(result.artifacts[0].type).toBe('chart');
    expect(result.artifacts[0].metadata).toEqual({
      format: 'json',
      chartType: 'bar',
    });
  });

  it('should parse mermaid diagram', () => {
    const input = `<artifact type="mermaid" title="System Architecture">
graph TD
  A[User] --> B[API Gateway]
  B --> C[Auth Service]
  B --> D[Data Service]
</artifact>`;

    const result = parseArtifacts(input);

    expect(result.artifacts).toHaveLength(1);
    expect(result.artifacts[0].type).toBe('mermaid');
    expect(result.artifacts[0].content).toContain('graph TD');
  });

  it('should handle text without artifacts', () => {
    const input = 'This is just regular text without any artifacts.';

    const result = parseArtifacts(input);

    expect(result.artifacts).toHaveLength(0);
    expect(result.textContent).toBe(input);
  });

  it('should handle empty input', () => {
    const result = parseArtifacts('');

    expect(result.artifacts).toHaveLength(0);
    expect(result.textContent).toBe('');
  });

  it('should handle malformed artifact tags gracefully', () => {
    const input = `Normal text
<artifact type="code" title="Missing closing tag"
Some code here

More text`;

    const result = parseArtifacts(input);

    // Should not parse malformed tags
    expect(result.artifacts).toHaveLength(0);
    expect(result.textContent).toContain('Normal text');
  });

  it('should preserve whitespace in artifact content', () => {
    const input = `<artifact type="code" language="python" title="Example">
def hello():
    print("Hello")
    if True:
        print("World")
</artifact>`;

    const result = parseArtifacts(input);

    expect(result.artifacts[0].content).toContain('    print("Hello")');
    expect(result.artifacts[0].content).toContain('        print("World")');
  });

  it('should handle single quotes in attributes', () => {
    const input = `<artifact type='code' language='javascript' title='My Script'>
console.log('Hello');
</artifact>`;

    const result = parseArtifacts(input);

    expect(result.artifacts).toHaveLength(1);
    expect(result.artifacts[0].type).toBe('code');
    expect(result.artifacts[0].language).toBe('javascript');
  });

  it('should use default values for missing attributes', () => {
    const input = `<artifact>
Some content
</artifact>`;

    const result = parseArtifacts(input);

    expect(result.artifacts).toHaveLength(1);
    expect(result.artifacts[0].type).toBe('document');
    expect(result.artifacts[0].title).toBe('Untitled');
  });
});

describe('isValidArtifactType', () => {
  it('should validate correct artifact types', () => {
    expect(isValidArtifactType('code')).toBe(true);
    expect(isValidArtifactType('document')).toBe(true);
    expect(isValidArtifactType('markdown')).toBe(true);
    expect(isValidArtifactType('chart')).toBe(true);
    expect(isValidArtifactType('mermaid')).toBe(true);
  });

  it('should reject invalid artifact types', () => {
    expect(isValidArtifactType('invalid')).toBe(false);
    expect(isValidArtifactType('unknown')).toBe(false);
    expect(isValidArtifactType('')).toBe(false);
  });

  it('should be case insensitive', () => {
    expect(isValidArtifactType('CODE')).toBe(true);
    expect(isValidArtifactType('Document')).toBe(true);
    expect(isValidArtifactType('MERMAID')).toBe(true);
  });
});

describe('formatArtifact', () => {
  it('should format code artifact with markdown code block', () => {
    const artifact: ParsedArtifact = {
      type: 'code',
      language: 'typescript',
      title: 'Example',
      content: 'const x = 1;',
    };

    const formatted = formatArtifact(artifact);

    expect(formatted).toBe('```typescript\nconst x = 1;\n```');
  });

  it('should format code without language', () => {
    const artifact: ParsedArtifact = {
      type: 'code',
      title: 'Example',
      content: 'console.log("hi");',
    };

    const formatted = formatArtifact(artifact);

    expect(formatted).toBe('```\nconsole.log("hi");\n```');
  });

  it('should format markdown artifact as-is', () => {
    const artifact: ParsedArtifact = {
      type: 'markdown',
      title: 'Doc',
      content: '# Header\n\nContent',
    };

    const formatted = formatArtifact(artifact);

    expect(formatted).toBe('# Header\n\nContent');
  });

  it('should format mermaid with code block', () => {
    const artifact: ParsedArtifact = {
      type: 'mermaid',
      title: 'Diagram',
      content: 'graph TD\n  A --> B',
    };

    const formatted = formatArtifact(artifact);

    expect(formatted).toBe('```mermaid\ngraph TD\n  A --> B\n```');
  });

  it('should format other types as-is', () => {
    const artifact: ParsedArtifact = {
      type: 'document',
      title: 'Doc',
      content: 'Plain content',
    };

    const formatted = formatArtifact(artifact);

    expect(formatted).toBe('Plain content');
  });
});

describe('getArtifactInstructions', () => {
  it('should return instructions string', () => {
    const instructions = getArtifactInstructions();

    expect(instructions).toContain('artifact');
    expect(instructions).toContain('type="code"');
    expect(instructions).toContain('type="document"');
    expect(instructions).toContain('type="chart"');
    expect(instructions).toContain('Supported types:');
  });

  it('should include examples for all major types', () => {
    const instructions = getArtifactInstructions();

    expect(instructions).toContain('type="code"');
    expect(instructions).toContain('type="document"');
    expect(instructions).toContain('type="chart"');
    expect(instructions).toContain('type="mermaid"');
  });
});
