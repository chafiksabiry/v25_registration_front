import type React from 'react';

/** Projecteur qui suit la souris sur une carte : place --mx / --my (voir `.taas-spot` dans index.css). */
export function spotMove(e: React.MouseEvent<HTMLElement>): void {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}
