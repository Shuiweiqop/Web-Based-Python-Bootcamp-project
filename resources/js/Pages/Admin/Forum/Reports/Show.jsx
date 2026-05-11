import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
  AlertCircle, CheckCircle, XCircle, Trash2, ArrowLeft,
  User, Calendar, MessageSquare, FileText, Ban, Eye,
  Shield, Clock, Edit3, Save, X
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Show({ auth, report, statuses }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(report.status);
  const [adminNotes, setAdminNotes] = useState(report.admin_notes || '');
  const [processing, setProcessing] = useState(false);

  // 从 localStorage 读取主题
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : true;
    }
    return true;
  });

  // 监听主题变化（优化版）
  useEffect(() => {
    const handleThemeChange = () => {
      const saved = localStorage.getItem('theme');
      setIsDark(saved === 'dark');
    };

    window.addEventListener('theme-changed', handleThemeChange);
    window.addEventListener('storage', (e) => {
      if (e.key === 'theme') {
        setIsDark(e.newValue === 'dark');
      }
    });

    return () => {
      window.removeEventListener('theme-changed', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        bg: isDark ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-yellow-100 text-yellow-800 border-yellow-300',
        label: 'Pending',
        icon: <Clock className="w-4 h-4" />
      },
      reviewing: {
        bg: isDark ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-100 text-blue-800 border-blue-300',
        label: 'Reviewing',
        icon: <Eye className="w-4 h-4" />
      },
      reviewed: {
        bg: isDark ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-purple-100 text-purple-800 border-purple-300',
        label: 'Reviewed',
        icon: <CheckCircle className="w-4 h-4" />
      },
      resolved: {
        bg: isDark ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-green-100 text-green-800 border-green-300',
        label: 'Resolved',
        icon: <CheckCircle className="w-4 h-4" />
      },
      dismissed: {
        bg: isDark ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' : 'bg-gray-100 text-gray-800 border-gray-300',
        label: 'Dismissed',
        icon: <XCircle className="w-4 h-4" />
      },
    };
    return configs[status] || configs.pending;
  };

  const getReasonBadge = (reason) => {
    const badges = {
      spam: { label: 'Spam', bg: isDark ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-red-100 text-red-700 border-red-200' },
      inappropriate: { label: 'Inappropriate', bg: isDark ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' : 'bg-orange-100 text-orange-700 border-orange-200' },
      harassment: { label: 'Harassment', bg: isDark ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' : 'bg-pink-100 text-pink-700 border-pink-200' },
      misinformation: { label: 'Misinformation', bg: isDark ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-200' },
      off_topic: { label: 'Off Topic', bg: isDark ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-100 text-blue-700 border-blue-200' },
      other: { label: 'Other', bg: isDark ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' : 'bg-gray-100 text-gray-700 border-gray-200' },
    };
    return badges[reason] || badges.other;
  };

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    setProcessing(true);
    
    router.post(
      `/admin/forum/reports/${report.report_id}/status`,
      { status: selectedStatus, admin_notes: adminNotes },
      {
        onSuccess: () => {
          setStatusModalOpen(false);
          setProcessing(false);
        },
        onError: () => setProcessing(false),
      }
    );
  };

  const handleDeleteContent = () => {
    setProcessing(true);
    router.post(
      `/admin/forum/reports/${report.report_id}/delete-content`,
      {},
      {
        onSuccess: () => {
          setShowDeleteModal(false);
          setProcessing(false);
        },
        onError: () => setProcessing(false),
      }
    );
  };

  const goBack = () => router.visit('/admin/forum/reports');

  const statusConfig = getStatusConfig(report.status);
  const reasonBadge = getReasonBadge(report.reason);
  const reportedContent = report.reportable_type === 'post' ? report.post : report.reply;

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div>
          <button
            onClick={goBack}
            className={cn(
              "inline-flex items-center gap-2 mb-3 transition-all text-sm",
              isDark ? "text-slate-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </button>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <Shield className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
                Report #{report.report_id}
              </h2>
              <p className="mt-2 text-xs md:text-sm opacity-90">
                {new Date(report.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <span className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold border inline-flex items-center gap-2",
              statusConfig.bg
            )}>
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          </div>
        </div>
      }
    >
      <Head title={`Report #${report.report_id}`} />

      <div className={cn(
        "min-h-screen transition-colors duration-500",
        isDark ? "bg-slate-950" : "bg-gradient-to-br from-blue-50 via-purple-50 to-slate-50"
      )}>
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          {isDark ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" />
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
            </>
          ) : (
            <>
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
            </>
          )}
        </div>

        <div className="py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column - Report Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Report Info Card */}
                <div className={cn(
                  "rounded-2xl shadow-lg border p-4 md:p-6 backdrop-blur-sm animate-fadeIn",
                  isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
                )}>
                  <h2 className={cn("text-xl font-bold mb-4", isDark ? "text-white" : "text-gray-900")}>
                    Report Information
                  </h2>
                  
                  <div className="space-y-4">
                    <InfoRow label="Reason" isDark={isDark}>
                      <span className={cn("px-3 py-1.5 rounded-lg text-sm font-semibold border", reasonBadge.bg)}>
                        {reasonBadge.label}
                      </span>
                    </InfoRow>

                    <InfoRow label="Type" isDark={isDark}>
                      <div className="flex items-center gap-2">
                        {report.reportable_type === 'post' ? (
                          <FileText className={cn("w-4 h-4", isDark ? "text-slate-400" : "text-gray-400")} />
                        ) : (
                          <MessageSquare className={cn("w-4 h-4", isDark ? "text-slate-400" : "text-gray-400")} />
                        )}
                        <span className={cn("capitalize", isDark ? "text-white" : "text-gray-900")}>
                          {report.reportable_type}
                        </span>
                      </div>
                    </InfoRow>

                    {report.description && (
                      <InfoRow label="Description" isDark={isDark} noBorder>
                        <p className={cn(
                          "p-3 rounded-lg",
                          isDark ? "bg-slate-800 text-slate-300" : "bg-gray-50 text-gray-900"
                        )}>
                          {report.description}
                        </p>
                      </InfoRow>
                    )}

                    <InfoRow label="Reporter" isDark={isDark} noBorder>
                      <div className="flex items-center gap-2">
                        <User className={cn("w-4 h-4", isDark ? "text-slate-400" : "text-gray-400")} />
                        <span className={isDark ? "text-white" : "text-gray-900"}>
                          {report.reporter?.name || 'Unknown User'}
                        </span>
                        <span className={cn("text-sm", isDark ? "text-slate-500" : "text-gray-500")}>
                          ({report.reporter?.email})
                        </span>
                      </div>
                    </InfoRow>
                  </div>
                </div>

                {/* Reported Content */}
                <div className={cn(
                  "rounded-2xl shadow-lg border p-4 md:p-6 backdrop-blur-sm animate-fadeIn",
                  isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
                )}>
                  <h2 className={cn("text-xl font-bold mb-4", isDark ? "text-white" : "text-gray-900")}>
                    Reported Content
                  </h2>
                  
                  {reportedContent ? (
                    <div className={cn(
                      "rounded-xl border p-4",
                      isDark ? "bg-yellow-500/10 border-yellow-500/30" : "bg-yellow-50 border-yellow-200"
                    )}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <User className={cn("w-5 h-5", isDark ? "text-yellow-400" : "text-yellow-600")} />
                          <span className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
                            {report.reportable_type === 'post' 
                              ? reportedContent.user?.name 
                              : reportedContent.user?.name}
                          </span>
                          <span className={cn("text-sm", isDark ? "text-slate-500" : "text-gray-500")}>
                            {new Date(reportedContent.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {report.reportable_type === 'post' && (
                        <h3 className={cn("text-lg font-bold mb-2", isDark ? "text-white" : "text-gray-900")}>
                          {reportedContent.title}
                        </h3>
                      )}

                      <div className={cn(
                        "prose max-w-none",
                        isDark ? "text-slate-300" : "text-gray-700"
                      )}>
                        <p className="whitespace-pre-wrap">
                          {reportedContent.content || reportedContent.body}
                        </p>
                      </div>

                      {report.reportable_type === 'reply' && reportedContent.post && (
                        <div className={cn(
                          "mt-3 pt-3 border-t",
                          isDark ? "border-yellow-500/30" : "border-yellow-200"
                        )}>
                          <p className={cn("text-sm", isDark ? "text-slate-400" : "text-gray-500")}>
                            Reply to: <span className="font-semibold">{reportedContent.post.title}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className={cn(
                        "w-12 h-12 mx-auto mb-2",
                        isDark ? "text-slate-600" : "text-gray-400"
                      )} />
                      <p className={isDark ? "text-slate-400" : "text-gray-500"}>
                        Content has been deleted or is not available
                      </p>
                    </div>
                  )}
                </div>

                {/* Admin Notes */}
                {report.admin_notes && (
                  <div className={cn(
                    "rounded-2xl shadow-lg border p-4 md:p-6 backdrop-blur-sm animate-fadeIn",
                    isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
                  )}>
                    <h2 className={cn("text-xl font-bold mb-4", isDark ? "text-white" : "text-gray-900")}>
                      Admin Notes
                    </h2>
                    <p className={cn(
                      "p-4 rounded-lg whitespace-pre-wrap",
                      isDark ? "bg-blue-500/10 text-blue-300" : "bg-blue-50 text-blue-900"
                    )}>
                      {report.admin_notes}
                    </p>
                    {report.reviewer && (
                      <div className={cn(
                        "mt-4 text-sm flex items-center gap-2",
                        isDark ? "text-slate-400" : "text-gray-500"
                      )}>
                        <User className="w-4 h-4" />
                        <span>Reviewed by {report.reviewer.name}</span>
                        {report.reviewed_at && (
                          <span>on {new Date(report.reviewed_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column - Actions */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className={cn(
                  "rounded-2xl shadow-lg border p-4 md:p-6 backdrop-blur-sm animate-fadeIn",
                  isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
                )}>
                  <h3 className={cn("text-lg font-bold mb-4", isDark ? "text-white" : "text-gray-900")}>
                    Actions
                  </h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => setStatusModalOpen(true)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Update Status
                    </button>

                    {reportedContent && (
                      <>
                        <button
                          onClick={() => setShowBlockModal(true)}
                          className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                        >
                          <Ban className="w-4 h-4" />
                          Block User
                        </button>

                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Content
                        </button>
                      </>
                    )}

                    <div className={cn(
                      "pt-3 border-t",
                      isDark ? "border-white/10" : "border-gray-200"
                    )}>
                      <h4 className={cn(
                        "text-sm font-semibold mb-2",
                        isDark ? "text-slate-300" : "text-gray-700"
                      )}>
                        Quick Status Update
                      </h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setSelectedStatus('resolved');
                            setAdminNotes('Issue resolved');
                            setTimeout(() => handleUpdateStatus({ preventDefault: () => {} }), 100);
                          }}
                          disabled={processing}
                          className={cn(
                            "w-full text-sm px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-2 font-medium",
                            isDark 
                              ? "bg-green-500/20 text-green-300 hover:bg-green-500/30" 
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          )}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Resolved
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedStatus('dismissed');
                            setAdminNotes('Report dismissed - no action needed');
                            setTimeout(() => handleUpdateStatus({ preventDefault: () => {} }), 100);
                          }}
                          disabled={processing}
                          className={cn(
                            "w-full text-sm px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-2 font-medium",
                            isDark 
                              ? "bg-gray-500/20 text-gray-300 hover:bg-gray-500/30" 
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          <XCircle className="w-4 h-4" />
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className={cn(
                  "rounded-2xl shadow-lg border p-4 md:p-6 backdrop-blur-sm animate-fadeIn",
                  isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
                )}>
                  <h3 className={cn("text-lg font-bold mb-4", isDark ? "text-white" : "text-gray-900")}>
                    Report Stats
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <StatRow label="Report ID" value={`#${report.report_id}`} isDark={isDark} />
                    <StatRow label="Status" value={<span className="capitalize">{report.status}</span>} isDark={isDark} />
                    <StatRow label="Type" value={<span className="capitalize">{report.reportable_type}</span>} isDark={isDark} />
                    <StatRow label="Created" value={new Date(report.created_at).toLocaleDateString()} isDark={isDark} />
                    {report.reviewed_at && (
                      <StatRow 
                        label="Reviewed" 
                        value={new Date(report.reviewed_at).toLocaleDateString()} 
                        isDark={isDark} 
                        noBorder
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <StatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        adminNotes={adminNotes}
        setAdminNotes={setAdminNotes}
        onSubmit={handleUpdateStatus}
        processing={processing}
        statuses={statuses}
        isDark={isDark}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteContent}
        processing={processing}
        reportType={report.reportable_type}
        isDark={isDark}
      />

      <BlockModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        userName={reportedContent?.user?.name}
        isDark={isDark}
      />

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </AuthenticatedLayout>
  );
}

// Helper Components
function InfoRow({ label, children, isDark, noBorder = false }) {
  return (
    <div className={cn(
      !noBorder && (isDark ? "pb-4 border-b border-white/10" : "pb-4 border-b border-gray-200")
    )}>
      <label className={cn("block text-sm font-medium mb-2", isDark ? "text-slate-400" : "text-gray-500")}>
        {label}
      </label>
      <div>{children}</div>
    </div>
  );
}

function StatRow({ label, value, isDark, noBorder = false }) {
  return (
    <div className={cn(
      "flex justify-between items-center",
      !noBorder && (isDark ? "pb-3 border-b border-white/10" : "pb-3 border-b border-gray-200")
    )}>
      <span className={isDark ? "text-slate-400" : "text-gray-600"}>{label}</span>
      <span className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>{value}</span>
    </div>
  );
}

// Modal Components
function StatusModal({ isOpen, onClose, selectedStatus, setSelectedStatus, adminNotes, setAdminNotes, onSubmit, processing, statuses, isDark }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={cn(
        "rounded-2xl max-w-md w-full p-6 shadow-2xl",
        isDark ? "bg-slate-900 border border-white/10" : "bg-white"
      )}>
        <h3 className={cn("text-xl font-bold mb-4", isDark ? "text-white" : "text-gray-900")}>
          Update Report Status
        </h3>
        
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <label className={cn("block text-sm font-semibold mb-2", isDark ? "text-slate-300" : "text-gray-700")}>
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 rounded-lg transition-all outline-none",
                  isDark
                    ? "bg-slate-800 border-2 border-white/10 text-white focus:border-cyan-500/50"
                    : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500"
                )}
              >
                {statuses && Object.entries(statuses).map(([key, config]) => (
                  <option key={key} value={key}>
                    {typeof config === 'object' && config.label ? config.label : key}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={cn("block text-sm font-semibold mb-2", isDark ? "text-slate-300" : "text-gray-700")}>
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                className={cn(
                  "w-full px-4 py-3 rounded-lg transition-all outline-none resize-none",
                  isDark
                    ? "bg-slate-800 border-2 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-500/50"
                    : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500"
                )}
                placeholder="Add notes about this decision..."
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl transition-all font-semibold border-2",
                isDark 
                  ? "bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700" 
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {processing ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ isOpen, onClose, onConfirm, processing, reportType, isDark }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={cn(
        "rounded-2xl max-w-md w-full p-6 shadow-2xl",
        isDark ? "bg-slate-900 border border-white/10" : "bg-white"
      )}>
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            "p-3 rounded-xl",
            isDark ? "bg-red-500/20" : "bg-red-100"
          )}>
            <AlertCircle className={cn("w-6 h-6", isDark ? "text-red-400" : "text-red-600")} />
          </div>
          <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>
            Delete Content
          </h3>
        </div>
        
        <p className={cn("mb-6", isDark ? "text-slate-300" : "text-gray-600")}>
          Are you sure you want to delete this {reportType}? This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={processing}
            className={cn(
              "flex-1 px-4 py-3 rounded-xl transition-all font-semibold border-2",
              isDark 
                ? "bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700" 
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            )}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={processing}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {processing ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function BlockModal({ isOpen, onClose, userName, isDark }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={cn(
        "rounded-2xl max-w-md w-full p-6 shadow-2xl",
        isDark ? "bg-slate-900 border border-white/10" : "bg-white"
      )}>
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            "p-3 rounded-xl",
            isDark ? "bg-orange-500/20" : "bg-orange-100"
          )}>
            <Ban className={cn("w-6 h-6", isDark ? "text-orange-400" : "text-orange-600")} />
          </div>
          <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>
            Block User
          </h3>
        </div>
        
        <p className={cn("mb-4", isDark ? "text-slate-300" : "text-gray-600")}>
          Block user: <strong>{userName}</strong>
        </p>

        <div className="space-y-3 mb-6">
          <label className="flex items-center">
            <input 
              type="checkbox" 
              className={cn(
                "mr-2 rounded",
                isDark 
                  ? "bg-slate-800 border-white/10 text-orange-500" 
                  : "border-gray-300 text-orange-600"
              )}
            />
            <span className={cn("text-sm", isDark ? "text-slate-300" : "text-gray-700")}>
              Delete all user's posts
            </span>
          </label>
          <label className="flex items-center">
            <input 
              type="checkbox" 
              className={cn(
                "mr-2 rounded",
                isDark 
                  ? "bg-slate-800 border-white/10 text-orange-500" 
                  : "border-gray-300 text-orange-600"
              )}
            />
            <span className={cn("text-sm", isDark ? "text-slate-300" : "text-gray-700")}>
              Send notification to user
            </span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={cn(
              "flex-1 px-4 py-3 rounded-xl transition-all font-semibold border-2",
              isDark 
                ? "bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700" 
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            )}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              alert('Block user functionality - integrate with your backend');
              onClose();
            }}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
          >
            <Ban className="w-4 h-4" />
            Block User
          </button>
        </div>
      </div>
    </div>
  );
}