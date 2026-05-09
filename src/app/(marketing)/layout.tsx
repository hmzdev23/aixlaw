export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <main id="main-content">
        {children}
      </main>
    </div>
  );
}
