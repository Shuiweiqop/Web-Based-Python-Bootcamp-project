// resources/js/Pages/Admin/Exercises/Create.jsx
import React from 'react';
import { useForm, Link, usePage, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

export default function Create({ auth }) {
    const { props } = usePage();
    
    // When called through admin/lessons/{lesson}/exercises/create
    // Backend should pass props.lesson = { lesson_id, title }
    // If called from admin/exercises/create (site-wide), backend can pass props.lessons list for selection
    const lesson = props.lesson ?? null;
    const lessons = props.lessons ?? [];

    const { data, setData, post, processing, errors } = useForm({
        // Corresponds to backend validation
        title: '',
        description: '',
        exercise_type: 'coding',
        difficulty: 'beginner',
        starter_code: '',
        solution: '',
        asset_url: '',
        max_score: 100,
        time_limit_sec: '',
        is_active: true,
        // When not nested lesson, frontend can choose lesson_id
        lesson_id: lesson?.lesson_id ?? (lessons[0]?.lesson_id ?? null),
    });

    function submit(e) {
        e.preventDefault();

        // If no lesson and no lesson_id selected, prevent submission
        if (!lesson && !data.lesson_id) {
            alert('Please select a lesson to attach this exercise to.');
            return;
        }

        // Decide which route to use (nested or site-wide)
        const routeName = lesson ? 'admin.lessons.exercises.store' : 'admin.exercises.store';
        const routeParams = lesson ? { lesson: lesson.lesson_id } : {};

        console.info('Submit exercise', { routeName, routeParams, payload: data });

        post(route(routeName, routeParams), {
            onStart: () => console.log('exercise create start'),
            onSuccess: (page) => {
                console.log('exercise create success', page);
            },
            onError: (errs) => {
                console.warn('exercise create validation errors', errs);
            },
            onFinish: () => console.log('exercise create finished'),
        });
    }

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {lesson ? `Create Exercise for: ${lesson.title}` : 'Create Exercise'}
                </h2>
            }
        >
            <Head title={lesson ? `Create Exercise - ${lesson.title}` : 'Create Exercise'} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href={lesson ? route('admin.lessons.show', lesson.lesson_id) : route('admin.exercises.index')}
                            className="flex items-center text-gray-500 hover:text-gray-700"
                        >
                            <ChevronLeftIcon className="w-5 h-5 mr-1" />
                            {lesson ? 'Back to Lesson' : 'Back to Exercises'}
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                {!lesson && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Attach to Lesson *
                                        </label>
                                        <select
                                            value={data.lesson_id ?? ''}
                                            onChange={e => setData('lesson_id', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">-- Select lesson --</option>
                                            {lessons.map(l => (
                                                <option key={l.lesson_id} value={l.lesson_id}>
                                                    {l.title}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.lesson_id && (
                                            <div className="text-red-600 text-sm mt-1">{errors.lesson_id}</div>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    {errors.title && (
                                        <div className="text-red-600 text-sm mt-1">{errors.title}</div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={4}
                                    />
                                    {errors.description && (
                                        <div className="text-red-600 text-sm mt-1">{errors.description}</div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Exercise Type *
                                        </label>
                                        <select 
                                            value={data.exercise_type} 
                                            onChange={e => setData('exercise_type', e.target.value)} 
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="coding">Coding</option>
                                            <option value="drag_drop">Drag & Drop</option>
                                            <option value="fill_blank">Fill in the blank</option>
                                            <option value="matching">Matching</option>
                                            <option value="sorting">Sorting</option>
                                            <option value="simulation">Simulation</option>
                                            <option value="multiple_choice">Multiple choice</option>
                                        </select>
                                        {errors.exercise_type && (
                                            <div className="text-red-600 text-sm mt-1">{errors.exercise_type}</div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Difficulty
                                        </label>
                                        <select 
                                            value={data.difficulty} 
                                            onChange={e => setData('difficulty', e.target.value)} 
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                        </select>
                                        {errors.difficulty && (
                                            <div className="text-red-600 text-sm mt-1">{errors.difficulty}</div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Max Score
                                        </label>
                                        <input 
                                            type="number" 
                                            value={data.max_score} 
                                            onChange={e => setData('max_score', parseInt(e.target.value) || '')} 
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min="0"
                                        />
                                        {errors.max_score && (
                                            <div className="text-red-600 text-sm mt-1">{errors.max_score}</div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Starter Code (optional)
                                    </label>
                                    <textarea 
                                        value={data.starter_code} 
                                        onChange={e => setData('starter_code', e.target.value)} 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" 
                                        rows="8"
                                        placeholder="Enter starter code here..."
                                    />
                                    {errors.starter_code && (
                                        <div className="text-red-600 text-sm mt-1">{errors.starter_code}</div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Solution / Expected Output
                                    </label>
                                    <textarea 
                                        value={data.solution} 
                                        onChange={e => setData('solution', e.target.value)} 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" 
                                        rows="6"
                                        placeholder="Enter expected solution or output..."
                                    />
                                    {errors.solution && (
                                        <div className="text-red-600 text-sm mt-1">{errors.solution}</div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Time Limit (seconds)
                                        </label>
                                        <input 
                                            type="number" 
                                            value={data.time_limit_sec ?? ''} 
                                            onChange={e => setData('time_limit_sec', parseInt(e.target.value) || '')} 
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min="0"
                                            placeholder="Leave empty for no limit"
                                        />
                                        {errors.time_limit_sec && (
                                            <div className="text-red-600 text-sm mt-1">{errors.time_limit_sec}</div>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select 
                                            value={data.is_active ? '1' : '0'} 
                                            onChange={e => setData('is_active', e.target.value === '1')} 
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="1">Active</option>
                                            <option value="0">Inactive</option>
                                        </select>
                                        {errors.is_active && (
                                            <div className="text-red-600 text-sm mt-1">{errors.is_active}</div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Asset URL (optional)
                                    </label>
                                    <input 
                                        type="url" 
                                        value={data.asset_url} 
                                        onChange={e => setData('asset_url', e.target.value)} 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="https://example.com/resource.pdf"
                                    />
                                    {errors.asset_url && (
                                        <div className="text-red-600 text-sm mt-1">{errors.asset_url}</div>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <Link 
                                        href={lesson ? route('admin.lessons.show', lesson.lesson_id) : route('admin.exercises.index')} 
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:text-gray-900"
                                    >
                                        Cancel
                                    </Link>
                                    <button 
                                        type="submit" 
                                        disabled={processing} 
                                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Creating...' : 'Create Exercise'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}