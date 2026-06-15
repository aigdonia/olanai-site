export const CONTACT_EMAIL = 'hello@olanai.tech';

/**
 * Single entry point for every "Start a Project / Let's Talk / Learn more" CTA.
 *
 * - If the in-page AI chat (#chat) is mounted (localhost): dispatch the
 *   setChatPrompt event (when a prompt is given) and smooth-scroll to it.
 * - Otherwise (production, no chat): open a prefilled mailto: to CONTACT_EMAIL.
 */
export function startProject(prompt?: string): void {
  if (typeof document === 'undefined') return; // SSR-safe no-op

  const chatEl = document.getElementById('chat');
  if (chatEl) {
    if (prompt) {
      window.dispatchEvent(new CustomEvent('setChatPrompt', { detail: prompt }));
    }
    chatEl.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  const subject = 'Project inquiry — OlanAI';
  const body = prompt
    ? `${prompt}\n\n— Sent from olanai.tech`
    : `Hi OlanAI team,\n\nI'd like to talk about a project.\n\n— Sent from olanai.tech`;

  window.location.href =
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
