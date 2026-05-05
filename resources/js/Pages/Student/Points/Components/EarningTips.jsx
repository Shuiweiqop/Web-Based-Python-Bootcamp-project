import React from 'react';
import {
  Lightbulb,
  Target,
  Zap,
  Star,
  Trophy,
  Gift,
  TrendingUp,
  Award,
  Flame,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function EarningTips({ currentPoints }) {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              How can you earn points faster?
            </h3>
            <p className="text-gray-700 mb-4">
              Complete learning tasks, stay consistent, and unlock achievements to earn more points.
              You can spend them on avatar frames, badges, titles, and other profile rewards.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">Current points:</span>
                <span className="text-2xl font-bold text-amber-600">
                  {currentPoints.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-600" />
          Main ways to earn
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TipCard
            icon={Star}
            title="Complete Tests"
            description="Finish tests to earn points. Higher scores usually mean better rewards."
            points="30-60 pts"
            color="blue"
            actionText="Take a test"
            actionUrl="/student/lessons"
          />

          <TipCard
            icon={Zap}
            title="Complete Exercises"
            description="Work through lesson exercises to collect practice rewards."
            points="10-30 pts"
            color="green"
            actionText="Start practicing"
            actionUrl="/lessons"
          />

          <TipCard
            icon={Trophy}
            title="Finish Lessons"
            description="Complete a full lesson flow to unlock a bigger reward."
            points="50-100 pts"
            color="purple"
            actionText="Browse lessons"
            actionUrl="/lessons"
          />

          <TipCard
            icon={Flame}
            title="Keep a Streak"
            description="Study consistently each day to grow your streak rewards."
            points="5-50 pts/day"
            color="orange"
            actionText="View progress"
            actionUrl="/student/profile"
          />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          Bonus opportunities
        </h3>
        <div className="space-y-3">
          <BonusTip
            icon="🎯"
            title="Perfect Scores"
            description="A perfect test score can unlock extra points."
            bonus="+20 pts"
          />

          <BonusTip
            icon="🏆"
            title="Unlock Achievements"
            description="Special achievement goals can grant one-time point rewards."
            bonus="10-100 pts"
          />

          <BonusTip
            icon="⚡"
            title="Difficulty Bonus"
            description="Harder tests and exercises can lead to better point payouts."
            bonus="x1.2 - x1.5"
          />

          <BonusTip
            icon="🔥"
            title="Streak Bonus"
            description="Longer streaks can boost the points you earn each day."
            bonus="x1.1 - x1.2"
          />
        </div>
      </section>

      <section>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
          <div className="flex items-start gap-4">
            <TrendingUp className="w-8 h-8 text-purple-600 flex-shrink-0" />
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Pro Tips
              </h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>Staying active every day is one of the fastest ways to stack bonus rewards.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>Harder tests often lead to stronger point gains.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>Achievements are a great source of larger one-time rewards.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>Review your point history regularly to understand your strongest earning patterns.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Gift className="w-6 h-6 text-pink-600" />
          Spend your points
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UseCard
            emoji="🖼️"
            title="Avatar Frames"
            description="Style your profile avatar."
            priceRange="100-500 pts"
            actionUrl="/student/rewards?type=avatar_frame"
          />

          <UseCard
            emoji="🏅"
            title="Badges"
            description="Show off your achievements."
            priceRange="50-300 pts"
            actionUrl="/student/rewards?type=badge"
          />

          <UseCard
            emoji="👑"
            title="Titles"
            description="Unlock unique profile titles."
            priceRange="200-800 pts"
            actionUrl="/student/rewards?type=title"
          />
        </div>
      </section>
    </div>
  );
}

function TipCard({ icon: Icon, title, description, points, color, actionText, actionUrl }) {
  const colorClasses = {
    blue: 'from-blue-50 to-cyan-50 border-blue-200',
    green: 'from-green-50 to-emerald-50 border-green-200',
    purple: 'from-purple-50 to-fuchsia-50 border-purple-200',
    orange: 'from-orange-50 to-amber-50 border-orange-200',
  };

  const iconColors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className={`
      bg-gradient-to-br p-5 rounded-xl border-2 hover:shadow-lg transition-all
      ${colorClasses[color]}
    `}>
      <div className={`
        w-12 h-12 ${iconColors[color]} rounded-xl flex items-center justify-center mb-4
      `}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600 mb-3">{description}</p>

      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-gray-900">{points}</span>
        <a
          href={actionUrl}
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          {actionText}
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

function BonusTip({ icon, title, description, bonus }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
      <span className="text-3xl">{icon}</span>
      <div className="flex-1">
        <h5 className="font-semibold text-gray-900 mb-1">{title}</h5>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="text-right">
        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
          {bonus}
        </span>
      </div>
    </div>
  );
}

function UseCard({ emoji, title, description, priceRange, actionUrl }) {
  return (
    <a
      href={actionUrl}
      className="block p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-pink-300 hover:shadow-md transition-all group"
    >
      <div className="text-4xl mb-3">{emoji}</div>
      <h5 className="font-bold text-gray-900 mb-1 group-hover:text-pink-600 transition-colors">
        {title}
      </h5>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">{priceRange}</span>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-pink-600 transition-colors" />
      </div>
    </a>
  );
}
