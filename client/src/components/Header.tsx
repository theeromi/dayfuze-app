import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <span className="text-2xl font-bold text-blue-600">DayFuse</span>
        </Link>
        
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/profile">
                <span className="text-gray-600 hover:text-gray-900">Profile</span>
              </Link>
              <button 
                onClick={logout}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login">
              <span className="text-gray-600 hover:text-gray-900">Login</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}