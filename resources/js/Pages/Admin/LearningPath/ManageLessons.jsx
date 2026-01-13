import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import {
    ArrowLeftIcon,
    PlusIcon,
    TrashIcon,
    Bars3Icon,
    Cog6ToothIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

export default function ManageLessons({ auth, path, pathLessons, availableLessons }) {
    // ✅ 关键修复：将 props 的 pathLessons 复制到本地 state
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

    const { data: settingsData, setData: setSettingsData, put, processing: settingsProcessing, errors: settingsErrors } = useForm({
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
                // ✅ 刷新页面数据以获取最新的 lessons
                router.reload({ 
                    only: ['pathLessons', 'availableLessons'],
                    onSuccess: (page) => {
                        // ✅ 更新本地 state
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
                    // ✅ 从本地 state 中移除并更新序号
                    setLessonsState(prev => {
                        const newLessons = prev.filter(l => l.lesson_id !== lessonId);
                        // 重新计算序号
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
                // ✅ 刷新并更新本地 state
                router.reload({ 
                    only: ['pathLessons'],
                    onSuccess: (page) => {
                        setLessonsState(page.props.pathLessons);
                    }
                });
            }
        });
    };

    // ✅ 修复后的拖拽逻辑
    const handleDragStart = (index) => {
        setDraggingIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggingIndex === null || draggingIndex === index) return;

        const newLessons = [...lessonsState];
        const draggedItem = newLessons[draggingIndex];
        
        // 移除拖拽的项
        newLessons.splice(draggingIndex, 1);
        // 插入到新位置
        newLessons.splice(index, 0, draggedItem);

        // ✅ 即时更新 sequence_order 用于视觉反馈
        newLessons.forEach((lesson, idx) => {
            lesson.sequence_order = idx + 1;
        });

        // ✅ 关键：更新 state
        setLessonsState(newLessons);
        setDraggingIndex(index);
    };

    const handleDragEnd = () => {
        if (draggingIndex === null) return;

        // ✅ 发送真实的新排序到后端
        router.post(
            route('admin.learning-paths.lessons.reorder', path.path_id),
            {
                lesson_ids: lessonsState.map(l => l.lesson_id)
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    console.log('Reorder successful');
                },
                onError: (errors) => {
                    console.error('Reorder failed:', errors);
                    // ✅ 如果失败，重新加载原始顺序
                    setLessonsState(pathLessons);
                }
            }
        );

        setDraggingIndex(null);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Manage Lessons - ${path.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href={route('admin.learning-paths.show', path.path_id)}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeftIcon className="w-4 h-4 mr-1" />
                            Back to Path Details
                        </Link>

                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Manage Lessons</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    {path.title} - {lessonsState.length} lessons
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition inline-flex items-center"
                            >
                                <PlusIcon className="w-5 h-5 mr-2" />
                                Add Lesson
                            </button>
                        </div>
                    </div>

                    {/* Current Lessons */}
                    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Current Lessons ({lessonsState.length})
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Drag to reorder • Click settings to configure
                            </p>
                        </div>
                        <div className="p-6">
                            {lessonsState.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 mb-4">No lessons added yet</p>
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
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
                                            className={`p-4 border-2 rounded-lg transition cursor-move ${
                                                draggingIndex === index
                                                    ? 'border-indigo-500 bg-indigo-50 opacity-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Drag Handle */}
                                                <div className="flex-shrink-0">
                                                    <Bars3Icon className="w-6 h-6 text-gray-400" />
                                                </div>

                                                {/* Order Number */}
                                                <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                    <span className="text-lg font-bold text-indigo-600">
                                                        {lesson.sequence_order}
                                                    </span>
                                                </div>

                                                {/* Lesson Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-base font-semibold text-gray-900 truncate">
                                                        {lesson.title}
                                                    </h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-sm text-gray-500 capitalize">
                                                            {lesson.difficulty}
                                                        </span>
                                                        <span className="text-sm text-gray-400">•</span>
                                                        <span className="text-sm text-gray-500">
                                                            {lesson.estimated_duration_minutes || lesson.estimated_duration} min
                                                        </span>
                                                        {lesson.is_required && (
                                                            <>
                                                                <span className="text-sm text-gray-400">•</span>
                                                                <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded">
                                                                    Required
                                                                </span>
                                                            </>
                                                        )}
                                                        {lesson.unlock_after_previous && (
                                                            <>
                                                                <span className="text-sm text-gray-400">•</span>
                                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                                                                    Sequential
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {lesson.path_specific_notes && (
                                                        <p className="text-sm text-gray-600 mt-2">
                                                            📝 {lesson.path_specific_notes}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex-shrink-0 flex gap-2">
                                                    <button
                                                        onClick={() => openSettingsModal(lesson)}
                                                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                        title="Settings"
                                                    >
                                                        <Cog6ToothIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveLesson(lesson.lesson_id, lesson.title)}
                                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Remove"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Add Lesson Modal */}
                    {showAddModal && (
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-900">Add Lesson to Path</h3>
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    {/* Select Lesson */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Select Lesson <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={addData.lesson_id}
                                            onChange={(e) => setAddData('lesson_id', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">Choose a lesson...</option>
                                            {availableLessons.map((lesson) => (
                                                <option key={lesson.lesson_id} value={lesson.lesson_id}>
                                                    {lesson.title} ({lesson.difficulty})
                                                </option>
                                            ))}
                                        </select>
                                        {addErrors.lesson_id && (
                                            <p className="mt-1 text-sm text-red-600">{addErrors.lesson_id}</p>
                                        )}
                                    </div>

                                    {/* Settings */}
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="add_is_required"
                                                checked={addData.is_required}
                                                onChange={(e) => setAddData('is_required', e.target.checked)}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label htmlFor="add_is_required" className="ml-2 text-sm text-gray-700">
                                                Required (students must complete this)
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="add_unlock"
                                                checked={addData.unlock_after_previous}
                                                onChange={(e) => setAddData('unlock_after_previous', e.target.checked)}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label htmlFor="add_unlock" className="ml-2 text-sm text-gray-700">
                                                Unlock after previous (sequential learning)
                                            </label>
                                        </div>
                                    </div>

                                    {/* Duration Override */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Estimated Duration (minutes)
                                        </label>
                                        <input
                                            type="number"
                                            value={addData.estimated_duration_minutes}
                                            onChange={(e) => setAddData('estimated_duration_minutes', e.target.value)}
                                            min="1"
                                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Leave empty to use lesson default"
                                        />
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Path-Specific Notes
                                        </label>
                                        <textarea
                                            value={addData.path_specific_notes}
                                            onChange={(e) => setAddData('path_specific_notes', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Any special notes for this lesson in this path..."
                                        />
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddLesson}
                                        disabled={addProcessing || !addData.lesson_id}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                                    >
                                        {addProcessing ? 'Adding...' : 'Add Lesson'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Settings Modal */}
                    {showSettingsModal && selectedLesson && (
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Lesson Settings: {selectedLesson.title}
                                    </h3>
                                    <button
                                        onClick={() => setShowSettingsModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    {/* Settings */}
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="settings_is_required"
                                                checked={settingsData.is_required}
                                                onChange={(e) => setSettingsData('is_required', e.target.checked)}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label htmlFor="settings_is_required" className="ml-2 text-sm text-gray-700">
                                                Required (students must complete this)
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="settings_unlock"
                                                checked={settingsData.unlock_after_previous}
                                                onChange={(e) => setSettingsData('unlock_after_previous', e.target.checked)}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label htmlFor="settings_unlock" className="ml-2 text-sm text-gray-700">
                                                Unlock after previous (sequential learning)
                                            </label>
                                        </div>
                                    </div>

                                    {/* Duration Override */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Estimated Duration (minutes)
                                        </label>
                                        <input
                                            type="number"
                                            value={settingsData.estimated_duration_minutes}
                                            onChange={(e) => setSettingsData('estimated_duration_minutes', e.target.value)}
                                            min="1"
                                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Leave empty to use lesson default"
                                        />
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Path-Specific Notes
                                        </label>
                                        <textarea
                                            value={settingsData.path_specific_notes}
                                            onChange={(e) => setSettingsData('path_specific_notes', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Any special notes for this lesson in this path..."
                                        />
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowSettingsModal(false)}
                                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveSettings}
                                        disabled={settingsProcessing}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                                    >
                                        {settingsProcessing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}