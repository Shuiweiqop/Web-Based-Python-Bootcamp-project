// resources/js/Pages/Admin/Lessons/components/LessonSidebar.jsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { 
  Clock, 
  Award, 
  Calendar,
  Code2,
  FileCheck2,
  Shield,
  Edit3,
  PlusCircle,
  Target,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function LessonSidebar({ lesson, exercises, tests, routes, isDark }) {
  return (
    <div className="space-y-6">
      {/* Lesson Information Card */}
      <LessonInfoCard lesson={lesson} isDark={isDark} />

      {/* Live Editor Stats Card */}
      {exercises && exercises.length > 0 && (
        <LiveEditorStatsCard exercises={exercises} isDark={isDark} />
      )}

      {/* Completion Requirements Card */}
      <CompletionRequirementsCard 
        lesson={lesson} 
        exercises={exercises} 
        tests={tests} 
        isDark={isDark}
      />

      {/* Quick Actions Card */}
      <QuickActionsCard routes={routes} isDark={isDark} />

      {/* Content Security Info Card */}
      {lesson?.content && (
        <ContentSecurityCard contentType={lesson.content_type} isDark={isDark} />
      )}
    </div>
  );
}

// Sub-components for Sidebar
function LessonInfoCard({ lesson, isDark }) {
  return (
    <div className={cn(
      "rounded-2xl shadow-lg border backdrop-blur-sm overflow-hidden animate-fadeIn",
      isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
    )}>
      <div className={cn(
        "px-6 py-4 border-b bg-gradient-to-r",
        isDark 
          ? "border-white/10 from-blue-500/10 to-cyan-500/10" 
          : "from-blue-50 to-cyan-50 border-gray-200"
      )}>
        <h3 className={cn("text-lg font-bold flex items-center gap-2", isDark ? "text-white" : "text-gray-900")}>
          <Sparkles className="w-5 h-5" />
          Lesson Information
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <InfoRow 
            icon={<Clock className="w-4 h-4" />}
            label="Duration"
            value={`${lesson?.estimated_duration ?? 0} min`}
            isDark={isDark}
          />
          
          <InfoRow 
            icon={<Award className="w-4 h-4" />}
            label="Reward Points"
            value={`${lesson?.completion_reward_points ?? 0} pts`}
            isDark={isDark}
          />
          
          <InfoRow 
            icon={<Calendar className="w-4 h-4" />}
            label="Created"
            value={lesson?.created_at ? new Date(lesson.created_at).toLocaleDateString() : 'Unknown'}
            isDark={isDark}
          />
          
          <InfoRow 
            icon={<Calendar className="w-4 h-4" />}
            label="Updated"
            value={lesson?.updated_at ? new Date(lesson.updated_at).toLocaleDateString() : 'Unknown'}
            isDark={isDark}
            noBorder
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, isDark, noBorder = false }) {
  return (
    <div className={cn(
      "flex justify-between items-center",
      !noBorder && (isDark ? "pb-3 border-b border-white/10" : "pb-3 border-b border-gray-200")
    )}>
      <span className={cn(
        "text-sm flex items-center gap-2",
        isDark ? "text-slate-400" : "text-gray-600"
      )}>
        <span className={isDark ? "text-cyan-400" : "text-blue-600"}>{icon}</span>
        {label}
      </span>
      <span className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>
        {value}
      </span>
    </div>
  );
}

function LiveEditorStatsCard({ exercises, isDark }) {
  const totalExercises = exercises.length;
  const liveEditorEnabled = exercises.filter(ex => ex.enable_live_editor).length;
  const totalTestCases = exercises.reduce((sum, ex) => 
    sum + (Array.isArray(ex.test_cases) ? ex.test_cases.length : 0), 0
  );

  return (
    <div className={cn(
      "rounded-2xl shadow-lg border backdrop-blur-sm overflow-hidden animate-fadeIn",
      isDark 
        ? "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30" 
        : "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200"
    )}>
      <div className={cn(
        "px-6 py-4 border-b",
        isDark ? "bg-white/5 border-white/10" : "bg-white/50 border-purple-200"
      )}>
        <h3 className={cn(
          "text-lg font-bold flex items-center gap-2",
          isDark ? "text-purple-300" : "text-purple-900"
        )}>
          <Code2 className="w-5 h-5" />
          Live Editor Stats
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          <StatRow 
            label="Total Exercises" 
            value={totalExercises} 
            isDark={isDark}
            color="purple"
          />
          <StatRow 
            label="Live Editor Enabled" 
            value={liveEditorEnabled} 
            isDark={isDark}
            color="pink"
          />
          <StatRow 
            label="Total Test Cases" 
            value={totalTestCases} 
            isDark={isDark}
            color="purple"
          />
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, isDark, color = "purple" }) {
  return (
    <div className="flex justify-between items-center">
      <span className={cn(
        "text-sm font-medium",
        isDark 
          ? color === "purple" ? "text-purple-300" : "text-pink-300"
          : color === "purple" ? "text-purple-700" : "text-pink-700"
      )}>
        {label}
      </span>
      <span className={cn(
        "text-2xl font-bold",
        isDark 
          ? color === "purple" ? "text-purple-400" : "text-pink-400"
          : color === "purple" ? "text-purple-900" : "text-pink-900"
      )}>
        {value}
      </span>
    </div>
  );
}

