import React, { useEffect, useMemo, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { BookOpen, ChevronDown, ChevronUp, FileText, Lightbulb, Video } from 'lucide-react';
import SafeContentRenderer from '@/Components/SafeContentRenderer';

const extractTakeaways = (content = '') => {
  if (!content) return [];

  const headingMatches = [...content.matchAll(/^#{1,3}\s+(.+)$/gm)].map((match) => match[1].trim());
  if (headingMatches.length > 0) {
    return headingMatches.slice(0, 4);
  }

  return content
    .replace(/<[^>]*>/g, ' ')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 24)
    .slice(0, 4)
    .map((line) => (line.length > 90 ? `${line.slice(0, 87)}...` : line));
};

const buildLearningPoints = (lesson, sections, takeaways) => {
  if (sections.length > 0) {
    return sections.slice(0, 4).map((section) => section.title);
  }

  if (takeaways.length > 0) {
    return takeaways.slice(0, 4);
  }

  const basePoints = [];

  if (lesson.estimated_duration) {
    basePoints.push(`A focused ${lesson.estimated_duration}-minute lesson flow.`);
  }

  if (lesson.completion_reward_points) {
    basePoints.push(`A completion reward worth ${lesson.completion_reward_points} points.`);
  }

  basePoints.push('A guided path that unlocks practice and checks in order.');
  return basePoints.slice(0, 4);
};

const LessonContent = ({
  auth,
  lesson,
  sections = [],
  isRegistered = false,
  contentCompleted = false,
  onJourneySignalsChange,
}) => {
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [contentScrolledToBottom, setContentScrolledToBottom] = useState(false);
  const [showTakeaways, setShowTakeaways] = useState(true);
  const contentScrollRef = useRef(null);
  const hasAutoSubmittedRef = useRef(false);

  const isStudent = auth?.user?.role === 'student';
  const takeaways = useMemo(() => extractTakeaways(lesson.content), [lesson.content]);
  const learningPoints = useMemo(
    () => buildLearningPoints(lesson, sections, takeaways),
    [lesson, sections, takeaways]
  );
  const allSectionsOpened = useMemo(() => {
    if (sections.length === 0) {
      return true;
    }

    return sections.every((section) => expandedSections.has(section.id || section.lesson_section_id));
  }, [expandedSections, sections]);
  const hasStructuredContent = sections.length > 0 || Boolean(lesson.content) || Boolean(lesson.video_url);
  const canAutoReview = isStudent && isRegistered && !contentCompleted && allSectionsOpened && contentScrolledToBottom;
  const openedSectionsCount = expandedSections.size;

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleMarkContentComplete = () => {
    if ((!canAutoReview && hasStructuredContent) || isMarkingComplete || contentCompleted) {
      return;
    }

    setIsMarkingComplete(true);
    router.post(route('lessons.mark-content-complete', lesson.lesson_id), {}, {
      preserveScroll: true,
      onFinish: () => setIsMarkingComplete(false),
    });
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
      if (contentScrolledToBottom) return;

      const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24;
      if (nearBottom) {
        setContentScrolledToBottom(true);
      }
    };

    checkPageBottom();
    window.addEventListener('scroll', checkPageBottom, { passive: true });
    return () => window.removeEventListener('scroll', checkPageBottom);
  }, [contentScrolledToBottom]);

  useEffect(() => {
    onJourneySignalsChange?.({
      openedSections: openedSectionsCount,
      totalSections: sections.length,
      contentScrolledToBottom,
    });
  }, [contentScrolledToBottom, onJourneySignalsChange, openedSectionsCount, sections.length]);

  const handleContentScroll = () => {
    const node = contentScrollRef.current;
    if (!node || contentScrolledToBottom) return;

    const reachedBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 12;
    if (reachedBottom) {
      setContentScrolledToBottom(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">What you'll learn</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">{lesson.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Work through the lesson in order, unlock guided practice, then finish with your final checks.
            </p>
          </div>
          <div className="rounded-2xl border border-white bg-white/80 px-4 py-3 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              {lesson.estimated_duration ? `${lesson.estimated_duration} min` : 'Self-paced'}
            </p>
            <p className="text-xs text-slate-500">{lesson.completion_reward_points} point reward on completion</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {learningPoints.map((point) => (
            <div key={point} className="rounded-xl border border-blue-100 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
              {point}
            </div>
          ))}
        </div>
      </div>

      {takeaways.length > 0 && (
        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <button
            type="button"
            onClick={() => setShowTakeaways((value) => !value)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-100 p-2.5">
                <Lightbulb className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Key takeaways</h3>
                <p className="text-sm text-slate-500">Preview the ideas you are about to lock in.</p>
              </div>
            </div>
            {showTakeaways ? <ChevronUp className="h-5 w-5 text-slate-500" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
          </button>

          {showTakeaways && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {takeaways.map((takeaway) => (
                <div key={takeaway} className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-slate-700">
                  {takeaway}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {sections.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-100 p-2.5">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Guided lesson sections</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {openedSectionsCount} of {sections.length} sections opened
                </p>
              </div>
            </div>
            <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-bold text-purple-800">
              {contentCompleted ? 'Practice unlocked' : 'Open all sections'}
            </span>
          </div>

          <div className="space-y-3">
            {sections.map((section, index) => {
              const sectionId = section.id || section.lesson_section_id;
              const isExpanded = expandedSections.has(sectionId);

              return (
                <div
                  key={sectionId}
                  className="overflow-hidden rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50 transition-all duration-200 hover:border-purple-300"
                >
                  <button
                    type="button"
                    onClick={() => toggleSection(sectionId)}
                    className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-white/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-lg font-bold text-white shadow-md">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                        <p className="text-sm text-gray-500">
                          {isExpanded ? 'Opened and ready to review' : 'Open this section next'}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-lg p-2 transition-colors hover:bg-gray-200">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5">
                      <div className="border-t-2 border-gray-200 pt-3">
                        <div className="rounded-lg bg-white p-5 shadow-inner">
                          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">
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

          {sections.length > 1 && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  if (expandedSections.size === sections.length) {
                    setExpandedSections(new Set());
                  } else {
                    setExpandedSections(new Set(sections.map((section) => section.id || section.lesson_section_id)));
                  }
                }}
                className="rounded-lg px-6 py-2 text-sm font-semibold text-purple-700 transition-colors hover:bg-purple-50 hover:text-purple-900"
              >
                {expandedSections.size === sections.length ? 'Collapse all' : 'Open all sections'}
              </button>
            </div>
          )}

          {isRegistered && (
            <div className="mt-5 rounded-xl border border-purple-200 bg-purple-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-purple-900">Content review checkpoint</p>
                  <p className="mt-1 text-sm text-purple-700">
                    {contentCompleted
                      ? "You've unlocked practice. Start the guided exercises when you're ready."
                      : canAutoReview
                        ? 'Review complete. Unlocking practice now.'
                        : !allSectionsOpened
                          ? 'Open every section first, then keep reading until the end.'
                          : 'Great. Now scroll through the lesson content until the end to unlock practice.'}
                  </p>
                </div>
                <div className="shrink-0 rounded-lg border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-900">
                  {contentCompleted ? 'Unlocked' : isMarkingComplete ? 'Saving...' : 'In progress'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {lesson.content && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2.5">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Guided lesson content</h2>
              <p className="text-sm text-gray-500">Read through this lesson to unlock the next step.</p>
            </div>
          </div>

          <div
            ref={contentScrollRef}
            onScroll={handleContentScroll}
            className="max-h-[32rem] overflow-y-auto rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50 p-6 shadow-inner"
          >
            <SafeContentRenderer
              content={lesson.content}
              type={lesson.content_type || 'markdown'}
              className="leading-relaxed text-gray-700"
            />
          </div>

          <div className="mt-3 text-sm text-gray-600">
            {contentCompleted
              ? "You've unlocked practice for this lesson."
              : contentScrolledToBottom
                ? 'Nice. You reached the end of the lesson content.'
                : 'Scroll to the bottom of the lesson content to unlock practice.'}
          </div>

          {sections.length === 0 && isRegistered && (
            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-blue-900">Content review checkpoint</p>
                  <p className="mt-1 text-sm text-blue-700">
                    {contentCompleted
                      ? "You've unlocked practice. Jump into the guided exercises next."
                      : canAutoReview
                        ? 'Review complete. Unlocking practice now.'
                        : 'Scroll to the bottom of the lesson content before practice unlocks automatically.'}
                  </p>
                </div>
                <div className="shrink-0 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-900">
                  {contentCompleted ? 'Unlocked' : isMarkingComplete ? 'Saving...' : 'Pending'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {lesson.video_url && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-red-100 p-2.5">
              <Video className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Video tutorial</h2>
              <p className="text-sm text-gray-500">Use this walkthrough when you want an extra visual explanation.</p>
            </div>
          </div>

          <div className="aspect-video overflow-hidden rounded-xl bg-gray-100 shadow-inner">
            <iframe
              src={lesson.video_embed_url}
              className="h-full w-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Lesson Video"
            />
          </div>
        </div>
      )}

      {!lesson.content && sections.length === 0 && isRegistered && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">Guided review checkpoint</p>
                <p className="mt-1 text-sm text-slate-700">
                  {contentCompleted
                    ? "You've unlocked practice. Move on to the next part of the lesson."
                    : canAutoReview
                      ? 'Review complete. Unlocking practice now.'
                      : 'Once you reach the end of this lesson view, practice will unlock automatically.'}
                </p>
              </div>
              <div className="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900">
                {contentCompleted ? 'Unlocked' : isMarkingComplete ? 'Saving...' : 'Pending'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonContent;
