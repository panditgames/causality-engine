import React from 'react';

export const Dashboard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)] text-white flex flex-col font-sans">
      <header className="p-4 border-b border-[var(--color-border-glass)] glass-panel m-4 mb-0 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-neon-purple)] m-0 tracking-wider">CAUSALITY</h1>
          <p className="text-sm text-gray-400 m-0">THE BUTTERFLY EFFECT ENGINE</p>
        </div>
      </header>
      <main className="flex-1 p-4 flex gap-4 overflow-hidden">
        {children}
      </main>
    </div>
  );
};
