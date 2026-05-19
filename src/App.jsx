import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth }   from "./hooks/useAuth";
import { useCircle } from "./hooks/useCircle";
import AppShell      from "./components/layout/AppShell";
import Auth          from "./pages/Auth";
import CircleSetup   from "./pages/CircleSetup";
import Feed          from "./pages/Feed";
import Mood          from "./pages/Mood";
import NewPost       from "./pages/NewPost";
import Archive       from "./pages/Archive";
import Recs          from "./pages/Recs";
import CatGame       from "./pages/CatGame";
import Profile       from "./pages/Profile";

function ProtectedApp() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { circle, loading: circleLoading, refetch } = useCircle(user?.id);

  if (authLoading || circleLoading) {
    return (
      <div className="app-container flex items-center justify-center min-h-screen">
        <p className="font-hand text-2xl text-muted animate-pulse">loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // New user — no circle yet
  if (!circle) {
    return <CircleSetup user={user} onDone={refetch} />;
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/"        element={<Feed    user={user} circle={circle} />} />
        <Route path="/mood"    element={<Mood    user={user} circle={circle} />} />
        <Route path="/post"    element={<NewPost user={user} circle={circle} />} />
        <Route path="/archive" element={<Archive user={user} circle={circle} />} />
        <Route path="/recs"    element={<Recs     user={user} circle={circle} />} />
        <Route path="/game"    element={<CatGame  user={user} circle={circle} />} />
        <Route path="/profile" element={<Profile user={user} circle={circle} signOut={signOut} />} />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={loading ? null : user ? <Navigate to="/" replace /> : <Auth />}
        />
        <Route path="/*" element={<ProtectedApp />} />
      </Routes>
    </BrowserRouter>
  );
}
