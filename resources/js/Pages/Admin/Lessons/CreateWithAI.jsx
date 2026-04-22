import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function CreateWithAI({ auth, difficulties }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        video_url: '',
        difficulty: 'beginner',
    });

    const [generatedData, setGeneratedData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError(null);
    };

    const handleGenerate = async (e) => {
        if (e) e.preventDefault();
        setError(null);
        setIsGenerating(true);

        try {
            const { data } = await axios.post(route('admin.ai-lessons.generate'), formData);

            if (data.success) {
                setGeneratedData(data.data);
                setCurrentStep(2);
            } else {
                setError(data.message || 'Failed to generate lesson');
            }
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to generate lesson';
            setError('Request failed: ' + message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGeneratedDataChange = (field, value) => {
        setGeneratedData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSectionChange = (index, field, value) => {
        setGeneratedData((prev) => ({
            ...prev,
            sections: prev.sections.map((section, i) =>
                i === index ? { ...section, [field]: value } : section
            ),
        }));
    };

    const handleDeleteSection = (index) => {
        setGeneratedData((prev) => ({
            ...prev,
            sections: prev.sections.filter((_, i) => i !== index),
        }));
    };

    const handleSave = async (status = 'draft') => {
        setIsSaving(true);
        setError(null);

        try {
            const normalizedEstimatedDuration = Number.isInteger(generatedData?.estimated_duration)
                ? generatedData.estimated_duration
                : null;

            const { data } = await axios.post(route('admin.ai-lessons.store'), {
                ...generatedData,
                estimated_duration: normalizedEstimatedDuration,
                difficulty: formData.difficulty,
                video_url: formData.video_url,
                ai_source_url: formData.video_url,
                status: status,
            });

            if (data.success) {
                router.visit(data.redirect || route('admin.lessons.index'));
            } else {
                setError(data.message || 'Failed to save lesson');
            }
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to save lesson';
            setError('Request failed: ' + message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleStartOver = () => {
        setGeneratedData(null);
        setCurrentStep(1);
        setError(null);
    };

    const canGenerate = Boolean(formData.title.trim()) && !isGenerating;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Create Lesson with AI" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                            Create Lesson with AI
                        </h1>
                        <p className="mt-2 text-blue-100/90">
                            Let AI help you generate lesson content. Review and edit before saving.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50/95 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
                            {error}
                        </div>
                    )}

                    <div className="mb-6 rounded-lg bg-white/95 shadow p-4">
                        <div className="flex items-center justify-between text-sm font-medium">
                            <span className={currentStep === 1 ? 'text-blue-700' : 'text-gray-500'}>
                                Step 1 of 2: Basic Info
                            </span>
                            <span className={currentStep === 2 ? 'text-blue-700' : 'text-gray-500'}>
                                Step 2 of 2: Review & Save
                            </span>
                        </div>
                        <div className="mt-3 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                            <div
                                className={`h-full bg-blue-600 transition-all duration-300 ${currentStep === 1 ? 'w-1/2' : 'w-full'}`}
                            />
                        </div>
                    </div>

                    {currentStep === 1 && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <form onSubmit={handleGenerate} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Lesson Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g., Introduction to Python Variables"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Video URL (Optional)
                                    </label>
                                    <input
                                        type="url"
                                        name="video_url"
                                        value={formData.video_url}
                                        onChange={handleInputChange}
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        AI will use this as reference context
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Difficulty Level *
                                    </label>
                                    <select
                                        name="difficulty"
                                        value={formData.difficulty}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {difficulties.map((level) => (
                                            <option key={level} value={level}>
                                                {level.charAt(0).toUpperCase() + level.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!canGenerate}
                                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                                >
                                    {isGenerating ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Generating... (this may take 10-30 seconds)
                                        </span>
                                    ) : (
                                        'Generate Lesson Content with AI'
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {currentStep === 2 && generatedData && (
                        <div className="bg-white shadow rounded-lg p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Review & Edit Generated Content
                                </h2>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(1)}
                                        className="text-gray-600 hover:text-gray-900"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleStartOver}
                                        className="text-gray-600 hover:text-gray-900"
                                    >
                                        Start Over
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lesson Title
                                </label>
                                <input
                                    type="text"
                                    value={generatedData.title}
                                    onChange={(e) => handleGeneratedDataChange('title', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lesson Overview
                                </label>
                                <textarea
                                    value={generatedData.content}
                                    onChange={(e) => handleGeneratedDataChange('content', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estimated Duration (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={generatedData.estimated_duration}
                                    onChange={(e) => {
                                        const { value } = e.target;
                                        if (value === '') {
                                            handleGeneratedDataChange('estimated_duration', '');
                                            return;
                                        }

                                        const parsed = Number.parseInt(value, 10);
                                        handleGeneratedDataChange('estimated_duration', Number.isNaN(parsed) ? '' : parsed);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Lesson Sections ({generatedData.sections.length})
                                </h3>
                                <div className="space-y-4">
                                    {generatedData.sections.map((section, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-medium text-gray-500">
                                                    Section {index + 1}
                                                </span>
                                                {generatedData.sections.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteSection(index)}
                                                        className="text-red-600 hover:text-red-800 text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                value={section.title}
                                                onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                                                placeholder="Section title"
                                                className="w-full px-3 py-2 border border-gray-300 rounded mb-3 focus:ring-2 focus:ring-blue-500"
                                            />
                                            <textarea
                                                value={section.content}
                                                onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                                                placeholder="Section content"
                                                rows={6}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 transition"
                                >
                                    {isGenerating ? 'Regenerating...' : 'Regenerate with AI'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSave('draft')}
                                    disabled={isSaving}
                                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 disabled:bg-gray-300 transition"
                                >
                                    {isSaving ? 'Saving...' : 'Save as Draft'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSave('active')}
                                    disabled={isSaving}
                                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 transition"
                                >
                                    {isSaving ? 'Publishing...' : 'Save & Publish'}
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && !generatedData && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <p className="text-gray-700 mb-4">No generated content found. Please generate lesson content first.</p>
                            <button
                                type="button"
                                onClick={() => setCurrentStep(1)}
                                className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
                            >
                                Go to Step 1
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