function CompletionRequirementsCard({ lesson, exercises, tests, isDark }) {
  const isComplete = exercises.length >= (lesson?.required_exercises ?? 0) && 
                     tests.length >= (lesson?.required_tests ?? 0);

  return (
    <div className={cn(
      "rounded-2xl shadow-lg border backdrop-blur-sm overflow-hidden animate-fadeIn",
      isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
    )}>
      <div className={cn(
        "px-6 py-4 border-b bg-gradient-to-r",
        isDark 
          ? "border-white/10 from-orange-500/10 to-amber-500/10" 
          : "from-orange-50 to-amber-50 border-gray-200"
      )}>
        <h3 className={cn("text-lg font-bold flex items-center gap-2", isDark ? "text-white" : "text-gray-900")}>
          <Target className="w-5 h-5" />
          Completion Requirements
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <InfoRow 
            icon={<FileCheck2 className="w-4 h-4" />}
            label="Required Exercises"
            value={lesson?.required_exercises ?? 0}
            isDark={isDark}
          />
          
          <InfoRow 
            icon={<FileCheck2 className="w-4 h-4" />}
            label="Required Tests"
            value={lesson?.required_tests ?? 0}
            isDark={isDark}
          />
          
          <InfoRow 
            icon={<Award className="w-4 h-4" />}
            label="Min Exercise Score"
            value={`${lesson?.min_exercise_score_percent ?? 70}%`}
            isDark={isDark}
            noBorder
          />
        </div>
        
        {/* Completion Status Indicator */}
        <div className={cn(
          "mt-4 pt-4 border-t",
          isDark ? "border-white/10" : "border-gray-200"
        )}>
          <div className="flex items-center justify-between">
            <span className={cn("text-xs font-medium", isDark ? "text-slate-400" : "text-gray-500")}>
              Completion Status
            </span>
            {isComplete ? (
              <span className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg",
                isDark 
                  ? "bg-green-500/20 text-green-300 border border-green-500/30" 
                  : "bg-green-100 text-green-800 border border-green-200"
              )}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ready
              </span>
            ) : (
              <span className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg",
                isDark 
                  ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" 
                  : "bg-yellow-100 text-yellow-800 border border-yellow-200"
              )}>
                <AlertCircle className="w-3.5 h-3.5" />
                Incomplete
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionsCard({ routes, isDark }) {
  return (
    <div className={cn(
      "rounded-2xl shadow-lg border backdrop-blur-sm overflow-hidden animate-fadeIn",
      isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
    )}>
      <div className={cn(
        "px-6 py-4 border-b bg-gradient-to-r",
        isDark 
          ? "border-white/10 from-blue-500/10 to-indigo-500/10" 
          : "from-blue-50 to-indigo-50 border-gray-200"
      )}>
        <h3 className={cn("text-lg font-bold flex items-center gap-2", isDark ? "text-white" : "text-gray-900")}>
          <Sparkles className="w-5 h-5" />
          Quick Actions
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          <Link 
            href={routes.lesson.edit} 
            className={cn(
              "w-full px-4 py-3 rounded-xl text-center font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
              "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
            )}
          >
            <Edit3 className="w-4 h-4" />
            Edit Lesson
          </Link>
          
          <Link 
            href={routes.tests.create} 
            className={cn(
              "w-full px-4 py-3 rounded-xl text-center font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
              "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
            )}
          >
            <PlusCircle className="w-4 h-4" />
            Add Test
          </Link>
          
          <Link 
            href={routes.exercises.create} 
            className={cn(
              "w-full px-4 py-3 rounded-xl text-center font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
              "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
            )}
          >
            <PlusCircle className="w-4 h-4" />
            Add Exercise
          </Link>
        </div>
      </div>
    </div>
  );
}

function ContentSecurityCard({ contentType, isDark }) {
  const getSecurityInfo = () => {
    if (contentType === 'markdown') {
      return 'Parsed safely with DOMPurify';
    } else if (contentType === 'html') {
      return 'Sanitized HTML - dangerous tags removed';
    }
    return 'Plain text - 100% safe';
  };

  const getContentTypeLabel = () => {
    if (contentType === 'markdown') return 'Markdown';
    if (contentType === 'html') return 'HTML';
    return 'Plain Text';
  };

  return (
    <div className={cn(
      "rounded-2xl shadow-lg border backdrop-blur-sm overflow-hidden animate-fadeIn",
      isDark 
        ? "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30" 
        : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
    )}>
      <div className={cn(
        "px-6 py-4 border-b",
        isDark ? "bg-white/5 border-white/10" : "bg-white/50 border-green-200"
      )}>
        <h3 className={cn(
          "text-lg font-bold flex items-center gap-2",
          isDark ? "text-green-300" : "text-green-900"
        )}>
          <Shield className="w-5 h-5" />
          Content Security
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <SecurityItem 
            title="XSS Protection Active"
            description="All content is sanitized before rendering"
            isDark={isDark}
          />
          
          <SecurityItem 
            title={`Content Type: ${getContentTypeLabel()}`}
            description={getSecurityInfo()}
            isDark={isDark}
          />
          
          <SecurityItem 
            title="Safe Rendering"
            description="Scripts, iframes, and malicious code blocked"
            isDark={isDark}
          />
        </div>
      </div>
    </div>
  );
}

function SecurityItem({ title, description, isDark }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0">
        <div className={cn(
          "flex items-center justify-center h-8 w-8 rounded-full",
          isDark 
            ? "bg-green-500/20 text-green-300 border border-green-500/30" 
            : "bg-green-100 text-green-600 border border-green-200"
        )}>
          <CheckCircle2 className="w-4 h-4" />
        </div>
      </div>
      <div className="flex-1">
        <p className={cn("text-sm font-semibold", isDark ? "text-green-300" : "text-green-900")}>
          {title}
        </p>
        <p className={cn("text-xs mt-1", isDark ? "text-green-400/80" : "text-green-700")}>
          {description}
        </p>
      </div>
    </div>
  );
}