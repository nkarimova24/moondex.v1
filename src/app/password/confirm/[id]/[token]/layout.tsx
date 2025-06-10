import { ReactNode } from 'react';

// Static layout component
export default function PasswordResetLayout({ children }: { children: ReactNode }) {
  return (
    <div id="password-reset-layout">
      {children}
      <div id="client-component-mount-point" />
    </div>
  );
} 