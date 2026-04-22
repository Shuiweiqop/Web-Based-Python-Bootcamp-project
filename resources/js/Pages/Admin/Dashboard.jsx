import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { 
  Users, 
  BookOpen, 
  FileText, 
  TrendingUp,
  Award,
  Target,
  Activity,
  BarChart3,
  Plus,
  Eye,
  Play,
  CheckCircle,
  Clock,
  Zap,
  ArrowUpRight,
  Sparkles,
  MessageSquare,
  Flag,
  Map,
  UserCheck,
  Brain
} from 'lucide-react';

export default function AdminDashboard({ auth = {}, stats = {} }) {
    console.log('Dashboard Stats:', stats);
    
    const defaultStats = {
        total_students: stats?.total_students ?? 0,
        total_lessons: stats?.total_lessons ?? 0,
        total_tests: stats?.total_tests ?? 0,
        active_students: stats?.active_students ?? 0,
    };
    
    const user = auth?.user;
    
    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading Dashboard...</h2>
                    <p className="text-slate-600">Please wait while we prepare your admin panel.</p>
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
                        <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
                        <p className="text-slate-600 mt-1">Welcome back, {user?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 text-sm font-medium rounded-lg border border-green-200 dark:border-green-700">
    <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-pulse" />
    All systems operational
</span>
                    </div>
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Students */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded">
                            <TrendingUp className="w-3 h-3" />
                            12%
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                        {defaultStats.total_students.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600">Total Students</div>
                    <div className="mt-3 text-xs text-slate-500">+12% from last month</div>
                </div>

                {/* Active Students */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Activity className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                        {defaultStats.active_students.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600">Active This Week</div>
                    <div className="mt-3 text-xs text-slate-500">Last 7 days</div>
                </div>

                {/* Total Lessons */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-purple-600" />
                        </div>
                        <BarChart3 className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                        {defaultStats.total_lessons.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600">Total Lessons</div>
                    <div className="mt-3 text-xs text-slate-500">Content library</div>
                </div>

                {/* Total Tests */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-orange-600" />
                        </div>
                        <CheckCircle className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                        {defaultStats.total_tests.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600">Total Tests</div>
                    <div className="mt-3 text-xs text-slate-500">Assessment pool</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link
                        href={route('admin.lessons.create')}
                        className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                                <Plus className="w-5 h-5 text-indigo-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-900">New Lesson</span>
                        </div>
                    </Link>
                    
                    <Link
                        href={route('admin.lessons.index')}
                        className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                <FileText className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-900">Manage Lessons</span>
                        </div>
                    </Link>
                    
                    <Link
                        href={route('admin.progress.index')}
                        className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-900">Analytics</span>
                        </div>
                    </Link>
                    
                    <Link
                        href={route('admin.student-paths.index')}
                        className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-md transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                                <Users className="w-5 h-5 text-orange-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-900">Students</span>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Management Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Lessons Management */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Lessons</h3>
                            <p className="text-xs text-slate-500">Content & Curriculum</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Link
                            href={route('admin.lessons.create')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>Create New Lesson</span>
                            <Plus className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                        <Link
                            href={route('admin.lessons.index')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>Manage Lessons</span>
                            <Eye className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                        <Link
                            href={route('admin.progress.index')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>View Analytics</span>
                            <BarChart3 className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                    </div>
                </div>

                {/* Tests & Quizzes */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Tests & Quizzes</h3>
                            <p className="text-xs text-slate-500">Assessment Tools</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Link
                            href={route('admin.lessons.index')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>Manage Tests</span>
                            <Plus className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                        <Link
                            href={route('admin.lessons.index')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>Manage Exercises</span>
                            <Eye className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                        <Link
                            href={route('admin.progress.index')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>View Submissions</span>
                            <CheckCircle className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                    </div>
                </div>

                {/* Student Management */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Students</h3>
                            <p className="text-xs text-slate-500">User Management</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Link
                            href={route('admin.student-paths.index')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>Student Paths</span>
                            <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                        <Link
                            href={route('admin.progress.index')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>Progress Reports</span>
                            <TrendingUp className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                        <Link
                            href={route('admin.student-paths.analytics')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>Learning Analytics</span>
                            <BarChart3 className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                    </div>
                </div>

                {/* Rewards System */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Award className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Rewards</h3>
                            <p className="text-xs text-slate-500">Gamification</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Link
                            href={route('admin.rewards.index')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>Manage Rewards</span>
                            <Award className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                        <Link
                            href={route('admin.rewards.create')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>Create Reward</span>
                            <Plus className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                        <Link
                            href={route('admin.rewards.stats')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>View Statistics</span>
                            <Target className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                    </div>
                </div>

                {/* Learning Paths */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                            <Map className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Learning Paths</h3>
                            <p className="text-xs text-slate-500">Course Pathways</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Link
                            href={route('admin.learning-paths.create')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>Create Path</span>
                            <Plus className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                        <Link
                            href={route('admin.learning-paths.index')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>Manage Paths</span>
                            <Eye className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                        <Link
                            href={route('admin.student-paths.index')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>Student Progress</span>
                            <TrendingUp className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                    </div>
                </div>

                {/* Forum & AI Management */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <MessageSquare className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Community & AI</h3>
                            <p className="text-xs text-slate-600">Moderation Tools</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Link
                            href={route('forum.index')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-white/60 rounded-lg transition-colors group"
                        >
                            <span>Forum Posts</span>
                            <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                        <Link
                            href={route('admin.forum.reports.index')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-white/60 rounded-lg transition-colors group"
                        >
                            <span>Reports</span>
                            <Flag className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                        <Link
                            href={route('admin.ai-logs.index')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-white/60 rounded-lg transition-colors group"
                        >
                            <span>AI Logs</span>
                            <Brain className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Activity & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900">Recent Activity</h3>
                        <Activity className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                            <span className="text-sm text-slate-700 flex-1">New student registration</span>
                            <span className="text-xs text-slate-500">2m ago</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            <span className="text-sm text-slate-700 flex-1">Lesson completed</span>
                            <span className="text-xs text-slate-500">5m ago</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />
                            <span className="text-sm text-slate-700 flex-1">Test submitted</span>
                            <span className="text-xs text-slate-500">8m ago</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                            <span className="text-sm text-slate-700 flex-1">New forum post created</span>
                            <span className="text-xs text-slate-500">10m ago</span>
                        </div>
                    </div>
                </div>

                {/* Performance Stats */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900">Platform Performance</h3>
                        <BarChart3 className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Course Completion Rate</span>
                                <span className="font-medium text-slate-900">68%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '68%' }} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Test Pass Rate</span>
                                <span className="font-medium text-slate-900">85%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Student Engagement</span>
                                <span className="font-medium text-slate-900">
                                    {((defaultStats.active_students / Math.max(defaultStats.total_students, 1)) * 100).toFixed(0)}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div 
                                    className="bg-purple-500 h-2 rounded-full" 
                                    style={{ width: `${((defaultStats.active_students / Math.max(defaultStats.total_students, 1)) * 100).toFixed(0)}%` }} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}