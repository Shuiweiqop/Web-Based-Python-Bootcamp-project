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
  Settings2,
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

export default function AdminDashboard({ auth = {}, stats = {}, healthStatus = {}, summaryCards = {}, recentActivity = [], performance = [] }) {
    const defaultStats = {
        total_students: stats?.total_students ?? 0,
        total_lessons: stats?.total_lessons ?? 0,
        total_tests: stats?.total_tests ?? 0,
        active_students: stats?.active_students ?? 0,
    };

    const defaultSummaryCards = {
        total_students: {
            value: defaultStats.total_students,
            trend: { direction: 'neutral', percent: 0, label: '0%' },
            caption: 'No student growth data yet',
        },
        active_students: {
            value: defaultStats.active_students,
            trend: { direction: 'neutral', percent: 0, label: '0%' },
            caption: 'No activity trend data yet',
        },
        total_lessons: {
            value: defaultStats.total_lessons,
            trend: { direction: 'neutral', percent: 0, label: '0%' },
            caption: 'No lesson growth data yet',
        },
        total_tests: {
            value: defaultStats.total_tests,
            trend: { direction: 'neutral', percent: 0, label: '0%' },
            caption: 'No test growth data yet',
        },
    };

    const colorClasses = {
        green: 'bg-green-500',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500',
        amber: 'bg-amber-500',
    };

    const performanceBarClasses = {
        green: 'bg-green-500',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
    };

    const healthClasses = {
        healthy: 'bg-green-100 text-green-800 border-green-200',
        attention: 'bg-amber-100 text-amber-800 border-amber-200',
        critical: 'bg-rose-100 text-rose-800 border-rose-200',
    };

    const healthDotClasses = {
        healthy: 'bg-green-600',
        attention: 'bg-amber-500',
        critical: 'bg-rose-600',
    };

    const trendClasses = {
        up: 'bg-green-50 text-green-700',
        down: 'bg-rose-50 text-rose-700',
        neutral: 'bg-slate-100 text-slate-600',
    };

    const cardSummaries = {
        total_students: summaryCards?.total_students ?? defaultSummaryCards.total_students,
        active_students: summaryCards?.active_students ?? defaultSummaryCards.active_students,
        total_lessons: summaryCards?.total_lessons ?? defaultSummaryCards.total_lessons,
        total_tests: summaryCards?.total_tests ?? defaultSummaryCards.total_tests,
    };

    const dashboardHealth = {
        state: healthStatus?.state ?? 'healthy',
        label: healthStatus?.label ?? 'Platform Healthy',
        summary: healthStatus?.summary ?? 'No open platform issues detected',
        details: healthStatus?.details ?? [],
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
                        <div className={`rounded-lg border px-3 py-2 ${healthClasses[dashboardHealth.state] ?? healthClasses.healthy}`}>
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <div className={`h-2 w-2 rounded-full animate-pulse ${healthDotClasses[dashboardHealth.state] ?? healthDotClasses.healthy}`} />
                                <span>{dashboardHealth.label}</span>
                            </div>
                            <p className="mt-1 text-xs opacity-90">{dashboardHealth.summary}</p>
                            {dashboardHealth.details.length > 0 && (
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    {dashboardHealth.details.map((detail, index) => {
                                        const detailLabel = typeof detail === 'string' ? detail : detail?.label;
                                        const detailValue = typeof detail === 'string' ? null : detail?.value;
                                        const detailHref = typeof detail === 'string' ? null : detail?.href;
                                        const content = (
                                            <>
                                                <span className="text-sm font-semibold text-slate-900">
                                                    {typeof detailValue === 'number' ? detailValue.toLocaleString() : detailValue}
                                                </span>
                                                <span className="text-[11px] text-slate-600">{detailLabel}</span>
                                            </>
                                        );

                                        if (!detailHref) {
                                            return (
                                                <div
                                                    key={`${detailLabel}-${index}`}
                                                    className="flex min-w-[9rem] flex-col rounded-md border border-white/70 bg-white/80 px-2.5 py-2"
                                                >
                                                    {content}
                                                </div>
                                            );
                                        }

                                        return (
                                            <Link
                                                key={`${detailLabel}-${index}`}
                                                href={detailHref}
                                                className="flex min-w-[9rem] flex-col rounded-md border border-white/70 bg-white/80 px-2.5 py-2 transition hover:border-indigo-200 hover:bg-white"
                                            >
                                                {content}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
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
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${trendClasses[cardSummaries.total_students.trend.direction] ?? trendClasses.neutral}`}>
                            <TrendingUp className="w-3 h-3" />
                            {cardSummaries.total_students.trend.label}
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                        {cardSummaries.total_students.value.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600">Total Students</div>
                    <div className="mt-3 text-xs text-slate-500">{cardSummaries.total_students.caption}</div>
                </div>

                {/* Active Students */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Activity className="w-6 h-6 text-green-600" />
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${trendClasses[cardSummaries.active_students.trend.direction] ?? trendClasses.neutral}`}>
                            <TrendingUp className="w-3 h-3" />
                            {cardSummaries.active_students.trend.label}
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                        {cardSummaries.active_students.value.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600">Active This Week</div>
                    <div className="mt-3 text-xs text-slate-500">{cardSummaries.active_students.caption}</div>
                </div>

                {/* Total Lessons */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${trendClasses[cardSummaries.total_lessons.trend.direction] ?? trendClasses.neutral}`}>
                            <TrendingUp className="w-3 h-3" />
                            {cardSummaries.total_lessons.trend.label}
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                        {cardSummaries.total_lessons.value.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600">Total Lessons</div>
                    <div className="mt-3 text-xs text-slate-500">{cardSummaries.total_lessons.caption}</div>
                </div>

                {/* Total Tests */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-orange-600" />
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${trendClasses[cardSummaries.total_tests.trend.direction] ?? trendClasses.neutral}`}>
                            <TrendingUp className="w-3 h-3" />
                            {cardSummaries.total_tests.trend.label}
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                        {cardSummaries.total_tests.value.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600">Total Tests</div>
                    <div className="mt-3 text-xs text-slate-500">{cardSummaries.total_tests.caption}</div>
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
                            <span className="text-sm font-medium text-slate-900">Progress Reports</span>
                        </div>
                    </Link>
                    
                    <Link
                        href={route('admin.students.index')}
                        className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-md transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                                <Users className="w-5 h-5 text-orange-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-900">Manage Students</span>
                        </div>
                    </Link>

                    <Link
                        href={route('admin.daily-challenges.index')}
                        className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-md transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                                <Settings2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-900">Mission Rules</span>
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
                            href={route('admin.placement-tests.index')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>Placement Tests</span>
                            <Plus className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                        <Link
                            href={route('admin.exercises.index')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>Manage Exercises</span>
                            <Eye className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                        <Link
                            href={route('admin.progress.index')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>Learning Progress</span>
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
                            href={route('admin.students.index')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>Manage Students</span>
                            <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                        <Link
                            href={route('admin.student-paths.index')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>Student Paths</span>
                            <TrendingUp className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                        <Link
                            href={route('admin.progress.index')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>Progress Reports</span>
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
                        <Link
                            href={route('admin.daily-challenges.index')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>Mission Configuration</span>
                            <Settings2 className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
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
                            href={route('admin.student-paths.analytics')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <span>Path Analytics</span>
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
                            <span>Moderate Forum</span>
                            <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                        <Link
                            href={route('admin.forum.reports.index')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-white/60 rounded-lg transition-colors group"
                        >
                            <span>Forum Reports</span>
                            <Flag className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                        <Link
                            href={route('admin.ai-logs.index')}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-white/60 rounded-lg transition-colors group"
                        >
                            <span>AI Session Logs</span>
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
                    {recentActivity.length > 0 ? (
                        <div className="space-y-3">
                            {recentActivity.map((item, index) => (
                                item.href ? (
                                    <Link
                                        key={`${item.type}-${item.timestamp}-${index}`}
                                        href={item.href}
                                        className="flex items-center gap-3 rounded-lg border border-transparent bg-slate-50 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/60"
                                    >
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colorClasses[item.color] ?? 'bg-slate-400'}`} />
                                        <span className="text-sm text-slate-700 flex-1">{item.message}</span>
                                        <span className="text-xs text-slate-500 whitespace-nowrap">{item.time_ago ?? 'Just now'}</span>
                                    </Link>
                                ) : (
                                    <div key={`${item.type}-${item.timestamp}-${index}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colorClasses[item.color] ?? 'bg-slate-400'}`} />
                                        <span className="text-sm text-slate-700 flex-1">{item.message}</span>
                                        <span className="text-xs text-slate-500 whitespace-nowrap">{item.time_ago ?? 'Just now'}</span>
                                    </div>
                                )
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                            No real activity yet. Once students start registering, learning, and posting, this feed will update automatically.
                        </div>
                    )}
                </div>

                {/* Performance Stats */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900">Platform Performance</h3>
                        <BarChart3 className="w-5 h-5 text-slate-400" />
                    </div>
                    {performance.length > 0 ? (
                        <div className="space-y-4">
                            {performance.map((metric) => (
                                <div key={metric.label} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">{metric.label}</span>
                                        <span className="font-medium text-slate-900">{metric.value}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${performanceBarClasses[metric.color] ?? 'bg-slate-500'}`}
                                            style={{ width: `${Math.max(0, Math.min(metric.value, 100))}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">{metric.hint}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                            No tracked performance metrics yet. This section will populate once lesson progress and test submissions start coming in.
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
