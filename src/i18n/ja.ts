import type { Dict } from './zh'

export const ja: Dict = {
  meta: {
    title: 'Sub2API',
    description: 'サブスクリプションをひとつの API にまとめるセルフホスト型ゲートウェイ',
  },
  nav: {
    docs: 'ドキュメント',
    plaza: 'モデル',
    pricing: '料金',
    topup: 'チャージ',
    login: 'ログイン',
    register: '新規登録',
    console: 'コンソール',
    theme: '表示を切り替え',
    lang: '言語を切り替え',
    menu: 'メニュー',
    close: '閉じる',
  },
  hero: {
    titleLines: ['サブスクリプションを、', 'ひとつの API キーに'],
    lead: 'Claude Code、Codex、Gemini CLI などのアカウントをひとつのゲートウェイに集約し、OpenAI・Anthropic・Gemini 互換の API として提供します。クライアント側の変更はベース URL だけです。',
    ctaPrimary: 'API キーを取得',
    statusConnecting: 'インスタンスを検出中',
    statusLive: '接続済み',
    statusDetected: 'インスタンス検出済み',
    statusPreview: 'プレビュー表示',
    statusPreviewHint: 'Sub2API インスタンスが検出されないため、静的な表示になっています。',
    endpointLabel: 'ゲートウェイ',
    endpointCopy: 'コピー',
    endpointCopied: 'コピーしました',
    altCopy: 'このエンドポイントをコピー',
  },
  protocol: {
    title: 'ひとつのポートに、三つのプロトコル',
    lead: 'クライアントが既に話すプロトコルを選ぶだけで、適切な上流プールへ振り分けられます。',
    items: [
      {
        name: 'OpenAI 互換',
        path: '/v1/chat/completions',
        note: 'Chat Completions、Responses、Embeddings に加えて画像・音声・動画も。',
      },
      {
        name: 'Anthropic 互換',
        path: '/v1/messages',
        note: 'Messages と count_tokens。Claude Code からそのまま接続できます。',
      },
      {
        name: 'Gemini 互換',
        path: '/v1beta/models',
        note: 'generateContent とキャッシュ。リクエスト構造はネイティブのままです。',
      },
    ],
  },
  capabilities: {
    title: 'ゲートウェイと、運用コンソール',
    lead: 'アカウント、キー、割当、請求、監視がひとつの画面で完結します。',
    items: [
      {
        title: 'アカウントプール',
        body: '上流アカウントをグループ化し、重み付け・固定・自動フェイルオーバーで振り分けます。',
      },
      {
        title: 'キーとグループ',
        body: 'キーごとにグループ、割当、同時実行数を設定し、個別に計測します。',
      },
      {
        title: '利用量と請求',
        body: 'トークン使用量、残高、サブスクリプション、オンライン決済をまとめて精算します。',
      },
      {
        title: 'チャネル監視',
        body: '上流チャネルを常時監視し、遅延や失敗率の異常を即座に可視化します。',
      },
      {
        title: 'モデル広場',
        body: '公開モデルカタログがグループとチャネルの設定に追従して更新されます。',
      },
      {
        title: '多様なログイン',
        body: 'LinuxDo、GitHub、Google、WeChat、OIDC、Passkey に対応しています。',
      },
    ],
    mechanisms: [
      { term: '重み付き', value: '重みに応じて並列配分' },
      { term: 'スティッキー', value: '同一セッションを固定' },
      { term: 'フェイルオーバー', value: '異常アカウントを自動除外' },
    ],
  },
  flow: {
    title: '接続は三ステップ',
    lead: 'アプリケーションのコード変更は一切不要です。',
    steps: [
      {
        title: '上流アカウントを追加',
        body: 'Claude Code、Codex、Gemini のアカウントを連携するか、API キーを貼り付けます。',
      },
      {
        title: 'API キーを作成',
        body: 'グループと割当上限を選び、sk- で始まるキーを発行します。',
      },
      {
        title: 'ベース URL を差し替え',
        body: 'クライアントをこのインスタンスに向けます。モデル名などの設定はそのままです。',
      },
    ],
  },
  quickstart: {
    title: 'コピーして実行',
    lead: 'ホスト名はこのインスタンスのアドレスに自動で置き換わります。',
    tabs: ['cURL', 'Claude Code', 'Codex CLI', 'Gemini CLI'],
    note: 'sk-your-key はご自身のキーに置き換えてください。',
  },
  upstreams: {
    title: '対応する上流プラットフォーム',
    lead: 'サブスクリプションも公式 API も、同じゲートウェイの背後に。',
  },
  spec: {
    protocols: 'プロトコル',
    upstreams: '上流プラットフォーム',
    clients: '対応 CLI',
    version: '対応バージョン',
    protocolsUnit: '種',
    upstreamsUnit: '社',
    clientsUnit: '個',
    protocolsNote: 'ひとつのポートで三つのリクエスト形式',
    upstreamsNote: '公式 API と国産モデルのアカウントプール',
    clientsNote: 'Claude Code、Codex、Gemini CLI',
    versionNote: 'home_content で埋め込み',
  },
  footer: {
    status: 'ステータス',
    contact: 'お問い合わせ',
    rights: 'All rights reserved',
    langNote: '言語',
  },
  fallback: {
    brand: 'Sub2API',
    tagline: '統合 AI ゲートウェイ',
  },
}
