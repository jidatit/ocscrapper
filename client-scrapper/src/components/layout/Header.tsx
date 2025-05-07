import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { BriefcaseIcon, Menu, X } from 'lucide-react';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
      to={to}
      className={`px-4 py-2 rounded-md transition-colors ${isActive(to)
        ? 'bg-primary/10 text-primary font-medium'
        : 'text-foreground/80 hover:text-foreground hover:bg-muted'
        }`}
      onClick={() => setMobileMenuOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center text-primary font-semibold text-xl">
            <BriefcaseIcon className="h-6 w-6 mr-2" />
            <span>CaseTracker</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {isAuthenticated && (
            <>
              <NavLink to="/cases">Cases</NavLink>
              <NavLink to="/changePassword">Change Password</NavLink>
              <Button variant="ghost" onClick={logout} className="ml-2">
                Logout
              </Button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/signup">Sign Up</NavLink>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t p-4 flex flex-col space-y-3">
          {isAuthenticated && (
            <>
              <NavLink to="/cases">Cases</NavLink>
              <Button variant="ghost" onClick={logout} className="justify-start">
                Logout
              </Button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/signup">Sign Up</NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
}