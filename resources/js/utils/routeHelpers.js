// resources/js/utils/routeHelpers.js

/**
 * Safe route helper - generates URLs even when Ziggy route() fails
 * Falls back to manual URL construction if route helper is unavailable
 * 
 * @param {string} name - Route name (e.g., 'admin.lessons.show')
 * @param {*} params - Route parameters (string, number, array, or object)
 * @returns {string|null} - Generated URL or null if unable to generate
 */
export const safeRoute = (name, params = null) => {
  try {
    // Try using Ziggy's route helper first
    const url = route(name, params);
    
    // ✅ 强制转换为相对 URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const urlObj = new URL(url);
        return urlObj.pathname; // 只返回路径: /admin/rewards/1
      } catch (e) {
        console.warn('Failed to parse URL:', url, e);
      }
    }
    
    return url;
  } catch (err) {
    // Fallback: Manual URL construction
    console.debug(`Route helper failed for "${name}", using fallback`, err);
    return generateFallbackRoute(name, params);
  }
};


/**
 * Generate fallback routes when Ziggy fails
 * Supports common admin route patterns
 * 
 * @param {string} name - Route name
 * @param {*} params - Route parameters
 * @returns {string|null} - Fallback URL or null
 */
const generateFallbackRoute = (name, params) => {
  // Extract IDs from params
  const getId = (p) => {
    if (Array.isArray(p)) return p;
    if (typeof p === 'object' && p !== null) return Object.values(p);
    return [p];
  };

  const ids = params ? getId(params) : [];
  const [lessonId, secondId] = ids;

  // ===== ADMIN REWARD ROUTES ===== ✅ NEW
  if (name === 'admin.rewards.index') return '/admin/rewards';
  if (name === 'admin.rewards.create') return '/admin/rewards/create';
  if (name === 'admin.rewards.show') return `/admin/rewards/${lessonId}`;
  if (name === 'admin.rewards.edit') return `/admin/rewards/${lessonId}/edit`;
  if (name === 'admin.rewards.destroy') return `/admin/rewards/${lessonId}`;
  if (name === 'admin.rewards.store') return '/admin/rewards';
  if (name === 'admin.rewards.update') return `/admin/rewards/${lessonId}`;
  if (name === 'admin.rewards.toggleActive') return `/admin/rewards/${lessonId}/toggle-active`;

  // ===== ADMIN LESSON ROUTES =====
  if (name === 'admin.lessons.index') return '/admin/lessons';
  if (name === 'admin.lessons.create') return '/admin/lessons/create';
  if (name === 'admin.lessons.quick-draft') return '/admin/lessons/quick-draft';
  if (name === 'admin.lessons.show') return `/admin/lessons/${lessonId}`;
  if (name === 'admin.lessons.edit') return `/admin/lessons/${lessonId}/edit`;
  if (name === 'admin.lessons.destroy') return `/admin/lessons/${lessonId}`;
  if (name === 'admin.lessons.store') return '/admin/lessons';
  if (name === 'admin.lessons.update') return `/admin/lessons/${lessonId}`;

  // ===== ADMIN TEST ROUTES =====
  if (name === 'admin.lessons.tests.index') return `/admin/lessons/${lessonId}/tests`;
  if (name === 'admin.lessons.tests.create') return `/admin/lessons/${lessonId}/tests/create`;
  if (name === 'admin.lessons.tests.show') return `/admin/lessons/${lessonId}/tests/${secondId}`;
  if (name === 'admin.lessons.tests.edit') return `/admin/lessons/${lessonId}/tests/${secondId}/edit`;
  if (name === 'admin.lessons.tests.destroy') return `/admin/lessons/${lessonId}/tests/${secondId}`;
  if (name === 'admin.lessons.tests.store') return `/admin/lessons/${lessonId}/tests`;
  if (name === 'admin.lessons.tests.update') return `/admin/lessons/${lessonId}/tests/${secondId}`;

  // ===== ADMIN TEST QUESTION ROUTES =====
  if (name === 'admin.lessons.tests.questions.index') return `/admin/lessons/${lessonId}/tests/${secondId}/questions`;
  if (name === 'admin.lessons.tests.questions.create') return `/admin/lessons/${lessonId}/tests/${secondId}/questions/create`;
  if (name === 'admin.lessons.tests.questions.show') return `/admin/lessons/${lessonId}/tests/${secondId}/questions/${ids[2]}`;
  if (name === 'admin.lessons.tests.questions.edit') return `/admin/lessons/${lessonId}/tests/${secondId}/questions/${ids[2]}/edit`;
  if (name === 'admin.lessons.tests.questions.destroy') return `/admin/lessons/${lessonId}/tests/${secondId}/questions/${ids[2]}`;
  if (name === 'admin.lessons.tests.questions.store') return `/admin/lessons/${lessonId}/tests/${secondId}/questions`;
  if (name === 'admin.lessons.tests.questions.update') return `/admin/lessons/${lessonId}/tests/${secondId}/questions/${ids[2]}`;

  // ===== ADMIN EXERCISE ROUTES =====
  if (name === 'admin.lessons.exercises.index') return `/admin/lessons/${lessonId}/exercises`;
  if (name === 'admin.lessons.exercises.create') return `/admin/lessons/${lessonId}/exercises/create`;
  if (name === 'admin.lessons.exercises.show') return `/admin/lessons/${lessonId}/exercises/${secondId}`;
  if (name === 'admin.lessons.exercises.edit') return `/admin/lessons/${lessonId}/exercises/${secondId}/edit`;
  if (name === 'admin.lessons.exercises.destroy') return `/admin/lessons/${lessonId}/exercises/${secondId}`;
  if (name === 'admin.lessons.exercises.store') return `/admin/lessons/${lessonId}/exercises`;
  if (name === 'admin.lessons.exercises.update') return `/admin/lessons/${lessonId}/exercises/${secondId}`;

  // ===== STUDENT LESSON ROUTES =====
  if (name === 'lessons.index') return '/lessons';
  if (name === 'lessons.show') return `/lessons/${lessonId}`;
  if (name === 'lessons.register') return `/lessons/${lessonId}/register`;
  if (name === 'lessons.cancel-registration') return `/lessons/${lessonId}/cancel-registration`;

  // ===== STUDENT EXERCISE ROUTES =====
  if (name === 'lessons.exercises.index') return `/lessons/${lessonId}/exercises`;
  if (name === 'lessons.exercises.show') return `/lessons/${lessonId}/exercises/${secondId}`;
  if (name === 'lessons.exercises.submit') return `/lessons/${lessonId}/exercises/${secondId}/submit`;

  // ===== STUDENT TEST ROUTES =====
  if (name === 'student.tests.start') return `/student/lessons/${lessonId}/tests/${secondId}/start`;
  if (name === 'student.submissions.show') return `/student/submissions/${lessonId}`;
  if (name === 'student.submissions.answer') return `/student/submissions/${lessonId}/answer`;
  if (name === 'student.submissions.complete') return `/student/submissions/${lessonId}/complete`;
  if (name === 'student.submissions.result') return `/student/submissions/${lessonId}/result`;

  // ===== STUDENT REWARD ROUTES ===== ✅ NEW
  if (name === 'rewards.index') return '/rewards';
  if (name === 'rewards.purchase') return `/rewards/${lessonId}/purchase`;
  if (name === 'rewards.equip') return `/rewards/${lessonId}/equip`;
  if (name === 'rewards.unequip') return `/rewards/${lessonId}/unequip`;
  if (name === 'rewards.inventory') return '/rewards/inventory';
  if (name === 'rewards.history') return '/rewards/history';

  // ===== ADMIN DASHBOARD =====
  if (name === 'admin.dashboard') return '/admin/dashboard';

  // ===== STUDENT DASHBOARD =====
  if (name === 'dashboard') return '/dashboard';
  if (name === 'student.dashboard') return '/dashboard';

  // ===== PROFILE ROUTES =====
  if (name === 'profile.edit') return '/profile';
  if (name === 'profile.update') return '/profile';
  if (name === 'profile.destroy') return '/profile';

  // If no match found
  console.warn(`No fallback route found for "${name}" with params:`, params);
  return null;
};

