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

/**
 * EarningTips - 如何获得积分提示组件
 * 显示所有可以获得积分的方式和建议
 */
export default function EarningTips({ currentPoints }) {
  return (
    <div className="space-y-8">
      {/* 顶部提示 */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              如何快速获得积分？
            </h3>
            <p className="text-gray-700 mb-4">
              完成学习任务、保持学习连续性、解锁成就都能获得积分。
              积分可用于购买头像框、徽章、称号等个性化奖励！
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">当前积分:</span>
                <span className="text-2xl font-bold text-amber-600">
                  {currentPoints.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 获得积分的方式 */}
      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-600" />
          主要获得方式
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TipCard
            icon={Star}
            title="完成测验"
            description="完成测验可获得积分，分数越高，积分越多"
            points="30-60 积分"
            color="blue"
            actionText="去做测验"
            actionUrl="/student/lessons"
          />
          
          <TipCard
            icon={Zap}
            title="完成练习"
            description="完成课程练习获得积分奖励"
            points="10-30 积分"
            color="green"
            actionText="去练习"
            actionUrl="/lessons"
          />
          
          <TipCard
            icon={Trophy}
            title="完成课程"
            description="完整学完一门课程获得额外奖励"
            points="50-100 积分"
            color="purple"
            actionText="查看课程"
            actionUrl="/lessons"
          />
          
          <TipCard
            icon={Flame}
            title="保持连续学习"
            description="每天学习保持连续天数，获得连续奖励"
            points="5-50 积分/天"
            color="orange"
            actionText="查看进度"
            actionUrl="/student/profile"
          />
        </div>
      </section>

      {/* 额外奖励 */}
      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          额外奖励方式
        </h3>
        <div className="space-y-3">
          <BonusTip
            icon="🎯"
            title="完美分数"
            description="测验获得满分可获得额外积分奖励"
            bonus="+20 积分"
          />
          
          <BonusTip
            icon="🏆"
            title="解锁成就"
            description="完成特定成就任务获得一次性积分奖励"
            bonus="10-100 积分"
          />
          
          <BonusTip
            icon="⚡"
            title="难度加成"
            description="完成高难度测验和练习获得更多积分"
            bonus="x1.2 - x1.5"
          />
          
          <BonusTip
            icon="🔥"
            title="连续加成"
            description="连续学习天数越长，每日获得的积分加成越高"
            bonus="x1.1 - x1.2"
          />
        </div>
      </section>

      {/* 积分倍增提示 */}
      <section>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
          <div className="flex items-start gap-4">
            <TrendingUp className="w-8 h-8 text-purple-600 flex-shrink-0" />
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                💡 专业提示
              </h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>保持每日学习连续性可以获得累积奖励加成</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>完成难度较高的测验可以获得更多积分</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>解锁成就是获得大量积分的好方法</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>定期查看积分记录了解你的学习模式</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 使用积分 */}
      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Gift className="w-6 h-6 text-pink-600" />
          使用你的积分
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UseCard
            emoji="🖼️"
            title="头像框"
            description="装饰你的个人头像"
            priceRange="100-500 积分"
            actionUrl="/student/rewards?type=avatar_frame"
          />
          
          <UseCard
            emoji="🏅"
            title="徽章"
            description="展示你的成就"
            priceRange="50-300 积分"
            actionUrl="/student/rewards?type=badge"
          />
          
          <UseCard
            emoji="👑"
            title="称号"
            description="获得专属称号"
            priceRange="200-800 积分"
            actionUrl="/student/rewards?type=title"
          />
        </div>
      </section>
    </div>
  );
}

/**
 * TipCard - 提示卡片
 */
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

/**
 * BonusTip - 奖励提示
 */
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

/**
 * UseCard - 使用积分卡片
 */
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