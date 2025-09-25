import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { 
  Users, 
  BookOpen, 
  FileText, 
  TrendingUp,
  Award,
  Bot,
  Target,
  MessageCircle,
  Activity,
  BarChart3,
  Plus,
  Eye,
  Settings,
  Play,
  Archive,
  Flag,
  Zap,
  Clock,
  CheckCircle,
  Edit,
  List
} from 'lucide-react';

export default function AdminDashboard({ auth = {}, stats }) {
    console.log('Received props:', { auth, stats });
    
    const defaultStats = {
        total_students: 0,
        total_lessons: 0,
        total_tests: 0,
        active_students: 0,
        ...stats
    };
    
    const user = auth?.user;
    
    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
                <div className="text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Loading Dashboard...</h2>
                    <p className="text-gray-300">Please wait while we prepare your admin panel.</p>
                </div>
            </div>
        );
    }

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-3xl text-white leading-tight">Administrator Dashboard</h2>
                        <p className="text-green-300 mt-1">Manage your Python learning platform</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="text-right">
                            <div className="text-white font-medium">Welcome back, {user?.name}</div>
                            <div className="text-green-300 text-sm">Admin Panel Access</div>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <Settings className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Students */}
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:from-white/10 hover:to-white/15 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {defaultStats.total_students.toLocaleString()}
                    </div>
                    <div className="text-gray-300 text-sm font-medium mb-2">Total Students</div>
                    <div className="text-xs text-green-400">+12% this month</div>
                </div>

                {/* Active Students */}
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:from-white/10 hover:to-white/15 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {defaultStats.active_students.toLocaleString()}
                    </div>
                    <div className="text-gray-300 text-sm font-medium mb-2">Active Students</div>
                    <div className="text-xs text-green-400">Last 7 days</div>
                </div>

                {/* Total Lessons */}
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:from-white/10 hover:to-white/15 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <BarChart3 className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {defaultStats.total_lessons.toLocaleString()}
                    </div>
                    <div className="text-gray-300 text-sm font-medium mb-2">Total Lessons</div>
                    <div className="text-xs text-purple-400">Content library</div>
                </div>

                {/* Total Tests */}
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:from-white/10 hover:to-white/15 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <CheckCircle className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {defaultStats.total_tests.toLocaleString()}
                    </div>
                    <div className="text-gray-300 text-sm font-medium mb-2">Total Tests</div>
                    <div className="text-xs text-orange-400">Assessment pool</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Quick Actions</h3>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-green-400 font-medium">All systems operational</span>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link
                        href={route('admin.lessons.create')}
                        className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-4 hover:from-green-500/20 hover:to-blue-500/20 transition-all group flex items-center space-x-3"
                    >
                        <Plus className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                        <span className="text-white font-medium">New Lesson</span>
                    </Link>
                    
                    <Link
                        href={route('admin.lessons.index')}
                        className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 hover:from-purple-500/20 hover:to-pink-500/20 transition-all group flex items-center space-x-3"
                    >
                        <FileText className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                        <span className="text-white font-medium">Manage Tests</span>
                    </Link>
                    
                    <button className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all group flex items-center space-x-3">
                        <BarChart3 className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                        <span className="text-white font-medium">Analytics</span>
                    </button>
                    
                    <button className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4 hover:from-orange-500/20 hover:to-red-500/20 transition-all group flex items-center space-x-3">
                        <Users className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
                        <span className="text-white font-medium">Students</span>
                    </button>
                </div>
            </div>

            {/* Management Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Lessons Management */}
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:from-white/10 hover:to-white/15 transition-all duration-300">
                    <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Lessons Management</h3>
                            <p className="text-sm text-gray-400">Content & Curriculum</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Link
                            href={route('admin.lessons.create')}
                            className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all group"
                        >
                            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Create New Lesson</span>
                        </Link>
                        <Link
                            href={route('admin.lessons.index')}
                            className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all group"
                        >
                            <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Manage Existing Lessons</span>
                        </Link>
                        <button className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all group">
                            <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>View Lesson Analytics</span>
                        </button>
                    </div>
                </div>

                {/* Tests & Quizzes - Updated with actual links */}
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:from-white/10 hover:to-white/15 transition-all duration-300">
                    <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Tests & Quizzes</h3>
                            <p className="text-sm text-gray-400">Assessment Tools</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Link
                            href={route('admin.lessons.index')}
                            className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all group"
                        >
                            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Create New Test</span>
                        </Link>
                        <Link
                            href={route('admin.lessons.index')}
                            className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all group"
                        >
                            <List className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Manage All Tests</span>
                        </Link>
                        <Link
                            href={route('admin.lessons.index')}
                            className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all group"
                        >
                            <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Manage Questions</span>
                        </Link>
                        <button className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all group">
                            <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>View Submissions</span>
                        </button>
                        <button className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all group">
                            <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Test Analytics</span>
                        </button>
                    </div>
                </div>

                {/* Student Management */}
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:from-white/10 hover:to-white/15 transition-all duration-300">
                    <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Student Management</h3>
                            <p className="text-sm text-gray-400">User Administration</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <button className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all group">
                            <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>View All Students</span>
                        </button>
                        <button className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all group">
                            <TrendingUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Progress Reports</span>
                        </button>
                        <button className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all group">
                            <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Learning Path Analytics</span>
                        </button>
                    </div>
                </div>

                {/* Rewards System */}
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:from-white/10 hover:to-white/15 transition-all duration-300">
                    <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                            <Award className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Rewards System</h3>
                            <p className="text-sm text-gray-400">Gamification</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <button className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all group">
                            <Award className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Manage Rewards</span>
                        </button>
                        <button className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all group">
                            <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Points Configuration</span>
                        </button>
                        <button className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all group">
                            <Target className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Achievement Levels</span>
                        </button>
                    </div>
                </div>

                {/* AI Assistant */}
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:from-white/10 hover:to-white/15 transition-all duration-300">
                    <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
                            <p className="text-sm text-gray-400">Intelligent Support</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <button className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all group">
                            <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>View AI Logs</span>
                        </button>
                        <button className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all group">
                            <Archive className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Clear Chat History</span>
                        </button>
                        <button className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all group">
                            <Settings className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>AI Configuration</span>
                        </button>
                    </div>
                </div>

                {/* Interactive Exercises */}
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:from-white/10 hover:to-white/15 transition-all duration-300">
                    <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-green-500 rounded-xl flex items-center justify-center mr-4">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Interactive Exercises</h3>
                            <p className="text-sm text-gray-400">Hands-on Learning</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <button className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all group">
                            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Drag & Drop Builder</span>
                        </button>
                        <button className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all group">
                            <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Preview Content</span>
                        </button>
                        <button className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all group">
                            <Archive className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Archive Modules</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Activity & Platform Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Recent Activity */}
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                        <Activity className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-gray-300 text-sm">New student registration</span>
                            </div>
                            <span className="text-xs text-gray-500">2m ago</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="text-gray-300 text-sm">Lesson completed by student</span>
                            </div>
                            <span className="text-xs text-gray-500">5m ago</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                <span className="text-gray-300 text-sm">New test submission received</span>
                            </div>
                            <span className="text-xs text-gray-500">8m ago</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                <span className="text-gray-300 text-sm">New test created</span>
                            </div>
                            <span className="text-xs text-gray-500">10m ago</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                                <span className="text-gray-300 text-sm">Question bank updated</span>
                            </div>
                            <span className="text-xs text-gray-500">15m ago</span>
                        </div>
                    </div>
                </div>

                {/* Platform Summary */}
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Platform Summary</h3>
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="space-y-6">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20">
                            <div className="text-2xl font-bold text-blue-400 mb-2">
                                {((defaultStats.active_students / Math.max(defaultStats.total_students, 1)) * 100).toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-300">Student Engagement Rate</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg border border-green-500/20">
                            <div className="text-2xl font-bold text-green-400 mb-2">
                                {defaultStats.total_lessons + defaultStats.total_tests}
                            </div>
                            <div className="text-sm text-gray-300">Total Learning Content</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20">
                            <div className="text-2xl font-bold text-purple-400 mb-2">
                                {Math.floor(Math.random() * 500) + 100}
                            </div>
                            <div className="text-sm text-gray-300">Points Awarded Today</div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}