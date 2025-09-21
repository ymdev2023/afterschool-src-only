import kaboom from "../lib/kaboom.mjs";

const k = kaboom({
  width: 1600,
  height: 900,
  global: false,
  clearColor: [0, 0, 0, 1],
  crisp: true,
  pixelDensity: 1,
  canvas: document.querySelector("#game-canvas") || undefined,
});

// 전역에서 접근할 수 있도록 설정
window.k = k;


export default k;
