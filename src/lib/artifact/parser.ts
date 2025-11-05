/**
 * Artifact Parser
 *
 * Extracts structured artifacts from agent responses using XML-like tags
 * Supports multiple artifact types: code, documents, charts, images, etc.
 */

export interface ParsedArtifact {
  type: string;
  title: string;
  content: string;
  language?: string;
  metadata?: Record<string, any>;
}

export interface ParseResult {
  textContent: string;  // Text content without artifacts
  artifacts: ParsedArtifact[];
}

/**
 * Parse agent response to extract artifacts and text content
 *
 * Expected format:
 * <artifact type="code" language="typescript" title="Auth Service">
 * ... artifact content ...
 * </artifact>
 *
 * @param responseText - Full agent response text
 * @returns Parsed result with text content and artifacts
 */
export function parseArtifacts(responseText: string): ParseResult {
  const artifacts: ParsedArtifact[] = [];
  let textContent = responseText;

  // Regex to match artifact tags
  // Matches: <artifact type="..." title="..." language="..." ...>content</artifact>
  // Also matches: <artifact>content</artifact> (no attributes)
  const artifactRegex = /<artifact\s*([^>]*)>([\s\S]*?)<\/artifact>/g;

  let match;
  while ((match = artifactRegex.exec(responseText)) !== null) {
    const attributesStr = match[1];
    const content = match[2].trim();

    // Parse attributes
    const attributes = parseAttributes(attributesStr);

    // Extract required fields
    const type = attributes.type || 'document';
    const title = attributes.title || 'Untitled';
    const language = attributes.language;

    // Extract metadata (any additional attributes)
    const metadata: Record<string, any> = {};
    for (const [key, value] of Object.entries(attributes)) {
      if (key !== 'type' && key !== 'title' && key !== 'language') {
        metadata[key] = value;
      }
    }

    artifacts.push({
      type,
      title,
      content,
      language,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    });

    // Remove artifact from text content
    textContent = textContent.replace(match[0], '');
  }

  // Clean up text content (remove extra newlines)
  textContent = textContent.replace(/\n{3,}/g, '\n\n').trim();

  return {
    textContent,
    artifacts,
  };
}

/**
 * Parse XML-like attributes from a string
 * Example: 'type="code" title="My Title" language="typescript"'
 *
 * @param attributesStr - Attributes string
 * @returns Object with parsed attributes
 */
function parseAttributes(attributesStr: string): Record<string, string> {
  const attributes: Record<string, string> = {};

  // Regex to match key="value" or key='value'
  const attrRegex = /(\w+)=["']([^"']+)["']/g;

  let match;
  while ((match = attrRegex.exec(attributesStr)) !== null) {
    const key = match[1];
    const value = match[2];
    attributes[key] = value;
  }

  return attributes;
}

/**
 * Validate artifact type
 */
export function isValidArtifactType(type: string): boolean {
  const validTypes = [
    'document',
    'code',
    'markdown',
    'html',
    'svg',
    'chart',
    'image',
    'mermaid',
    'react',
  ];
  return validTypes.includes(type.toLowerCase());
}

/**
 * Format artifact for display
 * Adds appropriate formatting based on type
 */
export function formatArtifact(artifact: ParsedArtifact): string {
  switch (artifact.type.toLowerCase()) {
    case 'code':
      return `\`\`\`${artifact.language || ''}\n${artifact.content}\n\`\`\``;
    case 'markdown':
      return artifact.content;
    case 'mermaid':
      return `\`\`\`mermaid\n${artifact.content}\n\`\`\``;
    default:
      return artifact.content;
  }
}

/**
 * Create artifact tag for agent system prompt
 * This helps agents understand how to format their outputs
 */
export function getArtifactInstructions(): string {
  return `
When you need to output structured content (code, documents, charts, etc.), use artifact tags:

<artifact type="code" language="typescript" title="Component Name">
// Your code here
</artifact>

<artifact type="document" title="Product Requirements">
Your document content here
</artifact>

<artifact type="chart" title="Sales Data" format="json">
{
  "type": "bar",
  "data": [...]
}
</artifact>

<artifact type="mermaid" title="System Architecture">
graph TD
  A[User] --> B[API]
  B --> C[Database]
</artifact>

Supported types: code, document, markdown, html, svg, chart, image, mermaid, react

Guidelines:
- Use artifacts for substantial, structured content
- Always provide a descriptive title
- For code, always specify the language
- For charts, use JSON format with chart configuration
- Regular conversational text should NOT be wrapped in artifact tags
- You can include multiple artifacts in one response
`.trim();
}
