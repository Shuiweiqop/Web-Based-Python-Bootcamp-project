import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Trash2, AlertTriangle, Calendar, Clock, X } from 'lucide-react';

export default function BulkDeleteModal({ show, onClose }) {
    const [deleteType, setDeleteType] = useState('all_old');
    const [daysOld, setDaysOld] = useState(30);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    if (!show) return null;

    const handlePreview = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/admin/ai-logs/delete-preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    type: deleteType,
                    days_old: daysOld,
                    date_from: dateFrom,
                    date_to: dateTo,
                }),
            });

            const data = await response.json();
            setPreview(data);
        } catch (error) {
            console.error('Preview failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.post('/admin/ai-logs/bulk-delete', {
            type: deleteType,
            days_old: daysOld,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            onFinish: () => {
                setIsDeleting(false);
                onClose();
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-red-500/50 rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <Trash2 className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Bulk Delete AI Logs</h3>
                            <p className="text-sm text-slate-400">Permanently remove old log entries</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Delete Type Selection */}
                <div className="space-y-4 mb-6">
                    <label className="block">
                        <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-white/10 rounded-lg cursor-pointer hover:bg-slate-800 transition-all">
                            <input
                                type="radio"
                                name="deleteType"
                                value="all_old"
                                checked={deleteType === 'all_old'}
                                onChange={(e) => setDeleteType(e.target.value)}
                                className="w-4 h-4 text-red-500"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-red-400" />
                                    <span className="font-medium text-white">Delete logs older than</span>
                                </div>
                                <p className="text-sm text-slate-400">Remove all logs older than a specified number of days</p>
                            </div>
                        </div>
                    </label>

                    {deleteType === 'all_old' && (
                        <div className="ml-8 flex items-center gap-3">
                            <input
                                type="number"
                                min="1"
                                value={daysOld}
                                onChange={(e) => setDaysOld(parseInt(e.target.value))}
                                className="w-24 px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <span className="text-slate-300">days</span>
                        </div>
                    )}

                    <label className="block">
                        <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-white/10 rounded-lg cursor-pointer hover:bg-slate-800 transition-all">
                            <input
                                type="radio"
                                name="deleteType"
                                value="date_range"
                                checked={deleteType === 'date_range'}
                                onChange={(e) => setDeleteType(e.target.value)}
                                className="w-4 h-4 text-red-500"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="w-4 h-4 text-red-400" />
                                    <span className="font-medium text-white">Delete by date range</span>
                                </div>
                                <p className="text-sm text-slate-400">Remove logs within a specific date range</p>
                            </div>
                        </div>
                    </label>

                    {deleteType === 'date_range' && (
                        <div className="ml-8 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">From Date</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">To Date</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview */}
                {preview && (
                    <div className={`p-4 rounded-lg border mb-6 ${
                        preview.count > 0 
                            ? 'bg-yellow-500/10 border-yellow-500/50' 
                            : 'bg-green-500/10 border-green-500/50'
                    }`}>
                        <div className="flex items-start gap-3">
                            <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                                preview.count > 0 ? 'text-yellow-400' : 'text-green-400'
                            }`} />
                            <div>
                                <p className={`font-medium ${
                                    preview.count > 0 ? 'text-yellow-300' : 'text-green-300'
                                }`}>
                                    {preview.message}
                                </p>
                                {preview.count > 0 && (
                                    <p className="text-sm text-slate-400 mt-1">
                                        This action cannot be undone. Please confirm you want to proceed.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading || isDeleting}
                        className="flex-1 px-4 py-2 bg-slate-800 border border-white/10 text-white rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePreview}
                        disabled={isLoading || isDeleting}
                        className="flex-1 px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all disabled:opacity-50"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin" />
                                Checking...
                            </span>
                        ) : (
                            'Preview'
                        )}
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isLoading || isDeleting || !preview || preview.count === 0}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isDeleting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Delete Now
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}