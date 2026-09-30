import { describe, it, expect } from 'vitest'
import { renderHomeContent, escapeHtml } from '../homeContentTemplate'

const values = {
  site_name: 'CCFable',
  site_logo: '/relay-mark.svg',
  site_subtitle: 'Relay',
  api_base_url: 'https://api.example.com/v1',
  api_base_root: 'https://api.example.com',
  doc_url: 'https://docs.example.com',
  contact_info: '',
  year: '2026',
}

describe('renderHomeContent', () => {
  it('replaces known placeholders', () => {
    const out = renderHomeContent('<h1>{{site_name}}</h1><p>{{year}}</p>', values)
    expect(out).toBe('<h1>CCFable</h1><p>2026</p>')
  })

  it('accepts optional inner spacing variants', () => {
    const out = renderHomeContent('{{site_name}}|{{ site_name }}|{{   site_name}}|{{site_name  }}', values)
    expect(out).toBe('CCFable|CCFable|CCFable|CCFable')
  })

  it('replaces placeholders inside attributes', () => {
    const out = renderHomeContent('<img src="{{ site_logo }}" alt="{{ site_name }}">', values)
    expect(out).toBe('<img src="/relay-mark.svg" alt="CCFable">')
  })

  it('escapes script tags and quotes in values', () => {
    const out = renderHomeContent('<a title="{{ site_name }}">{{ site_subtitle }}</a>', {
      ...values,
      site_name: `x" onmouseover="alert(1)`,
      site_subtitle: `<script>alert('x')</script> & more`,
    })
    expect(out).toBe(
      '<a title="x&quot; onmouseover=&quot;alert(1)">&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt; &amp; more</a>',
    )
    expect(out).not.toContain('<script>')
  })

  it('leaves unknown keys untouched', () => {
    const out = renderHomeContent('{{ unknown_key }} {{site_name}} {{ constructor }}', values)
    expect(out).toBe('{{ unknown_key }} CCFable {{ constructor }}')
  })

  it('renders missing known values as empty string', () => {
    const out = renderHomeContent('[{{ contact_info }}]', { site_name: 'A' })
    expect(out).toBe('[]')
  })

  it('removes data-ccf-if elements whose value is empty', () => {
    const out = renderHomeContent(
      '<div><p data-ccf-if="contact_info">Contact: {{ contact_info }}</p><span>keep</span></div>',
      values,
    )
    expect(out).toBe('<div><span>keep</span></div>')
  })

  it('strips data-ccf-if attribute when value is present', () => {
    const out = renderHomeContent(
      '<a data-ccf-if="doc_url" href="{{ doc_url }}" class="x">Docs</a>',
      values,
    )
    expect(out).toBe('<a href="https://docs.example.com" class="x">Docs</a>')
    expect(out).not.toContain('data-ccf-if')
  })

  it('treats unknown keys in data-ccf-if as empty and removes nested conditionals', () => {
    const out = renderHomeContent(
      '<section data-ccf-if="site_name"><b data-ccf-if="nope">x</b><i data-ccf-if="year">{{year}}</i></section>',
      values,
    )
    expect(out).toBe('<section><i>2026</i></section>')
  })

  it('preserves style blocks intact', () => {
    const style = '<style>.hero > a { color: rgb(var(--ccf-accent-rgb) / 0.8); } a[href^="http"]::after { content: "&"; }</style>'
    const withCond = renderHomeContent(`${style}<p data-ccf-if="contact_info">c</p><h1>{{ site_name }}</h1>`, values)
    expect(withCond).toBe(`${style}<h1>CCFable</h1>`)
    const noCond = renderHomeContent(`${style}<h1>{{site_name}}</h1>`, values)
    expect(noCond).toBe(`${style}<h1>CCFable</h1>`)
  })

  it('does not execute scripts in the template while parsing', () => {
    ;(window as unknown as { __ccfRan?: boolean }).__ccfRan = false
    const out = renderHomeContent(
      '<script>window.__ccfRan = true</script><p data-ccf-if="site_name">ok</p>',
      values,
    )
    expect((window as unknown as { __ccfRan?: boolean }).__ccfRan).toBe(false)
    expect(out).toContain('<p>ok</p>')
  })

  it('returns empty string for empty template', () => {
    expect(renderHomeContent('', values)).toBe('')
  })
})

describe('escapeHtml', () => {
  it('escapes the five HTML special characters', () => {
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;')
  })
})
