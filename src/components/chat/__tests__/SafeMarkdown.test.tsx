/**
 * @vitest-environment jsdom
 */

import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SafeMarkdown from '../SafeMarkdown'

describe('SafeMarkdown Component', () => {
  describe('XSS Protection', () => {
    it('should sanitize script tags', () => {
      const maliciousContent = 'Hello <script>alert("XSS")</script> World'
      const { container } = render(<SafeMarkdown content={maliciousContent} />)

      // Script tag should be removed
      expect(container.querySelector('script')).toBeNull()
      // Content should still be rendered
      expect(container.textContent).toContain('Hello')
      expect(container.textContent).toContain('World')
    })

    it('should sanitize onclick handlers', () => {
      // HTML tags in markdown are sanitized - they won't render as clickable links
      const maliciousContent = '<a href="#" onclick="alert(\'XSS\')">Click me</a>'
      const { container } = render(<SafeMarkdown content={maliciousContent} />)

      // The malicious HTML should be stripped or rendered as plain text
      // No onclick handler should be present
      const links = container.querySelectorAll('a')
      links.forEach(link => {
        expect(link.getAttribute('onclick')).toBeNull()
      })

      // Content should still be visible (as text)
      expect(container.textContent).toContain('Click me')
    })

    it('should sanitize iframe tags', () => {
      const maliciousContent = '<iframe src="https://evil.com"></iframe>'
      const { container } = render(<SafeMarkdown content={maliciousContent} />)

      expect(container.querySelector('iframe')).toBeNull()
    })

    it('should sanitize img with onerror', () => {
      const maliciousContent = '<img src="x" onerror="alert(\'XSS\')" />'
      const { container } = render(<SafeMarkdown content={maliciousContent} />)

      const img = container.querySelector('img')
      if (img) {
        expect(img.getAttribute('onerror')).toBeNull()
      }
    })

    it('should sanitize javascript: protocol in links', () => {
      const maliciousContent = '[Click me](javascript:alert("XSS"))'
      const { container } = render(<SafeMarkdown content={maliciousContent} />)

      // The javascript: protocol should be removed or the link should be removed
      const link = container.querySelector('a')
      if (link) {
        const href = link.getAttribute('href')
        // href should either be null (removed) or not contain javascript:
        if (href) {
          expect(href).not.toContain('javascript:')
          expect(href.startsWith('javascript:')).toBe(false)
        } else {
          // href was removed, which is also safe
          expect(href).toBeNull()
        }
      }
      // Content should still be visible
      expect(container.textContent).toContain('Click me')
    })
  })

  describe('Markdown Rendering', () => {
    it('should render bold text', () => {
      const content = 'This is **bold** text'
      const { container } = render(<SafeMarkdown content={content} />)

      expect(container.querySelector('strong')).toBeInTheDocument()
      expect(container.textContent).toContain('bold')
    })

    it('should render italic text', () => {
      const content = 'This is *italic* text'
      const { container } = render(<SafeMarkdown content={content} />)

      expect(container.querySelector('em')).toBeInTheDocument()
      expect(container.textContent).toContain('italic')
    })

    it('should render inline code', () => {
      const content = 'Use `console.log()` for debugging'
      const { container } = render(<SafeMarkdown content={content} />)

      expect(container.querySelector('code')).toBeInTheDocument()
      expect(container.textContent).toContain('console.log()')
    })

    it('should render code blocks', () => {
      const content = '```javascript\nconst x = 10;\n```'
      const { container } = render(<SafeMarkdown content={content} />)

      expect(container.querySelector('pre')).toBeInTheDocument()
      expect(container.querySelector('code')).toBeInTheDocument()
    })

    it('should render lists', () => {
      const content = '- Item 1\n- Item 2\n- Item 3'
      const { container } = render(<SafeMarkdown content={content} />)

      expect(container.querySelector('ul')).toBeInTheDocument()
      const items = container.querySelectorAll('li')
      expect(items.length).toBe(3)
    })

    it('should render ordered lists', () => {
      const content = '1. First\n2. Second\n3. Third'
      const { container } = render(<SafeMarkdown content={content} />)

      expect(container.querySelector('ol')).toBeInTheDocument()
      const items = container.querySelectorAll('li')
      expect(items.length).toBe(3)
    })

    it('should render links with proper attributes', () => {
      const content = '[OpenAI](https://openai.com)'
      const { container } = render(<SafeMarkdown content={content} />)

      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
      expect(link?.getAttribute('href')).toBe('https://openai.com')
      expect(link?.getAttribute('target')).toBe('_blank')
      expect(link?.getAttribute('rel')).toBe('noopener noreferrer')
    })

    it('should render blockquotes', () => {
      const content = '> This is a quote'
      const { container } = render(<SafeMarkdown content={content} />)

      expect(container.querySelector('blockquote')).toBeInTheDocument()
    })

    it('should render tables', () => {
      const content = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
`
      const { container } = render(<SafeMarkdown content={content} />)

      expect(container.querySelector('table')).toBeInTheDocument()
      expect(container.querySelector('th')).toBeInTheDocument()
      expect(container.querySelector('td')).toBeInTheDocument()
    })
  })

  describe('GitHub Flavored Markdown', () => {
    it('should render strikethrough', () => {
      const content = '~~strikethrough~~'
      const { container } = render(<SafeMarkdown content={content} />)

      expect(container.querySelector('del')).toBeInTheDocument()
    })

    it('should render task lists', () => {
      const content = '- [ ] Incomplete task\n- [x] Complete task'
      const { container } = render(<SafeMarkdown content={content} />)

      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      expect(checkboxes.length).toBe(2)
    })

    it('should autolink URLs', () => {
      const content = 'Visit https://example.com for more info'
      const { container } = render(<SafeMarkdown content={content} />)

      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
      expect(link?.getAttribute('href')).toBe('https://example.com')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const { container } = render(<SafeMarkdown content="" />)
      expect(container.textContent).toBe('')
    })

    it('should handle plain text', () => {
      const content = 'Just plain text'
      const { container } = render(<SafeMarkdown content={content} />)
      expect(container.textContent).toContain('Just plain text')
    })

    it('should handle multi-line content', () => {
      const content = 'Line 1\nLine 2\nLine 3'
      const { container } = render(<SafeMarkdown content={content} />)
      expect(container.textContent).toContain('Line 1')
      expect(container.textContent).toContain('Line 2')
      expect(container.textContent).toContain('Line 3')
    })

    it('should handle special characters', () => {
      const content = '< > & " \''
      const { container } = render(<SafeMarkdown content={content} />)
      expect(container.textContent).toContain('<')
      expect(container.textContent).toContain('>')
    })

    it('should handle mixed markdown and XSS attempts', () => {
      const content = '**Bold** <script>alert("XSS")</script> *italic*'
      const { container } = render(<SafeMarkdown content={content} />)

      expect(container.querySelector('strong')).toBeInTheDocument()
      expect(container.querySelector('em')).toBeInTheDocument()
      expect(container.querySelector('script')).toBeNull()
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <SafeMarkdown content="Test" className="custom-class" />
      )

      const element = container.querySelector('.custom-class')
      expect(element).toBeInTheDocument()
    })

    it('should include prose classes', () => {
      const { container } = render(<SafeMarkdown content="Test" />)

      const element = container.querySelector('.prose')
      expect(element).toBeInTheDocument()
    })
  })
})
