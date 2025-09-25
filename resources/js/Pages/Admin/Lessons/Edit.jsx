// resources/js/Pages/Admin/Lessons/Edit.jsx
import React from "react";
import { useForm, Link, usePage } from "@inertiajs/react";

export default function Edit({ lesson: propLesson }) {
  const page = usePage();
  // 支持从 props 或 page.props 读取 lesson（兼容 SSR / Inertia）
  const lesson = propLesson ?? page.props?.lesson ?? null;

  if (!lesson) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Edit Lesson</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          Lesson data not found. It might have been deleted or failed to load.
        </div>
        <div className="mt-4">
          <Link href={route("admin.lessons.index")} className="px-4 py-2 border rounded">
            Back to Lessons
          </Link>
        </div>
      </div>
    );
  }

  // 可能你的模型使用 lesson_id 作为 route key，或是默认的 id
  const lessonId = lesson.lesson_id ?? lesson.id;

  // useForm 会把 data 自动发送给 Inertia 的 patch/put/post 等方法
  const { data, setData, patch, processing, errors } = useForm({
    title: lesson.title ?? "",
    description: lesson.description ?? "",
    difficulty: lesson.difficulty ?? "beginner",
    estimated_duration: lesson.estimated_duration ?? "",
    video_url: lesson.video_url ?? "",
    status: lesson.status ?? "draft",
    completion_reward_points: lesson.completion_reward_points ?? 0,
  });

  function submit(e) {
    e.preventDefault();

    if (!lessonId) {
      alert("Error: Missing lesson ID.");
      return;
    }

    // 调试：输出将要请求的 URL 与 payload，便于排查 405 / redirect 问题
    const resolved = route("admin.lessons.update", { lesson: lessonId });
    console.log("Resolved update URL:", resolved);
    console.log("Payload:", data);

    // 使用 PATCH（部分更新）发送请求到 /admin/lessons/{lesson}
    patch(resolved, {
      preserveScroll: true,
      onStart: () => console.log("lesson update started"),
      onSuccess: (page) => {
        console.log("lesson update success", page);
      },
      onError: (errs) => {
        console.warn("lesson update errors", errs);
      },
      onFinish: () => console.log("lesson update finished"),
    });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Lesson</h1>

      <form onSubmit={submit} className="space-y-6" >
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => setData("title", e.target.value)}
                className={`border rounded-md px-3 py-2 w-full ${errors.title ? "border-red-500" : "border-gray-300"}`}
                required
                maxLength={255}
              />
              {errors.title && <div className="text-red-600 text-sm mt-1">{errors.title}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                rows={6}
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
                className={`border rounded-md px-3 py-2 w-full ${errors.description ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.description && <div className="text-red-600 text-sm mt-1">{errors.description}</div>}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select
                value={data.difficulty}
                onChange={(e) => setData("difficulty", e.target.value)}
                className={`border rounded-md px-3 py-2 w-full ${errors.difficulty ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              {errors.difficulty && <div className="text-red-600 text-sm mt-1">{errors.difficulty}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Estimated Duration (minutes)</label>
              <input
                type="number"
                min="1"
                value={data.estimated_duration}
                onChange={(e) => setData("estimated_duration", e.target.value)}
                className={`border rounded-md px-3 py-2 w-full ${errors.estimated_duration ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.estimated_duration && <div className="text-red-600 text-sm mt-1">{errors.estimated_duration}</div>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Video URL</label>
              <input
                type="url"
                value={data.video_url}
                onChange={(e) => setData("video_url", e.target.value)}
                placeholder="https://..."
                className={`border rounded-md px-3 py-2 w-full ${errors.video_url ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.video_url && <div className="text-red-600 text-sm mt-1">{errors.video_url}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={data.status}
                onChange={(e) => setData("status", e.target.value)}
                className={`border rounded-md px-3 py-2 w-full ${errors.status ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.status && <div className="text-red-600 text-sm mt-1">{errors.status}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Completion Reward Points</label>
              <input
                type="number"
                min="0"
                value={data.completion_reward_points}
                onChange={(e) => setData("completion_reward_points", e.target.value)}
                className={`border rounded-md px-3 py-2 w-full ${errors.completion_reward_points ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.completion_reward_points && <div className="text-red-600 text-sm mt-1">{errors.completion_reward_points}</div>}
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <Link href={route("admin.lessons.index")} className="px-4 py-2 border rounded hover:bg-gray-50">
            ← Back to Lessons
          </Link>

          <button type="submit" disabled={processing} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
            {processing ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
