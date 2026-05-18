import BottomNav from "./BottomNav";

export default function AppShell({ children }) {
  return (
    <div className="app-container">
      <main className="pb-24 pt-2 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
