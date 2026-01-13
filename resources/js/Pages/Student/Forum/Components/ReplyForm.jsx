import { useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function ReplyForm({ postId, parentReplyId = null, onCancel, placeholder = 'Write your reply...' }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        content: '',
        parent_reply_id: parentReplyId,
    });

    const [charCount, setCharCount] = useState(0);
    const minChars = 5;
    const maxChars = 5000;

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('forum.reply', postId), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setCharCount(0);
                if (onCancel) onCancel();
            },
        });
    };

    const handleContentChange = (e) => {
        const content = e.target.value;
        setData('content', content);
        setCharCount(content.length);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {parentReplyId ? 'Write a Reply' : 'Add Your Reply'}
            </h3>

            <form onSubmit={handleSubmit}>
                {/* Textarea */}
                <div className="mb-4">
                    <textarea
                        value={data.content}
                        onChange={handleContentChange}
                        placeholder={placeholder}
                        rows={6}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none dark:bg-slate-900 dark:text-white dark:border-gray-600 ${
                            errors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        disabled={processing}
                    />

                    {/* Character Count */}
                    <div className="flex items-center justify-between mt-2 text-sm">
                        <div>
                            {errors.content && (
                                <span className="text-red-600 dark:text-red-400 font-medium">{errors.content}</span>
                            )}
                        </div>
                        <span
                            className={`${
                                charCount < minChars
                                    ? 'text-red-600 dark:text-red-400'
                                    : charCount > maxChars
                                    ? 'text-red-600 dark:text-red-400 font-bold'
                                    : 'text-gray-500 dark:text-gray-400'
                            }`}
                        >
                            {charCount} / {maxChars} characters
                            {charCount < minChars && ` (min ${minChars})`}
                        </span>
                    </div>
                </div>

                {/* Formatting Tips */}
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300 mb-2 font-semibold">💡 Formatting Tips:</p>
                    <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                        <li>• Be respectful and constructive in your replies</li>
                        <li>• Stay on topic and provide helpful information</li>
                        <li>• Use clear and concise language</li>
                    </ul>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={processing || charCount < minChars || charCount > maxChars}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                    >
                        {processing ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Posting...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                <span>Post Reply</span>
                            </>
                        )}
                    </button>

                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={processing}
                            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}