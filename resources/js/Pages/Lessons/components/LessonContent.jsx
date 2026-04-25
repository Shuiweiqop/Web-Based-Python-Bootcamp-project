import React, { useEffect, useMemo, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { FileText, Video, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import SafeContentRenderer from '@/Components/SafeContentRenderer';

const LessonContent = ({
  auth,
  lesson,
  sections = [],
  isRegistered = false,
  contentCompleted = false,
}) => {
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [contentScrolledToBottom, setContentScrolledToBottom] = useState(false);
  const contentScrollRef = useRef(null);
  const hasAutoSubmittedRef = useRef(false);

  const isStudent = auth?.user?.role === 'student';
  const allSectionsOpened = useMemo(() => {
    if (sections.length === 0) {
      return true;
    }

    return sections.every((section) => expandedSections.has(section.id || section.lesson_section_id));
  }, [expandedSections, sections]);
  const hasStructuredContent = sections.length > 0 || Boolean(lesson.content) || Boolean(lesson.video_url);
  const canAutoReview = isStudent && isRegistered && !contentCompleted && allSectionsOpened && contentScrolledToBottom;

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleMarkContentComplete = () => {
    if ((!canAutoReview && hasStructuredContent) || isMarkingComplete || contentCompleted) {
      return;
    }

    setIsMarkingComplete(true);

    router.post(
      route('lessons.mark-content-complete', lesson.lesson_id),
      {},
      {
        preserveScroll: true,
        onFinish: () => setIsMarkingComplete(false),
      }
    );
  };

  useEffect(() => {
    if (contentCompleted) {
      hasAutoSubmittedRef.current = true;
      return;
    }

    if (canAutoReview && !hasAutoSubmittedRef.current) {
      hasAutoSubmittedRef.current = true;
      handleMarkContentComplete();
    }
  }, [canAutoReview, contentCompleted]);

  useEffect(() => {
    if (!lesson.content && !lesson.video_url && sections.length === 0) {
      setContentScrolledToBottom(true);
    }
  }, [lesson.content, lesson.video_url, sections.length]);

  useEffect(() => {
    const checkPageBottom = () => {
      if (contentScrolledToBottom) {
        return;
      }

      const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24;
      if (nearBottom) {
        setContentScrolledToBottom(true);
      }
    };

    checkPageBottom();
    window.addEventListener('scroll', checkPageBottom, { passive: true });

    return () => window.removeEventListener('scroll', checkPageBottom);
  }, [contentScrolledToBottom]);

  const handleContentScroll = () => {
    const node = contentScrollRef.current;

    if (!node || contentScrolledToBottom) {
      return;
    }

    const reachedBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 12;
    if (reachedBottom) {
      setContentScrolledToBottom(true);
    }
  };

  return (
    <>
      {/* 🔥 Lesson Sections (如果有 AI 生成的章节) */}
      {sections && sections.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 rounded-xl">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Guided Lesson Sections</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Open every section as part of the guided review flow
                </p>
              </div>
            </div>
            <span className="px-4 py-2 bg-purple-100 text-purple-800 font-bold rounded-full text-sm">
              📚 {sections.length}
            </span>
          </div>

          {/* Sections List */}
          <div className="space-y-3">
            {sections.map((section, index) => {
              const isExpanded = expandedSections.has(section.id || section.lesson_section_id);
              const sectionId = section.id || section.lesson_section_id;

              return (
                <div
                  key={sectionId}
                  className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200 overflow-hidden hover:border-purple-300 transition-all duration-200"
                >
                  {/* Section Header - Clickable */}
                  <button
                    onClick={() => toggleSection(sectionId)}
                    className="w-full flex items-center justify-between p-5 hover:bg-white/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Section Number Badge */}
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {index + 1}
                      </div>
                      {/* Section Title */}
                      <h3 className="text-lg font-bold text-gray-900 text-left">
                        {section.title}
                      </h3>
                    </div>
                    {/* Expand/Collapse Icon */}
                    <div className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </button>

                  {/* Section Content - Expandable */}
                  {isExpanded && (
                    <div className="px-5 pb-5">
                      <div className="pt-3 border-t-2 border-gray-200">
                        <div className="bg-white rounded-lg p-5 shadow-inner">
                          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {section.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Expand All Button */}
          {sections.length > 1 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  if (expandedSections.size === sections.length) {
                    setExpandedSections(new Set());
                  } else {
                    setExpandedSections(new Set(sections.map(s => s.id || s.lesson_section_id)));
                  }
                }}
                className="px-6 py-2 text-sm font-semibold text-purple-700 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors"
              >
                {expandedSections.size === sections.length ? 'Collapse All' : 'Expand All'}
              </button>
            </div>
          )}

          {isRegistered && (
            <div className="mt-5 rounded-xl border border-purple-200 bg-purple-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-purple-900">Content Review Checkpoint</p>
                  <p className="mt-1 text-sm text-purple-700">
                    {contentCompleted
                      ? 'Content review complete. Guided practice and checks are now available.'
                      : canAutoReview
                        ? 'Review requirements met. Saving your content review now.'
                        : !allSectionsOpened
                          ? 'Open every section first before review can unlock automatically.'
                          : 'Scroll through the lesson content until the end to auto-unlock review.'}
                  </p>
                </div>
                <div className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-purple-900 border border-purple-200">
                  {contentCompleted ? 'Reviewed' : isMarkingComplete ? 'Saving...' : 'Pending'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lesson Content Section */}
      {lesson.content && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Guided Lesson Content</h2>
          </div>
          <div
            ref={contentScrollRef}
            onScroll={handleContentScroll}
            className="max-h-[32rem] overflow-y-auto rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50 p-6 shadow-inner"
          >
            <SafeContentRenderer
              content={lesson.content}
              type={lesson.content_type || 'markdown'}
              className="text-gray-700 leading-relaxed"
            />
          </div>

          <div className="mt-3 text-sm text-gray-600">
            {contentCompleted
              ? 'Content review complete.'
              : contentScrolledToBottom
                ? 'You reached the end of the guided lesson content.'
                : 'Scroll to the bottom of the guided lesson content to unlock review.'}
          </div>

          {sections.length === 0 && isRegistered && (
            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-blue-900">Content Review Checkpoint</p>
                  <p className="mt-1 text-sm text-blue-700">
                    {contentCompleted
                      ? 'Content review complete. Guided practice and checks are now available.'
                      : canAutoReview
                        ? 'Review requirements met. Saving your content review now.'
                        : 'Scroll to the bottom of the lesson content before review unlocks automatically.'}
                  </p>
                </div>
                <div className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-900 border border-blue-200">
                  {contentCompleted ? 'Reviewed' : isMarkingComplete ? 'Saving...' : 'Pending'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Tutorial Section */}
{/* Video Tutorial Section */}
{lesson.video_url && (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2.5 bg-red-100 rounded-xl">
        <Video className="h-6 w-6 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">
        Video Tutorial
      </h2>
    </div>

    <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-inner">
      <iframe
        src={lesson.video_embed_url}   // ⚠️ 必须是 youtube.com/embed/xxx
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Lesson Video"
      />
    </div>
  </div>
)}

      {!lesson.content && sections.length === 0 && isRegistered && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow duration-300">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">Guided Review Checkpoint</p>
                <p className="mt-1 text-sm text-slate-700">
                  {contentCompleted
                    ? 'Content review complete. Guided practice and checks are now available.'
                    : canAutoReview
                      ? 'Review requirements met. Saving your content review now.'
                      : 'Once you reach the end of this lesson view, review will unlock automatically.'}
                </p>
              </div>
              <div className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 border border-slate-200">
                {contentCompleted ? 'Reviewed' : isMarkingComplete ? 'Saving...' : 'Pending'}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LessonContent;
