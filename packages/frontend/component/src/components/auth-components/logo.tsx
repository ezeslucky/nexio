import type { CSSProperties, FC } from 'react';

export const NexioIcon: FC<{
  width?: number | string;
  height?: number | string;
  size?: number | string;
  className?: string;
  style?: CSSProperties;
}> = ({ width, height, size = 24, className, style }) => {
  const w = width ?? size;
  const h = height ?? size;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <rect width="256" height="256" rx="56" fill="#08080b" />
      <circle cx="128" cy="128" r="10" fill="#ffffff" />
      <path d="M128 63L91.5 96.5L145.5 113.5Z" fill="#ffffff" />
      <path d="M193 128L159.5 91.5L142.5 145.5Z" fill="#ffffff" />
      <path d="M128 193L164.5 159.5L110.5 142.5Z" fill="#ffffff" />
      <path d="M63 128L96.5 164.5L113.5 110.5Z" fill="#ffffff" />
    </svg>
  );
};

export const NexioLogo: FC<{
  height?: number;
  className?: string;
  style?: CSSProperties;
}> = ({ height = 32, className, style }) => {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        color: 'inherit',
        textDecoration: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      <NexioIcon size={height} />
      <span
        style={{
          fontSize: `${Math.round(height * 0.65)}px`,
          fontWeight: 700,
          letterSpacing: '0.12em',
          lineHeight: 1,
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        NEXIO
      </span>
    </div>
  );
};

export const Logo = NexioLogo;
export default NexioLogo;
