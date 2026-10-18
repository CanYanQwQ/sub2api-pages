/**
 * Clipboard writes inside Sub2API's iframe.
 *
 * The iframe is created with only `allowfullscreen`, so the Permissions-Policy
 * for `clipboard-write` is not delegated to us. `navigator.clipboard.writeText`
 * may therefore reject; the textarea + execCommand path still works because it
 * is driven by the same user gesture.
 */
export async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return true
    }
  } catch {
    /* fall through to the legacy path */
  }

  try {
    const area = document.createElement('textarea')
    area.value = value
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.top = '0'
    area.style.left = '0'
    area.style.opacity = '0'
    area.style.pointerEvents = 'none'
    document.body.appendChild(area)
    area.select()
    area.setSelectionRange(0, value.length)
    const ok = document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}
