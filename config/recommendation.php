<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Placement Test Configuration
    |--------------------------------------------------------------------------
    |
    | Configure the default placement test ID for student onboarding.
    | This test will be used to evaluate new students and recommend 
    | appropriate learning paths.
    |
    */

    'placement_test_id' => env('PLACEMENT_TEST_ID', null),

    /*
    |--------------------------------------------------------------------------
    | Score Range Thresholds
    |--------------------------------------------------------------------------
    |
    | Define score ranges for automatic learning path recommendations.
    | Scores are percentages (0-100).
    |
    | The system will recommend paths where:
    | min_score_required <= student_score <= max_score_required
    |
    */

    'score_ranges' => [
        'beginner' => [
            'min' => (int) env('BEGINNER_MIN_SCORE', 0),
            'max' => (int) env('BEGINNER_MAX_SCORE', 60),
            'label' => 'Beginner Level',
            'description' => 'Students scoring 0-60% need foundational Python training',
        ],
        'intermediate' => [
            'min' => (int) env('INTERMEDIATE_MIN_SCORE', 61),
            'max' => (int) env('INTERMEDIATE_MAX_SCORE', 85),
            'label' => 'Intermediate Level',
            'description' => 'Students scoring 61-85% have basic Python knowledge',
        ],
        'advanced' => [
            'min' => (int) env('ADVANCED_MIN_SCORE', 86),
            'max' => (int) env('ADVANCED_MAX_SCORE', 100),
            'label' => 'Advanced Level',
            'description' => 'Students scoring 86-100% are ready for advanced topics',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Dynamic Path Re-evaluation
    |--------------------------------------------------------------------------
    |
    | Configure when and how the system should re-evaluate student progress
    | and potentially recommend path changes.
    |
    */

    // Trigger re-evaluation after completing N lessons
    'auto_recommend_after_lessons' => (int) env('AUTO_RECOMMEND_AFTER', 3),

    // Minimum lessons required before re-evaluation
    'min_lessons_for_reevaluation' => (int) env('MIN_LESSONS_FOR_REEVALUATION', 3),

    // Average score threshold to suggest upgrade to harder path
    'upgrade_threshold' => (float) env('UPGRADE_THRESHOLD', 85.0),

    // Average score threshold to suggest downgrade to easier path
    'downgrade_threshold' => (float) env('DOWNGRADE_THRESHOLD', 60.0),

    // Days of inactivity before sending reminder notification
    'inactivity_reminder_days' => (int) env('INACTIVITY_REMINDER_DAYS', 7),

    /*
    |--------------------------------------------------------------------------
    | Recommendation Confidence
    |--------------------------------------------------------------------------
    |
    | Configure minimum confidence scores for showing recommendations.
    |
    */

    // Minimum confidence score (0-100) to display a recommendation
    'min_recommendation_confidence' => (int) env('MIN_RECOMMENDATION_CONFIDENCE', 70),

    // Confidence boost when student's score is near center of path range
    'performance_match_boost' => 10,

    /*
    |--------------------------------------------------------------------------
    | Student Path Assignment Rules
    |--------------------------------------------------------------------------
    |
    | Rules for how students can be assigned to learning paths.
    |
    */

    // Allow students to have multiple active paths simultaneously
    'allow_multiple_paths' => env('ALLOW_MULTIPLE_PATHS', true),

    // Maximum number of active paths per student
    'max_active_paths' => (int) env('MAX_ACTIVE_PATHS', 3),

    // Automatically set first path as primary
    'auto_set_primary' => env('AUTO_SET_PRIMARY', true),

    // Automatically start path when assigned (vs waiting for student to start)
    'auto_start_on_assignment' => env('AUTO_START_ON_ASSIGNMENT', false),

    /*
    |--------------------------------------------------------------------------
    | Progress Calculation
    |--------------------------------------------------------------------------
    |
    | Configure how learning path progress is calculated.
    |
    */

    // Update path progress immediately after lesson completion
    'update_progress_on_lesson_complete' => true,

    // Minimum progress to consider path "in progress" vs "not started"
    'min_progress_threshold' => 1,

    // Weight for required vs optional lessons in progress calculation
    'required_lesson_weight' => 1.0,
    'optional_lesson_weight' => 0.5,

    /*
    |--------------------------------------------------------------------------
    | Lesson Unlocking
    |--------------------------------------------------------------------------
    |
    | Configure how lessons are unlocked within learning paths.
    |
    */

    // Allow students to skip lessons if path doesn't enforce sequential order
    'allow_lesson_skipping' => env('ALLOW_LESSON_SKIPPING', false),

    // Minimum score required to unlock next lesson (if enforced)
    'min_score_to_unlock_next' => (int) env('MIN_SCORE_TO_UNLOCK_NEXT', 70),

    /*
    |--------------------------------------------------------------------------
    | Path Completion Requirements
    |--------------------------------------------------------------------------
    |
    | Define what's required to mark a learning path as completed.
    |
    */

    // Must complete all required lessons
    'require_all_required_lessons' => true,

    // Must complete optional lessons for 100% completion
    'require_optional_lessons_for_100' => false,

    // Minimum overall progress to mark path as completed
    'min_progress_for_completion' => 100,

    /*
    |--------------------------------------------------------------------------
    | Notifications
    |--------------------------------------------------------------------------
    |
    | Configure which events should trigger notifications.
    |
    */

    // Notify student when new path is recommended
    'notify_on_recommendation' => env('NOTIFY_ON_RECOMMENDATION', true),

    // Notify student when path is completed
    'notify_on_path_completion' => env('NOTIFY_ON_PATH_COMPLETION', true),

    // Notify student when they're struggling (low progress)
    'notify_on_low_progress' => env('NOTIFY_ON_LOW_PROGRESS', false),

    // Notify admin when student completes path
    'notify_admin_on_completion' => env('NOTIFY_ADMIN_ON_COMPLETION', false),

    /*
    |--------------------------------------------------------------------------
    | Analytics & Tracking
    |--------------------------------------------------------------------------
    |
    | Configure data collection for analytics.
    |
    */

    // Track time spent in each path
    'track_time_spent' => true,

    // Track student engagement metrics
    'track_engagement' => true,

    // Generate weekly progress reports
    'weekly_progress_reports' => env('WEEKLY_PROGRESS_REPORTS', false),

    /*
    |--------------------------------------------------------------------------
    | Feature Flags
    |--------------------------------------------------------------------------
    |
    | Enable or disable specific features globally.
    |
    */

    // Enable placement tests for new students
    'enable_placement_tests' => env('ENABLE_PLACEMENT_TESTS', true),

    // Enable dynamic path recommendations based on progress
    'enable_dynamic_recommendations' => env('ENABLE_DYNAMIC_RECOMMENDATIONS', true),

    // Enable path cloning for admins
    'enable_path_cloning' => env('ENABLE_PATH_CLONING', true),

    // Enable student self-enrollment in paths
    'enable_self_enrollment' => env('ENABLE_SELF_ENROLLMENT', true),

    // Allow students to skip onboarding
    'allow_skip_onboarding' => env('ALLOW_SKIP_ONBOARDING', true),

    /*
    |--------------------------------------------------------------------------
    | UI/UX Settings
    |--------------------------------------------------------------------------
    |
    | Configure user interface behaviors.
    |
    */

    // Show alternative path suggestions on recommendation page
    'show_alternative_paths' => true,

    // Number of alternative paths to show
    'alternative_paths_count' => 3,

    // Show detailed progress breakdown
    'show_detailed_progress' => true,

    // Show estimated completion time
    'show_estimated_time' => true,

    /*
    |--------------------------------------------------------------------------
    | Default Path IDs (Optional)
    |--------------------------------------------------------------------------
    |
    | Specify default learning path IDs for each difficulty level.
    | These are used as fallbacks when no suitable path is found.
    |
    */

    'default_paths' => [
        'beginner' => (int) env('BEGINNER_PATH_ID', null),
        'intermediate' => (int) env('INTERMEDIATE_PATH_ID', null),
        'advanced' => (int) env('ADVANCED_PATH_ID', null),
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Settings
    |--------------------------------------------------------------------------
    |
    | Configure caching for performance optimization.
    |
    */

    // Cache learning paths for N minutes
    'cache_paths_minutes' => (int) env('CACHE_PATHS_MINUTES', 60),

    // Cache student progress for N minutes
    'cache_progress_minutes' => (int) env('CACHE_PROGRESS_MINUTES', 5),

    /*
    |--------------------------------------------------------------------------
    | Debug & Development
    |--------------------------------------------------------------------------
    |
    | Settings for debugging and development.
    |
    */

    // Log all recommendation decisions
    'log_recommendations' => env('LOG_RECOMMENDATIONS', false),

    // Enable detailed debug information
    'debug_mode' => env('APP_DEBUG', false),

];
