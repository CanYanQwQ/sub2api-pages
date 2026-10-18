import { useEffect, useRef, useState } from 'react'

/**
 * Entrance animation for the sections below the fold.
 *
 * Runs once, from the root: every `[data-reveal]` element is watched and given
 * `.is-in` the first time it comes within a screen of the viewport. Using one
 * observer for the whole page (instead of one per component) keeps the cost
 * flat no matter how many sections exist.
 *
 * The hiding itself lives in CSS and is gated on `html.reveal-on`, which is set
 * here — so if this effect never runs (JS disabled, hydration failure, an
 * unusual embedder), the page is fully visible rather than a stack of invisible
 * sections.
 */
export function useReveal() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const revealAll = (root: ParentNode = document) => {
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element) => {
        element.classList.add('is-in')
      })
    }

    if (reduced || typeof IntersectionObserver === 'undefined') {
      revealAll()
      return
    }

    document.documentElement.classList.add('reveal-on')

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          observer.unobserve(entry.target)
        }
      },
      // Start a little before the element reaches the fold so the motion has
      // finished by the time it is being read, not while it is being read.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    )

    const watch = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)').forEach((element) => {
        observer.observe(element)
      })
    }

    watch(document)

    // Sections can mount after this effect runs — the catalogue waits on its
    // own request — and an observer registered once would never see them, so
    // they would stay at opacity 0 forever. Re-scan on every subtree change;
    // `observe` is idempotent for elements already tracked.
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType !== 1) continue
          const element = node as HTMLElement
          if (element.matches('[data-reveal]:not(.is-in)')) observer.observe(element)
          watch(element)
        }
      }
    })
    mutations.observe(document.body, { childList: true, subtree: true })

    // Safety net: anything still hidden after the page has settled (for example
    // a section that never intersects because it sits inside a short iframe) is
    // revealed regardless.
    const failsafe = window.setTimeout(() => revealAll(), 4000)

    return () => {
      mutations.disconnect()
      observer.disconnect()
      window.clearTimeout(failsafe)
      document.documentElement.classList.remove('reveal-on')
    }
  }, [])
}

/**
 * Counts a small integer up once, on mount. Used by the hero spec strip so the
 * four figures land rather than merely appear.
 *
 * Returns the final value immediately when the visitor asked for reduced motion.
 */
export function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return target
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? target : 0
  })
  const frame = useRef<number>(0)

  useEffect(() => {
    if (value === target) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }

    const started = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration)
      // Ease-out: fast at first, settling on the number instead of stopping dead.
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) frame.current = requestAnimationFrame(tick)
    }

    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
    // `value` is intentionally excluded: it changes on every frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration])

  return value
}
