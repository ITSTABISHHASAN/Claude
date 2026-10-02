const mq = (q) => window.matchMedia(q).matches;

export const reducedMotion = mq('(prefers-reduced-motion: reduce)');
export const finePointer = mq('(hover: hover) and (pointer: fine)');
/** Phones and touch-first devices get the lighter orb and fewer particles. */
export const lite = mq('(max-width: 760px), (pointer: coarse)');
export const isMobileLayout = () => mq('(max-width: 900px)');

/**
 * Hardware WebGL check. Software rasterisers (SwiftShader, llvmpipe, WARP)
 * run the raymarched orb on the CPU at a few frames per second and block the
 * main thread, so those devices get the CSS orb instead.
 * Add ?gl=force to the URL to bypass the check.
 */
export function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return false;
    if (new URLSearchParams(location.search).get('gl') === 'force') return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
  } catch {
    return false;
  }
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
