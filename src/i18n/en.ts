import type { Dict } from './zh'

export const en: Dict = {
  meta: {
    title: 'Sub2API',
    description: 'A self-hosted gateway that turns AI subscriptions into one API',
  },
  nav: {
    docs: 'Docs',
    plaza: 'Models',
    topup: 'Top up',
    login: 'Sign in',
    register: 'Sign up',
    console: 'Console',
    theme: 'Switch appearance',
    lang: 'Switch language',
    menu: 'Menu',
    close: 'Close',
  },
  hero: {
    titleLines: ['Turn a subscription', 'into an API key'],
    lead: 'Bring Claude Code, Codex and Gemini CLI accounts into one gateway that speaks OpenAI, Anthropic and Gemini. Clients only change a base URL.',
    ctaPrimary: 'Get an API key',
    ctaSecondary: 'Read the docs',
    statusConnecting: 'Detecting instance',
    statusLive: 'Connected',
    statusDetected: 'Instance detected',
    statusPreview: 'Preview mode',
    statusPreviewHint: 'No Sub2API instance detected, showing the static page.',
    endpointLabel: 'Gateway',
    endpointCopy: 'Copy',
    endpointCopied: 'Copied',
    altEndpoints: 'Other endpoints',
    altCopy: 'Copy this endpoint',
  },
  protocol: {
    title: 'One port, three protocols',
    lead: 'Pick the protocol your client already speaks; the gateway routes it to the right upstream pool.',
    items: [
      {
        name: 'OpenAI compatible',
        path: '/v1/chat/completions',
        note: 'Chat Completions, Responses and Embeddings, plus image, audio and video endpoints.',
      },
      {
        name: 'Anthropic compatible',
        path: '/v1/messages',
        note: 'Messages and count_tokens. Claude Code connects without a shim.',
      },
      {
        name: 'Gemini compatible',
        path: '/v1beta/models',
        note: 'generateContent and cached contents, keeping the native request shape.',
      },
    ],
  },
  capabilities: {
    title: 'A gateway with an operator console attached',
    lead: 'Accounts, keys, quotas, billing and monitoring close the loop in one place.',
    items: [
      {
        title: 'Account pools',
        body: 'Group upstream accounts, then weight, stick and fail over between them.',
      },
      {
        title: 'Keys and groups',
        body: 'Every key binds to a group, a quota and a concurrency limit, metered on its own.',
      },
      {
        title: 'Usage and billing',
        body: 'Token usage, balance, subscription plans and online payment settle together.',
      },
      {
        title: 'Channel monitoring',
        body: 'Live probes on every upstream channel surface latency and failure spikes.',
      },
      {
        title: 'Model plaza',
        body: 'A public model catalogue that follows your groups and channels automatically.',
      },
      {
        title: 'Flexible sign-in',
        body: 'LinuxDo, GitHub, Google, WeChat, OIDC and Passkey are all supported.',
      },
    ],
    mechanisms: [
      { term: 'Weighted', value: 'concurrency by weight' },
      { term: 'Sticky', value: 'session pinned to one upstream' },
      { term: 'Failover', value: 'unhealthy accounts pulled' },
    ],
  },
  flow: {
    title: 'Three steps to connect',
    lead: 'No application code changes anywhere in the process.',
    steps: [
      {
        title: 'Add an upstream account',
        body: 'Sign in a Claude Code, Codex or Gemini account, or paste an upstream API key.',
      },
      {
        title: 'Create an API key',
        body: 'Choose a group and a quota ceiling, then generate a key starting with sk-.',
      },
      {
        title: 'Swap the base URL',
        body: 'Point the client at this instance. Model names and everything else stay as they are.',
      },
    ],
  },
  quickstart: {
    title: 'Copy and run',
    lead: 'The hostname below is replaced with this instance automatically.',
    tabs: ['cURL', 'Claude Code', 'Codex CLI', 'Gemini CLI'],
    note: 'Replace sk-your-key with your own key.',
  },
  upstreams: {
    title: 'Upstream platforms',
    lead: 'One gateway in front of subscription accounts and official APIs alike.',
  },
  spec: {
    protocols: 'Protocol families',
    upstreams: 'Upstream platforms',
    clients: 'Client CLIs',
    version: 'Target release',
  },
  models: {
    title: 'Model catalogue',
    lead: 'Synced from the group and channel configuration in the admin console, listing every model a group can currently route to.',
    groups: 'groups',
    models: 'models',
    free: 'free',
    perCall: 'call',
    from: 'from',
    note: 'Prices are what this instance currently charges: token-billed models show input / output per million tokens, request-billed models show the price per call, and image models list one price per resolution. When long-context pricing splits into tiers, the row shows the first tier with a "from" marker and the full breakdown on hover.',
    empty: 'This instance does not publish its model catalogue.',
  },
  cta: {
    title: 'Connect your subscription today',
    body: 'Create an account, mint a key, and make the first call in minutes.',
    primary: 'Create an account',
    secondary: 'Read the docs',
  },
  footer: {
    builtOn: 'Built on Sub2API',
    status: 'Status',
    contact: 'Contact',
    rights: 'All rights reserved',
    langNote: 'Language',
  },
  fallback: {
    brand: 'Sub2API',
    tagline: 'Unified AI gateway',
  },
}
