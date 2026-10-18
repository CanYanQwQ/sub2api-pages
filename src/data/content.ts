/**
 * Static content that is language-independent or that must stay literal code.
 * `{base}` is substituted with the detected instance origin at render time.
 */

export interface Snippet {
  /** Tab index matching i18n `quickstart.tabs`. */
  id: string
  language: string
  code: string
}

export function buildSnippets(base: string): Snippet[] {
  const host = base || 'https://your-sub2api.example.com'
  return [
    {
      id: 'curl',
      language: 'bash',
      code: `curl ${host}/v1/chat/completions \\
  -H "Authorization: Bearer sk-your-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-sonnet-4-5",
    "messages": [{ "role": "user", "content": "ping" }],
    "stream": true
  }'`,
    },
    {
      id: 'claude-code',
      language: 'bash',
      code: `export ANTHROPIC_BASE_URL="${host}"
export ANTHROPIC_AUTH_TOKEN="sk-your-key"

claude`,
    },
    {
      id: 'codex',
      language: 'toml',
      code: `# ~/.codex/config.toml
model_provider = "sub2api"

[model_providers.sub2api]
name = "Sub2API"
base_url = "${host}/v1"
env_key = "SUB2API_API_KEY"`,
    },
    {
      id: 'gemini',
      language: 'bash',
      code: `export GEMINI_API_KEY="sk-your-key"
export GOOGLE_GEMINI_BASE_URL="${host}"

gemini`,
    },
  ]
}

/** Upstream platforms exposed by Sub2API 0.2.17 (backend domain constants). */
export const UPSTREAM_PLATFORMS: { id: string; label: string }[] = [
  { id: 'anthropic', label: 'Anthropic' },
  { id: 'openai', label: 'OpenAI' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'antigravity', label: 'Antigravity' },
  { id: 'grok', label: 'Grok' },
  { id: 'deepseek', label: 'DeepSeek' },
  { id: 'kimi', label: 'Kimi' },
  { id: 'zhipu', label: 'Zhipu' },
  { id: 'minimax', label: 'MiniMax' },
  { id: 'kiro', label: 'Kiro' },
  { id: 'cline', label: 'Cline' },
  { id: 'opencode-go', label: 'OpenCode Go' },
  { id: 'command-code', label: 'Command Code' },
  { id: 'typesafe', label: 'TypeSafe' },
  { id: 'composite', label: 'Composite' },
]
