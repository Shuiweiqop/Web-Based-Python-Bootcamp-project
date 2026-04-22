import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import {
    ArrowLeft,
    Plus,
    Trash2,
    GripVertical,
    Settings as SettingsIcon,
    X,
    BookOpen,
    Lock,
    CheckCircle2,
    Clock,
    Sparkles,
} from 'lucide-react';

export default function ManageLessons({ auth, path, pathLessons, availableLessons }) {
    const [lessonsState, setLessonsState] = useState(pathLessons);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [draggingIndex, setDraggingIndex] = useState(null);

    const { data: addData, setData: setAddData, post: postAdd, processing: addProcessing, errors: addErrors, reset: resetAdd } = useForm({
        lesson_id: '',
        is_required: true,
        unlock_after_previous: true,
        estimated_duration_minutes: '',
        path_specific_notes: '',
    });

    const { data: settingsData, setData: setSettingsData, put, processing: settingsProcessing } = useForm({
        is_required: true,
        unlock_after_previous: true,
        estimated_duration_minutes: '',
        path_specific_notes: '',
    });

    const handleAddLesson = (e) => {
        e.preventDefault();
        postAdd(route('admin.learning-paths.lessons.add', path.path_id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowAddModal(false);
                resetAdd();
                router.reload({ 
                    only: ['pathLessons', 'availableLessons'],
                    onSuccess: (page) => {
                        setLessonsState(page.props.pathLessons);
                    }
                });
            }
        });
    };

    const handleRemoveLesson = (lessonId, title) => {
        if (confirm(`Remove "${title}" from this path?`)) {
            router.delete(route('admin.learning-paths.lessons.remove', [path.path_id, lessonId]), {
                preserveScroll: true,
                onSuccess: () => {
                    setLessonsState(prev => {
                        const newLessons = prev.filter(l => l.lesson_id !== lessonId);
                        newLessons.forEach((lesson, idx) => {
                            lesson.sequence_order = idx + 1;
                        });
                        return newLessons;
                    });
                }
            });
        }
    };

    const openSettingsModal = (lesson) => {
        setSelectedLesson(lesson);
        setSettingsData({
            is_required: lesson.is_required,
            unlock_after_previous: lesson.unlock_after_previous,
            estimated_duration_minutes: lesson.estimated_duration_minutes || '',
            path_specific_notes: lesson.path_specific_notes || '',
        });
        setShowSettingsModal(true);
    };

    const handleSaveSettings = (e) => {
        e.preventDefault();
        put(route('admin.learning-paths.lessons.settings', [path.path_id, selectedLesson.lesson_id]), {
            preserveScroll: true,
            onSuccess: () => {
                setShowSettingsModal(false);
                setSelectedLesson(null);
                router.reload({ 
                    only: ['pathLessons'],
                    onSuccess: (page) => {
                        setLessonsState(page.props.pathLessons);
                    }
                });
            }
        });
    };

    const handleDragStart = (index) => {
        setDraggingIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggingIndex === null || draggingIndex === index) return;

        const newLessons = [...lessonsState];
        const draggedItem = newLessons[draggingIndex];
        
        newLessons.splice(draggingIndex, 1);
        newLessons.splice(index, 0, draggedItem);

        newLessons.forEach((lesson, idx) => {
            lesson.sequence_order = idx + 1;
        });

        setLessonsState(newLessons);
        setDraggingIndex(index);
    };

    const handleDragEnd = () => {
        if (draggingIndex === null) return;

        router.post(
            route('admin.learning-paths.lessons.reorder', path.path_id),
            { lesson_ids: lessonsState.map(l => l.lesson_id) },
            {
                preserveState: true,
                preserveScroll: true,
                onError: () => setLessonsState(pathLessons)
            }
        );

        setDraggingIndex(null);
    };

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <div className="flex flex-col gap-4 animate-fadeIn">
                    <Link
                        href={route('admin.learning-paths.show', path.path_id)}
                        className="inline-flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors ripple-effect w-fit"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Back to Path Details</span>
                        <span className="sm:hidden">Back</span>
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div className="min-w-0">
                            <h2 className="font-semibold text-2xl sm:text-3xl leading-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent break-words">
                                Manage Lessons
                            </h2>
                            <p className="text-sm mt-2 text-slate-300">
                                {path.title} • {lessonsState.length} lesson{lessonsState.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all inline-flex items-center shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 whitespace-nowrap ripple-effect button-press-effect"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Lesson
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Manage Lessons - ${path.title}`} />

            <div className="py-8 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Main Content Card */}
                    <div className="glassmorphism-enhanced rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-fadeIn">
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-b border-white/10 px-4 sm:px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-white">
                                        Current Lessons ({lessonsState.length})
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                                        Drag to reorder • Click settings to configure
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 sm:p-6">
                            {lessonsState.length === 0 ? (
                                <div className="text-center py-16 animate-fadeIn">
                                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <BookOpen className="w-10 h-10 text-purple-400" />
                                    </div>
                                    <p className="text-slate-300 mb-6 text-lg font-medium">No lessons added yet</p>
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-xl transition-all shadow-lg shadow-purple-500/50 ripple-effect button-press-effect"
                                    >
                                        Add Your First Lesson
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {lessonsState.map((lesson, index) => (
                                        <div
                                            key={lesson.lesson_id}
                                            draggable
                                            onDragStart={() => handleDragStart(index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDragEnd={handleDragEnd}
                                            className={`group p-3 sm:p-4 rounded-xl transition-all cursor-move ${
                                                draggingIndex === index
                                                    ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-2 border-purple-500 opacity-50 shadow-lg'
                                                    : 'bg-white/5 border-2 border-white/10 hover:border-purple-500/50 hover:bg-white/10 card-hover-effect'
                                            }`}
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <div className="flex items-start sm:items-center gap-2 sm:gap-4">
                                                {/* Drag Handle */}
                                                <div className="hidden sm:flex flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <GripVertical className="w-6 h-6 text-slate-400" />
                                                </div>

                                                {/* Sequence Badge */}
                                                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                                                    <span className="text-lg font-bold text-white">
                                                        {lesson.sequence_order}
                                                    </span>
                                                </div>

                                                {/* Lesson Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm sm:text-base font-semibold text-white break-words mb-2">
                                                        {lesson.title}
                                                    </h4>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {/* Difficulty Badge */}
                                                        <span className="px-2.5 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold rounded-full">
                                                            {lesson.difficulty}
                                                        </span>

                                                        {/* Duration */}
                                                        <span className="inline-flex items-center gap-1 text-xs text-slate-300">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {lesson.estimated_duration_minutes || lesson.estimated_duration} min
                                                        </span>

                                                        {/* Required Badge */}
                                                        {lesson.is_required && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 text-red-300 text-xs font-semibold rounded-full animate-pulse-slow">
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                Required
                                                            </span>
                                                        )}

                                                        {/* Sequential Badge */}
                                                        {lesson.unlock_after_previous && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold rounded-full">
                                                                <Lock className="w-3.5 h-3.5" />
                                                                Sequential
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Path Notes */}
                                                    {lesson.path_specific_notes && (
                                                        <div className="mt-3 p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                                                            <p className="text-xs sm:text-sm text-cyan-300 flex items-start gap-2">
                                                                <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                                <span>{lesson.path_specific_notes}</span>
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex-shrink-0 flex gap-1 sm:gap-2">
                                                    <button
                                                        onClick={() => openSettingsModal(lesson)}
                                                        className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/20 rounded-lg transition-all ripple-effect"
                                                        title="Settings"
                                                    >
                                                        <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveLesson(lesson.lesson_id, lesson.title)}
                                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all ripple-effect"
                                                        title="Remove"
                                                    >
                                                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Lesson Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="glassmorphism-enhanced rounded-xl shadow-2xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slideDown">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-b border-white/10 px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                            <h3 className="text-lg font-semibold text-white">Add Lesson to Path</h3>
                            <button 
                                onClick={() => setShowAddModal(false)} 
                                className="text-slate-400 hover:text-white transition-colors ripple-effect"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
                            {/* Lesson Select */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-2">
                                    Select Lesson <span className="text-red-400">*</span>
                                </label>
                                <select
                                    value={addData.lesson_id}
                                    onChange={(e) => setAddData('lesson_id', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                                >
                                    <option value="" className="bg-slate-800">Choose a lesson...</option>
                                    {availableLessons.map((lesson) => (
                                        <option key={lesson.lesson_id} value={lesson.lesson_id} className="bg-slate-800">
                                            {lesson.title} ({lesson.difficulty})
                                        </option>
                                    ))}
                                </select>
                                {addErrors.lesson_id && (
                                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1 animate-bounceIn">
                                        <span>⚠</span> {addErrors.lesson_id}
                                    </p>
                                )}
                            </div>

                            {/* Checkboxes */}
                            <div className="space-y-3 pt-2">
                                <label className="flex items-start p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 cursor-pointer transition-all group">
                                    <input 
                                        type="checkbox" 
                                        checked={addData.is_required} 
                                        onChange={(e) => setAddData('is_required', e.target.checked)} 
                                        className="mt-0.5 rounded border-purple-400/50 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                                    />
                                    <div className="ml-3">
                                        <span className="block text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                                            Required Lesson
                                        </span>
                                        <span className="block text-xs text-slate-400 mt-1">
                                            Students must complete this lesson
                                        </span>
                                    </div>
                                </label>

                                <label className="flex items-start p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 cursor-pointer transition-all group">
                                    <input 
                                        type="checkbox" 
                                        checked={addData.unlock_after_previous} 
                                        onChange={(e) => setAddData('unlock_after_previous', e.target.checked)} 
                                        className="mt-0.5 rounded border-purple-400/50 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                                    />
                                    <div className="ml-3">
                                        <span className="block text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                                            Sequential Unlock
                                        </span>
                                        <span className="block text-xs text-slate-400 mt-1">
                                            Unlocks after completing previous lesson
                                        </span>
                                    </div>
                                </label>
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-2">
                                    Estimated Duration (minutes)
                                </label>
                                <input 
                                    type="number" 
                                    value={addData.estimated_duration_minutes} 
                                    onChange={(e) => setAddData('estimated_duration_minutes', e.target.value)} 
                                    min="1"
                                    placeholder="e.g., 45"
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-2">
                                    Path-Specific Notes
                                </label>
                                <textarea 
                                    value={addData.path_specific_notes} 
                                    onChange={(e) => setAddData('path_specific_notes', e.target.value)} 
                                    rows={3}
                                    placeholder="Add any special instructions or context for this lesson..."
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-t border-white/10 flex flex-col-reverse sm:flex-row justify-end gap-3">
                            <button 
                                onClick={() => setShowAddModal(false)} 
                                className="px-6 py-3 bg-white/5 border border-white/20 text-slate-200 font-semibold rounded-lg hover:bg-white/10 hover:border-white/30 transition-all ripple-effect"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleAddLesson} 
                                disabled={addProcessing || !addData.lesson_id}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 ripple-effect button-press-effect"
                            >
                                {addProcessing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Adding...
                                    </span>
                                ) : (
                                    'Add Lesson'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettingsModal && selectedLesson && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="glassmorphism-enhanced rounded-xl shadow-2xl border border-white/10 max-w-2xl w-full overflow-hidden animate-slideDown">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-b border-white/10 px-4 sm:px-6 py-4 flex justify-between items-center">
                            <div className="min-w-0 pr-4">
                                <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                                    Lesson Settings
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-300 mt-0.5 truncate">
                                    {selectedLesson.title}
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowSettingsModal(false)} 
                                className="flex-shrink-0 text-slate-400 hover:text-white transition-colors ripple-effect"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 sm:p-6 space-y-5">
                            {/* Checkboxes */}
                            <div className="space-y-3">
                                <label className="flex items-start p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 cursor-pointer transition-all group">
                                    <input 
                                        type="checkbox" 
                                        checked={settingsData.is_required} 
                                        onChange={(e) => setSettingsData('is_required', e.target.checked)} 
                                        className="mt-0.5 rounded border-purple-400/50 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                                    />
                                    <div className="ml-3">
                                        <span className="block text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                                            Required Lesson
                                        </span>
                                        <span className="block text-xs text-slate-400 mt-1">
                                            Students must complete this lesson
                                        </span>
                                    </div>
                                </label>

                                <label className="flex items-start p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 cursor-pointer transition-all group">
                                    <input 
                                        type="checkbox" 
                                        checked={settingsData.unlock_after_previous} 
                                        onChange={(e) => setSettingsData('unlock_after_previous', e.target.checked)} 
                                        className="mt-0.5 rounded border-purple-400/50 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                                    />
                                    <div className="ml-3">
                                        <span className="block text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                                            Sequential Unlock
                                        </span>
                                        <span className="block text-xs text-slate-400 mt-1">
                                            Unlocks after completing previous lesson
                                        </span>
                                    </div>
                                </label>
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-2">
                                    Estimated Duration (minutes)
                                </label>
                                <input 
                                    type="number" 
                                    value={settingsData.estimated_duration_minutes} 
                                    onChange={(e) => setSettingsData('estimated_duration_minutes', e.target.value)} 
                                    min="1"
                                    placeholder="e.g., 45"
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-2">
                                    Path-Specific Notes
                                </label>
                                <textarea 
                                    value={settingsData.path_specific_notes} 
                                    onChange={(e) => setSettingsData('path_specific_notes', e.target.value)} 
                                    rows={3}
                                    placeholder="Add any special instructions or context for this lesson..."
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-t border-white/10 flex flex-col-reverse sm:flex-row justify-end gap-3">
                            <button 
                                onClick={() => setShowSettingsModal(false)} 
                                className="px-6 py-3 bg-white/5 border border-white/20 text-slate-200 font-semibold rounded-lg hover:bg-white/10 hover:border-white/30 transition-all ripple-effect"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveSettings} 
                                disabled={settingsProcessing}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 ripple-effect button-press-effect"
                            >
                                {settingsProcessing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Saving...
                                    </span>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}