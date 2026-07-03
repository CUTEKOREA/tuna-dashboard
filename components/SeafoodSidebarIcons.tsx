import type { ReactNode, SVGProps } from 'react';

type SidebarSvgIconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  strokeWidth?: number;
};

function SidebarSvgIcon({
  size = 18,
  strokeWidth = 1.9,
  children,
  ...props
}: SidebarSvgIconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function WebfootOctopusIcon(props: SidebarSvgIconProps) {
  return (
    <SidebarSvgIcon {...props} strokeWidth={props.strokeWidth ?? 2.05}>
      <path d="M7.65 9.3C7.65 6.05 9.4 4 12 4s4.35 2.05 4.35 5.3v1.25c0 2.35-1.65 3.8-4.35 3.8s-4.35-1.45-4.35-3.8V9.3Z" />
      <path d="M9.55 7.2c1.55-.65 3.35-.65 4.9 0" opacity="0.5" />
      <circle cx="10.45" cy="8.75" r="0.62" fill="currentColor" stroke="none" />
      <circle cx="13.55" cy="8.75" r="0.62" fill="currentColor" stroke="none" />
      <path d="M8.4 13.35 5.8 15.55c-.6.5-.55 1.3.1 1.65.75.42 1.8.02 2.55-.95l.85-1.1" />
      <path d="M10.25 14.2 8.95 18c-.25.78.25 1.55 1.02 1.6.82.05 1.45-.62 1.52-1.58l.18-2.8" />
      <path d="M13.75 14.2 15.05 18c.25.78-.25 1.55-1.02 1.6-.82.05-1.45-.62-1.52-1.58l-.18-2.8" />
      <path d="M15.6 13.35 18.2 15.55c.6.5.55 1.3-.1 1.65-.75.42-1.8.02-2.55-.95l-.85-1.1" />
      <path d="M7.15 17.65c1.4 1.4 3.05 2.1 4.85 2.1s3.45-.7 4.85-2.1" opacity="0.72" />
    </SidebarSvgIcon>
  );
}

export function LongArmOctopusIcon(props: SidebarSvgIconProps) {
  return (
    <SidebarSvgIcon {...props} strokeWidth={props.strokeWidth ?? 2}>
      <path d="M9.35 8.2C9.35 5.65 10.45 4 12 4s2.65 1.65 2.65 4.2v3.05c0 1.8-1.1 2.95-2.65 2.95s-2.65-1.15-2.65-2.95V8.2Z" />
      <circle cx="10.85" cy="8.55" r="0.52" fill="currentColor" stroke="none" />
      <circle cx="13.15" cy="8.55" r="0.52" fill="currentColor" stroke="none" />
      <path d="M9.55 12.9c-3.1.95-4.75 3.05-4.95 6.3" />
      <path d="M10.65 13.95c-2 1.95-2.35 4.05-1.05 6.3" />
      <path d="M13.35 13.95c2 1.95 2.35 4.05 1.05 6.3" />
      <path d="M14.45 12.9c3.1.95 4.75 3.05 4.95 6.3" />
      <path d="M5.05 19.2c1.25-.1 2.2-.72 2.85-1.85" />
      <path d="M18.95 19.2c-1.25-.1-2.2-.72-2.85-1.85" />
      <path d="M8.2 16.2c-.65-.65-1.45-.95-2.42-.9" opacity="0.72" />
      <path d="M15.8 16.2c.65-.65 1.45-.95 2.42-.9" opacity="0.72" />
    </SidebarSvgIcon>
  );
}
