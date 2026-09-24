import spriteRaw from '../assets/sprite.svg?raw';

// Shared <symbol> defs from the prototype (#umark, #arrow, #ic).
export default function Sprite() {
  return <div aria-hidden="true" dangerouslySetInnerHTML={{ __html: spriteRaw }} />;
}

export const Arrow = () => (
  <svg>
    <use href="#arrow" />
  </svg>
);
