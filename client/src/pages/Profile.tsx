import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return <div>Please login to view your profile</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 text-sm text-gray-900">{user.email}</div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">User ID</label>
              <div className="mt-1 text-sm text-gray-900">{user.uid}</div>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}