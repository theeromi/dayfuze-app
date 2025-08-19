import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, orderBy, Timestamp, serverTimestamp } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBL2d_IwH6JkK4sZMJypA_Vf-S3RlxvmGc",
  authDomain: "dayfuse-web.firebaseapp.com",
  projectId: "dayfuse-web",
  storageBucket: "dayfuse-web.firebasestorage.app",
  messagingSenderId: "593450445384",
  appId: "1:593450445384:web:b7ce3b6b34124c97f9c67d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'progress' | 'done';
  dueDate: Timestamp;
  dueTime?: string;
  completed: boolean;
  createdAt: Timestamp;
}

const DayFusePreview: React.FC = () => {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLogin, setIsLogin] = React.useState(true);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const [activeView, setActiveView] = React.useState<'dashboard' | 'tasks' | 'timeline' | 'profile'>('dashboard');

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  React.useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      return;
    }

    const tasksRef = collection(db, 'users', currentUser.uid, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList: Task[] = [];
      snapshot.forEach((doc) => {
        taskList.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(taskList);
    });

    return unsubscribe;
  }, [currentUser]);

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const addTask = async () => {
    if (!currentUser || !newTaskTitle.trim()) return;

    const tasksRef = collection(db, 'users', currentUser.uid, 'tasks');
    await addDoc(tasksRef, {
      title: newTaskTitle.trim(),
      description: 'Created from web preview',
      priority: 'medium',
      status: 'todo',
      dueDate: Timestamp.fromDate(new Date()),
      completed: false,
      createdAt: serverTimestamp(),
    });
    setNewTaskTitle('');
  };

  const getTodaysTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tasks.filter(task => {
      const taskDate = task.dueDate.toDate();
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return '#FF5A77';
      case 'progress': return '#FFB833';
      case 'done': return '#30D394';
      default: return '#666';
    }
  };

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading DayFuse...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-blue-500">Day</span>
              <span className="text-orange-400">Fuse</span>
            </h1>
            <p className="text-gray-600">Your productivity companion</p>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleAuth}
              className="w-full bg-blue-500 text-white p-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-blue-500 font-medium hover:text-blue-600"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const todaysTasks = getTodaysTasks();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            <span className="text-blue-500">Day</span>
            <span className="text-orange-400">Fuse</span>
          </h1>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex space-x-8">
            {['dashboard', 'tasks', 'timeline', 'profile'].map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize ${
                  activeView === view
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {view}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4">
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg text-gray-600">Good day,</h2>
              <h1 className="text-3xl font-bold text-gray-800">{displayName}!</h1>
            </div>

            {/* Task Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">This Month</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{tasks.filter(t => t.completed).length}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{tasks.filter(t => !t.completed).length}</div>
                  <div className="text-sm text-gray-600">Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">{tasks.length}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>
            </div>

            {/* Today's Tasks */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Today's Tasks</h3>
              {todaysTasks.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {todaysTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white rounded-xl shadow-sm p-4 border-l-4"
                      style={{ borderLeftColor: getStatusColor(task.status) }}
                    >
                      <h4 className="font-semibold text-gray-800 mb-2">{task.title}</h4>
                      {task.description && (
                        <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">
                          {task.priority.toUpperCase()} PRIORITY
                        </span>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: getStatusColor(task.status) }}
                        >
                          {task.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <p className="text-gray-600">No tasks for today. Great job!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'tasks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">All Tasks</h2>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Add new task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addTask}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Task
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-xl shadow-sm p-4 border-l-4"
                  style={{ borderLeftColor: getStatusColor(task.status) }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">{task.title}</h4>
                      {task.description && (
                        <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Due: {task.dueDate.toDate().toLocaleDateString()}</span>
                        <span>Priority: {task.priority}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: getStatusColor(task.status) }}
                      >
                        {task.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'timeline' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Timeline View</h2>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-600 mb-4">Timeline view shows your tasks organized by date</p>
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getStatusColor(task.status) }}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-gray-500">
                        {task.dueDate.toDate().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-blue-500">👤</span>
                </div>
                <h3 className="text-xl font-semibold">{displayName}</h3>
                <p className="text-gray-600">{currentUser.email}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">{tasks.length}</div>
                  <div className="text-sm text-gray-600">Total Tasks</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">{tasks.filter(t => t.completed).length}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayFusePreview;