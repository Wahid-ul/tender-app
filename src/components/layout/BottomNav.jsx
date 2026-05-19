import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

const tabs = [
  { to: "/",        icon: "🏠", label: "Home"    },
  { to: "/mood",    icon: "🌡️", label: "Mood"    },
  { to: "/post",    icon: "✏️", label: "Post"    },
  { to: "/recs",    icon: "💡", label: "Recs"    },
  { to: "/archive", icon: "🎞️", label: "Archive" },
  { to: "/profile", icon: "🤍", label: "Me"      },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50"
      style={{
        background: "rgba(245, 237, 224, 0.92)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(0,0,0,0.07)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.to === "/"}>
            {({ isActive }) => (
              <motion.div
                className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl"
                animate={{ scale: isActive ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                style={{ background: isActive ? "rgba(0,0,0,0.06)" : "transparent" }}
              >
                <span className="text-xl leading-none">{tab.icon}</span>
                <span
                  className="text-[10px] font-medium"
                  style={{ color: isActive ? "var(--ink)" : "var(--muted)" }}
                >
                  {tab.label}
                </span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
