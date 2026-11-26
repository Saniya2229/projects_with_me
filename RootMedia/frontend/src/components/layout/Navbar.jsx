import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/employees', label: 'Employees', end: false },
  { to: '/tasks', label: 'Tasks', end: false },
];

export default function Navbar() {
  return (
    <header
      style={{ background: 'var(--nav-bg)' }}
      className="text-white shadow-md sticky top-0 z-40 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
        <nav className="flex items-center space-x-1 sm:space-x-2 text-sm font-medium">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md transition ${
                  isActive
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block text-sm font-medium tracking-wide text-slate-100 truncate">
          MERN stack developer practical task
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

