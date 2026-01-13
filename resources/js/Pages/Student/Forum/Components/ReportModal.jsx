import { useState } from 'react';
import { X, AlertTriangle, Flag, MessageSquare, Angry, XCircle, AlertCircle } from 'lucide-react';

export default function ReportModal({ isOpen, onClose, onSubmit, type = 'post' }) {
    const [selectedReason, setSelectedReason] = useState('');
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const reportReasons = [
        {
            id: 'spam',
            label: 'Spam',
            description: 'Unwanted promotional content or repetitive messages',
            icon: Flag,
            color: 'red',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            textColor: 'text-red-700',
            hoverColor: 'hover:bg-red-100',
            selectedBg: 'bg-red-100',
            selectedBorder: 'border-red-500'
        },
        {
            id: 'inappropriate',
            label: 'Inappropriate Content',
            description: 'Offensive, explicit, or unsuitable material',
            icon: AlertTriangle,
            color: 'orange',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            textColor: 'text-orange-700',
            hoverColor: 'hover:bg-orange-100',
            selectedBg: 'bg-orange-100',
            selectedBorder: 'border-orange-500'
        },
        {
            id: 'harassment',
            label: 'Harassment',
            description: 'Bullying, threats, or abusive behavior',
            icon: Angry,
            color: 'purple',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            textColor: 'text-purple-700',
            hoverColor: 'hover:bg-purple-100',
            selectedBg: 'bg-purple-100',
            selectedBorder: 'border-purple-500'
        },
        {
            id: 'misinformation',
            label: 'Misinformation',
            description: 'False or misleading information',
            icon: XCircle,
            color: 'pink',
            bgColor: 'bg-pink-50',
            borderColor: 'border-pink-200',
            textColor: 'text-pink-700',
            hoverColor: 'hover:bg-pink-100',
            selectedBg: 'bg-pink-100',
            selectedBorder: 'border-pink-500'
        },
        {
            id: 'off_topic',
            label: 'Off Topic',
            description: 'Content not related to the discussion',
            icon: AlertCircle,
            color: 'blue',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-700',
            hoverColor: 'hover:bg-blue-100',
            selectedBg: 'bg-blue-100',
            selectedBorder: 'border-blue-500'
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedReason) {
            alert('Please select a reason for reporting');
            return;
        }

        setIsSubmitting(true);
        
        try {
            await onSubmit({
                reason: selectedReason,
                details: details.trim()
            });
            
            // Reset form
            setSelectedReason('');
            setDetails('');
        } catch (error) {
            console.error('Report submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setSelectedReason('');
            setDetails('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />
            
            {/* Modal */}
            <div className="flex min-h-screen items-center justify-center p-4">
                <div 
                    className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-5 relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Flag className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Report {type === 'post' ? 'Post' : 'Reply'}
                                    </h2>
                                    <p className="text-white/90 text-sm mt-0.5">
                                        Help us keep the community safe
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all disabled:opacity-50"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
                        <div className="p-6 space-y-6">
                            {/* Reason Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-3">
                                    Why are you reporting this {type}?
                                </label>
                                <div className="space-y-3">
                                    {reportReasons.map((reason) => {
                                        const Icon = reason.icon;
                                        const isSelected = selectedReason === reason.id;
                                        
                                        return (
                                            <button
                                                key={reason.id}
                                                type="button"
                                                onClick={() => setSelectedReason(reason.id)}
                                                disabled={isSubmitting}
                                                className={`
                                                    w-full text-left p-4 rounded-xl border-2 transition-all duration-200
                                                    ${isSelected 
                                                        ? `${reason.selectedBg} ${reason.selectedBorder} shadow-lg scale-[1.02]`
                                                        : `${reason.bgColor} ${reason.borderColor} ${reason.hoverColor} hover:shadow-md`
                                                    }
                                                    disabled:opacity-50 disabled:cursor-not-allowed
                                                `}
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Icon */}
                                                    <div className={`
                                                        flex-shrink-0 p-2.5 rounded-lg
                                                        ${isSelected ? 'bg-white shadow-sm' : 'bg-white/50'}
                                                    `}>
                                                        <Icon className={`w-5 h-5 ${reason.textColor}`} />
                                                    </div>
                                                    
                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className={`font-bold ${reason.textColor} text-base`}>
                                                                {reason.label}
                                                            </h3>
                                                            {isSelected && (
                                                                <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {reason.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Additional Details (Optional)
                                </label>
                                <textarea
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    disabled={isSubmitting}
                                    placeholder="Provide any additional information that might help us understand the issue..."
                                    rows={4}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none text-sm"
                                    maxLength={500}
                                />
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-gray-500">
                                        Help us understand the situation better
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {details.length}/500
                                    </p>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                <div className="flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-semibold mb-1">Your report is anonymous</p>
                                        <p className="text-blue-700">
                                            Our moderation team will review this report and take appropriate action. 
                                            False reports may result in restrictions to your account.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="px-6 py-2.5 text-gray-700 font-semibold hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!selectedReason || isSubmitting}
                                className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Flag className="w-4 h-4" />
                                        <span>Submit Report</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}