/**
 * Check if a route exists in Ziggy
 * @param {string} name - Route name
 * @returns {boolean}
 */
export const routeExists = (name) => {
  try {
    route(name);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get current route name
 * @returns {string|null}
 */
export const currentRoute = () => {
  try {
    return route().current();
  } catch {
    // Fallback: parse from window.location
    const path = window.location.pathname;
    
    if (path.startsWith('/admin/rewards')) return 'admin.rewards.*';
    if (path.startsWith('/admin/lessons')) {
      if (path.includes('/tests')) return 'admin.lessons.tests.*';
      if (path.includes('/exercises')) return 'admin.lessons.exercises.*';
      return 'admin.lessons.*';
    }
    if (path.startsWith('/lessons')) return 'lessons.*';
    if (path.startsWith('/student')) return 'student.*';
    if (path.startsWith('/rewards')) return 'rewards.*';
    if (path.startsWith('/dashboard')) return 'dashboard';
    
    return null;
  }
};

/**
 * Check if current route matches a pattern
 * @param {string|string[]} patterns - Route pattern(s) to match
 * @returns {boolean}
 */
export const isCurrentRoute = (patterns) => {
  const current = currentRoute();
  if (!current) return false;

  const patternArray = Array.isArray(patterns) ? patterns : [patterns];
  
  return patternArray.some(pattern => {
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      return current.startsWith(prefix);
    }
    return current === pattern;
  });
};

/**
 * Generate URLs for common actions (CRUD)
 * @param {string} resource - Resource name (e.g., 'admin.lessons')
 * @param {object} options - Options
 * @returns {object} - Object with index, create, show, edit, destroy URLs
 */
export const resourceRoutes = (resource, { lessonId = null, id = null } = {}) => {
  return {
    index: safeRoute(`${resource}.index`, lessonId),
    create: safeRoute(`${resource}.create`, lessonId),
    show: id ? safeRoute(`${resource}.show`, [lessonId, id].filter(Boolean)) : null,
    edit: id ? safeRoute(`${resource}.edit`, [lessonId, id].filter(Boolean)) : null,
    destroy: id ? safeRoute(`${resource}.destroy`, [lessonId, id].filter(Boolean)) : null,
    store: safeRoute(`${resource}.store`, lessonId),
    update: id ? safeRoute(`${resource}.update`, [lessonId, id].filter(Boolean)) : null,
  };
};

// Export default for convenience
export default {
  safeRoute,
  routeExists,
  currentRoute,
  isCurrentRoute,
  resourceRoutes,
};
