import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Users,
  User,
  MessageSquare,
  Award,
  Sparkles,
  RotateCw,
  Zap,
} from 'lucide-react';
import AvatarFrameDisplay, { SimpleAvatarFrame, PremiumAvatarFrame } from './FrameDisplay';
/**
 * Admin Avatar Frame Preview
 * Shows how an avatar frame looks across different scenarios
 *
 * @param {string} frameUrl - URL of the frame image
 * @param {string} rarity - rarity key
 * @param {Object} metadata - frame metadata
 * @param {string} frameName - frame display name
 */
export default function AvatarFramePreview({
  frameUrl,
  rarity = 'common',
  metadata = {},
  frameName = 'Untitled Frame',
}) {
  const [showEffects, setShowEffects] = useState(true);
  const [selectedDemo, setSelectedDemo] = useState('profile'); // profile, list, comment, reward

  // demo users for previews
  const demoUsers = [
    { name: 'Alice Chen', avatar: null },
    { name: 'Bob Lee', avatar: null },
    { name: 'Carol Wu', avatar: null },
  ];

  // rarity labels
  const rarityLabels = {
    common: { label: 'Common', color: 'bg-gray-100 text-gray-800', icon: '⚪' },
    rare: { label: 'Rare', color: 'bg-blue-100 text-blue-800', icon: '💙' },
    epic: { label: 'Epic', color: 'bg-purple-100 text-purple-800', icon: '💜' },
    legendary: { label: 'Legendary', color: 'bg-yellow-100 text-yellow-800', icon: '🌟' },
  };

  const currentRarity = rarityLabels[rarity] || rarityLabels.common;

  // scenario buttons
  const scenarios = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'list', label: 'Student List', icon: Users },
    { id: 'comment', label: 'Comments', icon: MessageSquare },
    { id: 'reward', label: 'Reward Showcase', icon: Award },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Preview</h3>
            <p className="text-sm text-gray-600">See how the avatar frame appears in different scenarios</p>
          </div>
        </div>

        {/* Rarity tag */}
        <div className={`px-4 py-2 rounded-full font-semibold ${currentRarity.color}`}>
          {currentRarity.icon} {currentRarity.label}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-gray-700">Preview Settings</h4>
          <button
            type="button"
            onClick={() => setShowEffects(!showEffects)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showEffects
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {showEffects ? (
              <>
                <Zap className="w-4 h-4" />
                Effects On
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                Effects Off
              </>
            )}
          </button>
        </div>

        {/* Scenario selector */}
        <div className="grid grid-cols-4 gap-2">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              onClick={() => setSelectedDemo(scenario.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                selectedDemo === scenario.id
                  ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <scenario.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{scenario.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview area */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 p-8">
        {/* Scenario: Profile */}
        {selectedDemo === 'profile' && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center space-y-4">
                {/* Avatar */}
                <div className="flex justify-center">
                  {showEffects ? (
                    <AvatarFrameDisplay
                      userName="Student Name"
                      frameUrl={frameUrl}
                      size="xl"
                      rarity={rarity}
                      showGlow={true}
                      showSparkle={rarity === 'legendary' || rarity === 'epic'}
                      frameMetadata={metadata}
                    />
                  ) : (
                    <SimpleAvatarFrame
                      userName="Student Name"
                      frameUrl={frameUrl}
                      size="xl"
                    />
                  )}
                </div>

                {/* User info */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Student Name</h2>
                  <p className="text-sm text-gray-600">Python learner</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">12</p>
                    <p className="text-xs text-gray-600">Courses Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">850</p>
                    <p className="text-xs text-gray-600">Total Points</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">5</p>
                    <p className="text-xs text-gray-600">Badges Earned</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scenario: Student List */}
        {selectedDemo === 'list' && (
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Student Leaderboard
              </h3>
              <div className="space-y-3">
                {demoUsers.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {/* Rank */}
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>

                    {/* Avatar (first uses preview frame) */}
                    {index === 0 ? (
                      showEffects ? (
                        <AvatarFrameDisplay
                          userName={user.name}
                          frameUrl={frameUrl}
                          size="sm"
                          rarity={rarity}
                          showGlow={true}
                          showSparkle={false}
                        />
                      ) : (
                        <SimpleAvatarFrame
                          userName={user.name}
                          frameUrl={frameUrl}
                          size="sm"
                        />
                      )
                    ) : (
                      <SimpleAvatarFrame
                        userName={user.name}
                        frameUrl={null}
                        size="sm"
                      />
                    )}

                    {/* User info */}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600">Points: {1000 - index * 100}</p>
                    </div>

                    {/* Badge */}
                    {index === 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                        <Award className="w-3 h-3" />
                        Top
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scenario: Comments */}
        {selectedDemo === 'comment' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Course Discussion
              </h3>

              {/* Comment 1 (with preview frame) */}
              <div className="flex gap-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                {showEffects ? (
                  <AvatarFrameDisplay
                    userName="Student A"
                    frameUrl={frameUrl}
                    size="md"
                    rarity={rarity}
                    showGlow={true}
                    showSparkle={false}
                  />
                ) : (
                  <SimpleAvatarFrame
                    userName="Student A"
                    frameUrl={frameUrl}
                    size="md"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-gray-900">Student A</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${currentRarity.color}`}>
                      {currentRarity.icon} {currentRarity.label}
                    </span>
                    <span className="text-xs text-gray-500">2 minutes ago</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    This lesson was very clear! I finally understand recursion. Thanks to the instructor for the detailed explanation! 🎉
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                    <button type="button" className="hover:text-blue-600">👍 12</button>
                    <button type="button" className="hover:text-blue-600">💬 Reply</button>
                  </div>
                </div>
              </div>

              {/* Comment 2 (regular) */}
              <div className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                <SimpleAvatarFrame
                  userName="Student B"
                  frameUrl={null}
                  size="md"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-gray-900">Student B</p>
                    <span className="text-xs text-gray-500">5 minutes ago</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Agreed! This example is very practical.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scenario: Reward Showcase */}
        {selectedDemo === 'reward' && (
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-4 border-yellow-300 p-8 text-center space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <div className="text-6xl animate-bounce">🎉</div>
                <h2 className="text-3xl font-bold text-gray-900">Congratulations!</h2>
                <p className="text-lg text-gray-700">{frameName}</p>
              </div>

              {/* Premium avatar display */}
              <div className="flex justify-center py-4">
                <PremiumAvatarFrame
                  userName="You"
                  frameUrl={frameUrl}
                  rarity={rarity}
                />
              </div>

              {/* Rarity info */}
              <div className="space-y-3">
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold ${currentRarity.color}`}>
                  {currentRarity.icon} {currentRarity.label} Reward
                </div>

                {/* Effects description */}
                {showEffects && (
                  <div className="bg-white/80 backdrop-blur rounded-lg p-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-800 flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      Effects Bonus
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {rarity !== 'common' && (
                        <div className="flex items-center gap-1 text-gray-700">
                          <Zap className="w-3 h-3 text-blue-500" />
                          Glow effect
                        </div>
                      )}
                      {(rarity === 'epic' || rarity === 'legendary') && (
                        <div className="flex items-center gap-1 text-gray-700">
                          <Sparkles className="w-3 h-3 text-purple-500" />
                          Sparkle animation
                        </div>
                      )}
                      {rarity === 'legendary' && (
                        <>
                          <div className="flex items-center gap-1 text-gray-700">
                            <RotateCw className="w-3 h-3 text-yellow-500" />
                            Rotate effect
                          </div>
                          <div className="flex items-center gap-1 text-gray-700">
                            <Award className="w-3 h-3 text-yellow-500" />
                            Golden border
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Equip button */}
              <button type="button" className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg">
                Equip Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div className="text-sm text-gray-700">
            <p className="font-semibold text-gray-900 mb-1">💡 Preview Notes</p>
            <ul className="space-y-1 text-xs">
              <li>• Switch scenarios to inspect how the frame displays in context</li>
              <li>• Toggle effects on/off to compare differences</li>
              <li>• Higher rarity shows more elaborate effects</li>
              <li>• Users can equip this frame on their profile after purchase</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}