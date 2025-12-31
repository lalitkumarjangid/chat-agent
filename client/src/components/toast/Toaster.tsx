import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      theme="dark"
      toastOptions={{
        style: {
          background: '#18181b',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
          borderRadius: '8px',
          padding: '12px 16px',
        },
        classNames: {
          toast: 'sonner-toast',
          description: 'text-gray-400 text-sm',
          actionButton: 'bg-white/10 hover:bg-white/20',
          closeButton: 'bg-white/10 hover:bg-white/20',
        },
      }}
    />
  );
}
