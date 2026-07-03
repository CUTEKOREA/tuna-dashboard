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
    <SidebarSvgIcon {...props}>
      <path d="M8.25 9.15C8.25 6.05 9.95 4 12 4s3.75 2.05 3.75 5.15v2.05c0 2.05-1.5 3.35-3.75 3.35s-3.75-1.3-3.75-3.35V9.15Z" />
      <circle cx="10.55" cy="8.65" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="13.45" cy="8.65" r="0.55" fill="currentColor" stroke="none" />
      <path d="M8.65 13.25 5.15 16.05" />
      <path d="M10.4 14.45 8.45 18.5" />
      <path d="M12 14.75v4.45" />
      <path d="M13.6 14.45l1.95 4.05" />
      <path d="M15.35 13.25l3.5 2.8" />
      <path d="M6.45 17.55c1.7 1.45 3.55 2.2 5.55 2.2s3.85-.75 5.55-2.2" />
    </SidebarSvgIcon>
  );
}

export function LongArmOctopusIcon(props: SidebarSvgIconProps) {
  return (
    <SidebarSvgIcon {...props}>
      <path d="M9 8.15C9 5.65 10.25 4 12 4s3 1.65 3 4.15v3.45c0 1.85-1.25 3.05-3 3.05s-3-1.2-3-3.05V8.15Z" />
      <circle cx="10.8" cy="8.6" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="13.2" cy="8.6" r="0.5" fill="currentColor" stroke="none" />
      <path d="M9.2 13.1C6.35 14.5 5 16.6 5 19.4" />
      <path d="M10.65 14.1c-1.3 2.2-1.25 4.15.05 5.95" />
      <path d="M13.35 14.1c1.3 2.2 1.25 4.15-.05 5.95" />
      <path d="M14.8 13.1c2.85 1.4 4.2 3.5 4.2 6.3" />
      <path d="M6.9 18.85c-1.2-.45-1.95-1.3-2.2-2.45" />
      <path d="M17.1 18.85c1.2-.45 1.95-1.3 2.2-2.45" />
    </SidebarSvgIcon>
  );
}
