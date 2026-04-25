import React, { useState } from 'react';
import { FileText, Video, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import SafeContentRenderer from '@/Components/SafeContentRenderer';

const LessonContent = ({ lesson, sections = [] }) => {
  const [expandedSections, setExpandedSections] = useState(new Set());

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
                <h2 className="text-2xl font-bold text-gray-900">Lesson Sections</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {sections.length} sections in this lesson
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
        </div>
      )}

      {/* Lesson Content Section */}
      {lesson.content && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Lesson Content</h2>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200 shadow-inner">
            <SafeContentRenderer
              content={lesson.content}
              type={lesson.content_type || 'markdown'}
              className="text-gray-700 leading-relaxed"
            />
          </div>
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
    </>
  );
};

export default LessonContent;
