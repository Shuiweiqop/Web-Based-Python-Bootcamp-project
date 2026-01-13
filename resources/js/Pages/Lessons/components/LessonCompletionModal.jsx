import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { Trophy, Star, Zap, Award, TrendingUp, X, Loader } from 'lucide-react';

export default function LessonCompletionModal({ 
  isOpen, 
  onClose, 
  lesson,
  rewardPoints,
  onComplete // 🔥 添加完成回调
}) {
  const [step, setStep] = useState(0);
  const [confetti, setConfetti] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setConfetti(true);
      setShowTransition(false);
      
      // 动画序列
      const timer1 = setTimeout(() => setStep(1), 500);
      const timer2 = setTimeout(() => setStep(2), 1500);
      const timer3 = setTimeout(() => setStep(3), 2500);
      const confettiTimer = setTimeout(() => setConfetti(false), 5000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(confettiTimer);
      };
    }
  }, [isOpen]);

  /**
   * 🔥 处理完成课程
   * 1. 显示过场动画
   * 2. 调用后端完成课程
   * 3. 刷新页面数据
   */
  const handleCompleteLesson = () => {
    console.log('🎯 开始完成课程流程...');
    setIsCompleting(true);
    setShowTransition(true);
    
    // 等待过场动画播放
    setTimeout(() => {
      router.post(
        `/lessons/${lesson.lesson_id}/complete`,
        {},
        {
          preserveScroll: true,
          onSuccess: (page) => {
            console.log('✅ 课程完成成功！');
            console.log('📦 返回的数据:', page.props);
            
            // 🔥 延迟关闭模态框，让用户看到完成动画
            setTimeout(() => {
              onClose();
              setIsCompleting(false);
              setShowTransition(false);
              
              // 🔥 强制刷新页面以获取最新的 lesson 数据
              console.log('🔄 刷新页面数据...');
              router.visit(window.location.href, {
                preserveScroll: true,
                preserveState: false,
                replace: true,
                onSuccess: () => {
                  console.log('✅ 页面数据已刷新');
                }
              });
            }, 1000);
          },
          onError: (errors) => {
            console.error('❌ 完成课程失败:', errors);
            setIsCompleting(false);
            setShowTransition(false);
            
            // 显示错误消息
            const errorMessage = typeof errors === 'object' 
              ? Object.values(errors)[0] 
              : errors.toString();
            alert(errorMessage || 'Failed to complete lesson. Please try again.');
          },
          onFinish: () => {
            console.log('🏁 请求完成');
          }
        }
      );
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 主模态框 */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
        {/* 纸屑效果 */}
        {confetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10%',
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              >
                <div
                  className={`w-3 h-3 ${
                    ['bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-red-400', 'bg-purple-400'][
                      Math.floor(Math.random() * 5)
                    ]
                  }`}
                  style={{
                    transform: `rotate(${Math.random() * 360}deg)`,
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* 模态框内容 */}
        <div className={`bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden relative animate-scaleIn transition-all duration-500 ${
          showTransition ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}>
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            disabled={isCompleting}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10 disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* 奖杯动画 */}
          <div className="bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-500 p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
            
            <div className={`relative transform transition-all duration-1000 ${
              step >= 0 ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-180 opacity-0'
            }`}>
              <Trophy className="w-32 h-32 mx-auto text-white drop-shadow-2xl animate-bounce" />
            </div>
          </div>

          {/* 内容 */}
          <div className="p-8 space-y-6">
            {/* 标题 */}
            <div className={`text-center transform transition-all duration-700 ${
              step >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <h2 className="text-4xl font-black text-gray-900 mb-2">
                🎉 恭喜你! 🎉
              </h2>
              <p className="text-xl text-gray-700 font-semibold">
                你已完成这节课程！
              </p>
            </div>

            {/* 课程标题 */}
            <div className={`text-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-200 transform transition-all duration-700 delay-300 ${
              step >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <p className="text-sm text-purple-600 font-medium mb-1">课程完成</p>
              <h3 className="text-2xl font-bold text-gray-900">{lesson.title}</h3>
            </div>

            {/* 奖励 */}
            <div className={`grid grid-cols-2 gap-4 transform transition-all duration-700 delay-500 ${
              step >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border-2 border-amber-200 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-sm text-amber-700 font-medium mb-1">获得点数</p>
                <p className="text-3xl font-black text-amber-600">+{rewardPoints}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-green-700 font-medium mb-1">成就</p>
                <p className="text-lg font-black text-green-600">已解锁!</p>
              </div>
            </div>

            {/* 统计信息 */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  课程掌握度
                </span>
                <span className="font-bold text-gray-900">100%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                  学习进度
                </span>
                <span className="font-bold text-gray-900">优秀</span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="space-y-3">
              <button
                onClick={handleCompleteLesson}
                disabled={isCompleting}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:from-purple-400 disabled:to-pink-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                {isCompleting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Trophy className="w-5 h-5" />
                    完成并领取奖励
                  </>
                )}
              </button>
              
              <button
                onClick={() => router.visit('/lessons')}
                disabled={isCompleting}
                className="w-full py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                浏览更多课程
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 过场动画层 */}
      {showTransition && (
        <div className="fixed inset-0 z-[60] pointer-events-none">
          {/* 竖条扫过动画 */}
          <div className="absolute inset-0 flex overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-b from-purple-500 to-pink-600 animate-slideDown"
                style={{
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>

          {/* 中心光晕 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-expandRing">
              <div className="w-32 h-32 rounded-full border-2 border-white/50" />
            </div>
          </div>

          {/* 完成标签 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center animate-scaleInText">
              <div className="text-6xl font-black text-white drop-shadow-2xl mb-4">
                COMPLETED!
              </div>
              <div className="text-2xl font-bold text-white/90 drop-shadow-lg">
                +{rewardPoints} 点数
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 自定义样式 */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            transform: scale(0.8);
            opacity: 0;
          }
          to { 
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes slideDown {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        @keyframes expandRing {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }
        @keyframes scaleInText {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
        .animate-slideDown {
          animation: slideDown 0.8s ease-in-out forwards;
        }
        .animate-expandRing {
          animation: expandRing 0.8s ease-out forwards;
        }
        .animate-scaleInText {
          animation: scaleInText 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </>
  );
}