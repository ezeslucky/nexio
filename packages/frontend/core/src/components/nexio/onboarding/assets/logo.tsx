import { memo } from 'react';

export default memo(function Logo() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="256" height="256" rx="56" fill="#08080b" />
      <circle cx="128" cy="128" r="10" fill="#ffffff" />
      <path d="M128 63L91.5 96.5L145.5 113.5Z" fill="#ffffff" />
      <path d="M193 128L159.5 91.5L142.5 145.5Z" fill="#ffffff" />
      <path d="M128 193L164.5 159.5L110.5 142.5Z" fill="#ffffff" />
      <path d="M63 128L96.5 164.5L113.5 110.5Z" fill="#ffffff" />
    </svg>
  );
});
