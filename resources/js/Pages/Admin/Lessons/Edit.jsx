import React, { useState } from "react";
import { useForm, Link, usePage, Head } from "@inertiajs/react";
import { safeRoute } from "@/utils/routeHelpers";
import { router } from '@inertiajs/react';
import { 
  ArrowLeft, 
  Save, 
  BookOpen, 
  Settings, 
  Video, 
  Award,
  Sun,
  Moon, 
  AlertCircle,
  Clock,
  Target,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2
} from "lucide-react";
import { cn } from "@/utils/cn";

export default function Edit({ lesson: propLesson, sections: propSections = [] }) {
  const [isDark, setIsDark] = useState(true);
  const page = usePage();
  const lesson = propLesson ?? page.props?.lesson ?? null;

  // 🔥 State for sections
  const [sections, setSections] = useState(
    propSections.map((s, idx) => ({
      id: s.id || s.lesson_section_id,
      title: s.title,
      content: s.content,
      order_index: s.order_index || idx + 1,
    })) || []
  );

  const { data, setData, put, processing, errors } = useForm({
    title: lesson?.title ?? "",
    content: lesson?.content ?? "",
    difficulty: lesson?.difficulty ?? "beginner",
    estimated_duration: lesson?.estimated_duration ?? "",
    video_url: lesson?.video_url ?? "",
    completion_reward_points: lesson?.completion_reward_points ?? 0,
    status: lesson?.status ?? "active",
  });

  if (!lesson) {
    return (
      <div className={cn(
        "min-h-screen",
        isDark ? "bg-slate-950" : "bg-gradient-to-br from-blue-50 via-purple-50 to-slate-50"
      )}>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className={cn(
            "rounded-xl p-6 border",
            isDark 
              ? "bg-red-500/10 border-red-500/30 text-red-300" 
              : "bg-red-50 border-red-200 text-red-700"
          )}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Lesson Not Found</h3>
                <p className="text-sm">The lesson data could not be loaded.</p>
              </div>
            </div>
          </div>
              <div className="flex items-center gap-4">
                <Link
                  href={safeRoute("admin.lessons.show", lessonId)}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                    isDark 
                      ? "text-slate-300 hover:text-white hover:bg-white/10" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-purple-100"
                  )}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Lesson
                </Link>
          </div>
        </div>
      </div>
    );
  }

  const lessonId = lesson.lesson_id ?? lesson.id;

  // 🔥 Section handlers
  const addSection = () => {
    const newSection = {
      id: Date.now(),
      title: "",
      content: "",
      order_index: sections.length + 1,
      _isNew: true,
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (index) => {
    if (confirm("Are you sure you want to delete this section?")) {
      const newSections = sections.filter((_, i) => i !== index);
      const reordered = newSections.map((s, idx) => ({
        ...s,
        order_index: idx + 1,
      }));
      setSections(reordered);
    }
  };

  const moveSection = (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const newSections = [...sections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    
    const reordered = newSections.map((s, idx) => ({
      ...s,
      order_index: idx + 1,
    }));
    setSections(reordered);
  };

  const updateSection = (index, field, value) => {
    const newSections = [...sections];
    newSections[index][field] = value;
    setSections(newSections);
  };

const handleSubmit = () => {
  if (!lessonId) {
    alert("Error: Missing lesson ID.");
    return;
  }

  const updateUrl = safeRoute('admin.lessons.update', lessonId);
  
  if (!updateUrl) {
    console.error('Failed to generate update URL');
    alert('Error: Unable to generate update URL.');
    return;
  }

  // 准备提交数据（包含 sections）
  const submitData = {
    ...data,
    sections: sections.map((section, index) => ({
      id: section._isNew ? null : section.id,
      title: section.title,
      content: section.content,
      order_index: index + 1,
    })),
  };

  // ✅ 使用 router.put 直接提交数据
  router.put(updateUrl, submitData, {
    preserveScroll: true,
    onSuccess: () => {
      console.log('✅ Lesson updated successfully!');
    },
    onError: (errors) => {
      console.error('❌ Update failed:', errors);
      alert('Update failed. Check console for details.');
    }
  });
};
  const difficultyConfig = {
    beginner: { icon: '🟢', bg: isDark ? 'bg-green-500/20' : 'bg-green-50' },
    intermediate: { icon: '🟡', bg: isDark ? 'bg-yellow-500/20' : 'bg-yellow-50' },
    advanced: { icon: '🔴', bg: isDark ? 'bg-red-500/20' : 'bg-red-50' },
  };

  return (
    <>
      <Head title={`Edit Lesson - ${lesson.title}`} />

      <div className={cn(
        "min-h-screen transition-colors duration-500",
        isDark ? "bg-slate-950" : "bg-gradient-to-br from-blue-50 via-purple-50 to-slate-50"
      )}>
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          {isDark ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" />
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
            </>
          ) : (
            <>
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
            </>
          )}
        </div>

        {/* Top Navigation Bar */}
        <header className={cn(
          "sticky top-0 z-30 backdrop-blur-xl border-b",
          isDark ? "bg-slate-900/50 border-white/10" : "bg-white/70 border-purple-200/50"
        )}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href={safeRoute("admin.lessons.index")}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                    isDark 
                      ? "text-slate-300 hover:text-white hover:bg-white/10" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-purple-100"
                  )}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Link>
                <div className={cn("h-6 w-px", isDark ? "bg-white/10" : "bg-purple-200")} />
                <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                  Edit Lesson
                </h1>
              </div>
              
              <button
                onClick={() => setIsDark(!isDark)}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  isDark 
                    ? "hover:bg-white/10 text-slate-400 hover:text-white" 
                    : "hover:bg-purple-100 text-slate-600 hover:text-slate-900"
                )}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Lesson Info */}
          <div className={cn(
            "mb-6 rounded-xl p-6 border backdrop-blur-sm",
            isDark 
              ? "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30" 
              : "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200"
          )}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className={cn("text-lg font-bold mb-2", isDark ? "text-white" : "text-gray-900")}>
                  📝 Editing: {lesson.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className={isDark ? "text-slate-300" : "text-gray-700"}>
                    <span className="font-semibold">Status:</span>
                    <span className={cn(
                      "ml-2 px-2 py-1 rounded",
                      lesson.status === 'active' 
                        ? isDark ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-800"
                        : isDark ? "bg-slate-700 text-slate-300" : "bg-gray-100 text-gray-800"
                    )}>
                      {lesson.status}
                    </span>
                  </div>
                  {sections.length > 0 && (
                    <div className={isDark ? "text-slate-300" : "text-gray-700"}>
                      <span className="font-semibold">Sections:</span>
                      <span className={cn("ml-2 px-2 py-1 rounded", isDark ? "bg-purple-500/20 text-purple-300" : "bg-purple-100 text-purple-800")}>
                        📚 {sections.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className={cn(
              "rounded-2xl shadow-lg border p-6 backdrop-blur-sm",
              isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
            )}>
              <div className="flex items-center gap-3 mb-6">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  isDark 
                    ? "bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-500/50" 
                    : "bg-gradient-to-br from-blue-100 to-cyan-100"
                )}>
                  <BookOpen className={cn("w-5 h-5", isDark ? "text-cyan-400" : "text-blue-600")} />
                </div>
                <h2 className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                  Basic Information
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={cn(
                    "block text-sm font-semibold mb-2",
                    isDark ? "text-slate-300" : "text-gray-700"
                  )}>
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData("title", e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg transition-all outline-none",
                      isDark
                        ? "bg-slate-800 border-2 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-500/50"
                        : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500",
                      errors.title && "border-red-500"
                    )}
                    placeholder="Enter lesson title"
                  />
                  {errors.title && <div className="text-red-400 text-sm mt-1">{errors.title}</div>}
                </div>

                <div>
                  <label className={cn(
                    "block text-sm font-semibold mb-2",
                    isDark ? "text-slate-300" : "text-gray-700"
                  )}>
                    Lesson Content
                  </label>
                  <textarea
                    rows={12}
                    value={data.content}
                    onChange={(e) => setData("content", e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg transition-all outline-none font-mono text-sm resize-vertical",
                      isDark
                        ? "bg-slate-800 border-2 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-500/50"
                        : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500"
                    )}
                    placeholder="Enter the detailed lesson content..."
                  />
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className={cn(
              "rounded-2xl shadow-lg border p-6 backdrop-blur-sm",
              isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
            )}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    isDark 
                      ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/50" 
                      : "bg-gradient-to-br from-purple-100 to-pink-100"
                  )}>
                    <BookOpen className={cn("w-5 h-5", isDark ? "text-pink-400" : "text-purple-600")} />
                  </div>
                  <h2 className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                    📚 Lesson Sections ({sections.length})
                  </h2>
                </div>
                <button
                  onClick={addSection}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                    isDark 
                      ? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30" 
                      : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  Add Section
                </button>
              </div>

              <div className="space-y-4">
                {sections.map((section, index) => (
                  <div 
                    key={section.id}
                    className={cn(
                      "rounded-xl border p-4",
                      isDark 
                        ? "bg-slate-800/50 border-white/10" 
                        : "bg-white border-gray-200"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                        isDark 
                          ? "bg-cyan-500/20 text-cyan-300" 
                          : "bg-cyan-100 text-cyan-800"
                      )}>
                        {index + 1}
                      </div>

                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => updateSection(index, 'title', e.target.value)}
                          placeholder="Section title..."
                          className={cn(
                            "w-full px-3 py-2 rounded-lg outline-none transition-all",
                            isDark
                              ? "bg-slate-700 border border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-500/50"
                              : "bg-gray-50 border border-gray-300 text-gray-900 focus:border-blue-500"
                          )}
                        />
                        <textarea
                          value={section.content}
                          onChange={(e) => updateSection(index, 'content', e.target.value)}
                          placeholder="Section content..."
                          rows={6}
                          className={cn(
                            "w-full px-3 py-2 rounded-lg outline-none font-mono text-sm resize-vertical transition-all",
                            isDark
                              ? "bg-slate-700 border border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-500/50"
                              : "bg-gray-50 border border-gray-300 text-gray-900 focus:border-blue-500"
                          )}
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveSection(index, 'up')}
                          disabled={index === 0}
                          className={cn(
                            "p-2 rounded transition-all",
                            index === 0
                              ? isDark ? "text-slate-700 cursor-not-allowed" : "text-gray-300 cursor-not-allowed"
                              : isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-gray-600 hover:bg-gray-100"
                          )}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveSection(index, 'down')}
                          disabled={index === sections.length - 1}
                          className={cn(
                            "p-2 rounded transition-all",
                            index === sections.length - 1
                              ? isDark ? "text-slate-700 cursor-not-allowed" : "text-gray-300 cursor-not-allowed"
                              : isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-gray-600 hover:bg-gray-100"
                          )}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <div className="h-px bg-white/10 my-1" />
                        <button
                          onClick={() => removeSection(index)}
                          className={cn(
                            "p-2 rounded transition-all",
                            isDark 
                              ? "text-red-400 hover:text-red-300 hover:bg-red-500/10" 
                              : "text-red-600 hover:bg-red-50"
                          )}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {sections.length === 0 && (
                  <div className={cn(
                    "text-center py-12 rounded-xl border-2 border-dashed",
                    isDark 
                      ? "border-white/10 text-slate-500" 
                      : "border-gray-300 text-gray-500"
                  )}>
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No sections yet. Click "Add Section" to create one.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Configuration */}
<div className={cn(
  "rounded-2xl shadow-lg border p-6 backdrop-blur-sm",
  isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
)}>
  <div className="flex items-center gap-3 mb-6">
    <div className={cn(
      "w-10 h-10 rounded-lg flex items-center justify-center",
      isDark 
        ? "bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-500/50" 
        : "bg-gradient-to-br from-green-100 to-emerald-100"
    )}>
      <Settings className={cn("w-5 h-5", isDark ? "text-green-400" : "text-green-600")} />
    </div>
    <h2 className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>
      Configuration
    </h2>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* 🔥 Status Selector - 新增！ */}
    <div>
      <label className={cn(
        "block text-sm font-semibold mb-2",
        isDark ? "text-slate-300" : "text-gray-700"
      )}>
        <Settings className="w-4 h-4 inline mr-1" />
        Lesson Status *
      </label>
      <select
        value={data.status}
        onChange={(e) => setData("status", e.target.value)}
        className={cn(
          "w-full px-4 py-3 rounded-lg transition-all outline-none",
          isDark
            ? "bg-slate-800 border-2 border-white/10 text-white focus:border-cyan-500/50"
            : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500",
          errors.status && "border-red-500"
        )}
      >
        <option value="active">✅ Active - Visible to students</option>
        <option value="inactive">⏸️ Inactive - Hidden from students</option>
        <option value="draft">📝 Draft - Work in progress</option>
      </select>
      {errors.status && <div className="text-red-400 text-sm mt-1">{errors.status}</div>}
      <p className={cn("text-xs mt-1", isDark ? "text-slate-500" : "text-gray-500")}>
        {data.status === 'active' && 'Students can see and register for this lesson'}
        {data.status === 'inactive' && 'Lesson is hidden but can be reactivated'}
        {data.status === 'draft' && 'Lesson is still being prepared'}
      </p>
    </div>

    {/* Difficulty */}
    <div>
      <label className={cn(
        "block text-sm font-semibold mb-2",
        isDark ? "text-slate-300" : "text-gray-700"
      )}>
        <Target className="w-4 h-4 inline mr-1" />
        Difficulty *
      </label>
      <select
        value={data.difficulty}
        onChange={(e) => setData("difficulty", e.target.value)}
        className={cn(
          "w-full px-4 py-3 rounded-lg transition-all outline-none",
          isDark
            ? "bg-slate-800 border-2 border-white/10 text-white focus:border-cyan-500/50"
            : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500"
        )}
      >
        <option value="beginner">🟢 Beginner</option>
        <option value="intermediate">🟡 Intermediate</option>
        <option value="advanced">🔴 Advanced</option>
      </select>
    </div>

    {/* Duration */}
    <div>
      <label className={cn(
        "block text-sm font-semibold mb-2",
        isDark ? "text-slate-300" : "text-gray-700"
      )}>
        <Clock className="w-4 h-4 inline mr-1" />
        Duration (min)
      </label>
      <input
        type="number"
        min="1"
        max="1440"
        value={data.estimated_duration}
        onChange={(e) => setData("estimated_duration", e.target.value)}
        className={cn(
          "w-full px-4 py-3 rounded-lg transition-all outline-none",
          isDark
            ? "bg-slate-800 border-2 border-white/10 text-white focus:border-cyan-500/50"
            : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500"
        )}
        placeholder="30"
      />
    </div>

    {/* Video URL */}
    <div>
      <label className={cn(
        "block text-sm font-semibold mb-2",
        isDark ? "text-slate-300" : "text-gray-700"
      )}>
        <Video className="w-4 h-4 inline mr-1" />
        Video URL
      </label>
      <input
        type="url"
        value={data.video_url}
        onChange={(e) => setData("video_url", e.target.value)}
        className={cn(
          "w-full px-4 py-3 rounded-lg transition-all outline-none",
          isDark
            ? "bg-slate-800 border-2 border-white/10 text-white focus:border-cyan-500/50"
            : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500"
        )}
        placeholder="https://..."
      />
    </div>

    {/* Reward Points */}
    <div>
      <label className={cn(
        "block text-sm font-semibold mb-2",
        isDark ? "text-slate-300" : "text-gray-700"
      )}>
        <Award className="w-4 h-4 inline mr-1" />
        Reward Points
      </label>
      <input
        type="number"
        min="0"
        max="1000"
        value={data.completion_reward_points}
        onChange={(e) => setData("completion_reward_points", e.target.value)}
        className={cn(
          "w-full px-4 py-3 rounded-lg transition-all outline-none",
          isDark
            ? "bg-slate-800 border-2 border-white/10 text-white focus:border-cyan-500/50"
            : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500"
        )}
        placeholder="0"
      />
    </div>
  </div>
</div>

            {/* Actions */}
            <div className={cn(
              "rounded-xl shadow-lg border p-6 backdrop-blur-sm",
              isDark 
                ? "bg-slate-900/80 border-white/10" 
                : "bg-white border-gray-200"
            )}>
              <div className="flex gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={processing}
                  className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Save className="h-5 w-5" />
                  {processing ? 'Saving...' : 'Save Changes'}
                </button>

                <Link
                  href={safeRoute("admin.lessons.show", lessonId)}
                  className={cn(
                    "py-4 px-8 font-bold rounded-xl border-2 transition-all flex items-center justify-center",
                    isDark 
                      ? "bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700" 
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  )}
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}