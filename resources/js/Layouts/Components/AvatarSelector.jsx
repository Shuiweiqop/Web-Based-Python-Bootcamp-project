import React, { useState, useMemo, useEffect } from 'react';
import { X, Check, Eye, Sparkles, Filter, User, Frame } from 'lucide-react';
import RewardCard from './RewardCard';
import Avatar from './Avatar';
import { useEquip } from '@/Contexts/EquipContext';

/**
 * AvatarSelector - 头像/头像框选择器
 * 
 * 功能:
 * 1. 同时支持头像和头像框选择
 * 2. 实时预览（使用 Avatar 组件）
 * 3. 响应式侧边栏/模态预览
 * 4. 稀有度筛选
 * 5. 类型切换（头像 vs 头像框）
 */
export default function AvatarSelector({ 
  items = [],
  loading = false,
  currentUser = null, // { name, avatar_url, email }
  onClose = null,
  className = ''
}) {
  const { equipped, equipItem, unequipItem } = useEquip();
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [rarityFilter, setRarityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'avatar' | 'avatar_frame'
  const [isEquipping, setIsEquipping] = useState(false);

  // 当前装备的头像框
  const currentEquippedFrame = equipped?.avatar_frame;

  // 分离头像和头像框
  const { avatars, frames } = useMemo(() => {
    const avatarList = items.filter(item => 
      (item.reward_type || item.type) === 'avatar'
    );
    const frameList = items.filter(item => 
      (item.reward_type || item.type) === 'avatar_frame'
    );
    return { avatars: avatarList, frames: frameList };
  }, [items]);

  // 初始化：选中当前装备的头像框
  useEffect(() => {
    if (currentEquippedFrame && frames.length > 0) {
      const current = frames.find(item => 
        item.id === currentEquippedFrame.id || 
        item.reward_id === currentEquippedFrame.id
      );
      if (current) {
        setSelectedItem(current);
        setPreviewItem(current);
        setTypeFilter('avatar_frame');
      }
    } else if (frames.length > 0 && !selectedItem) {
      setSelectedItem(frames[0]);
      setPreviewItem(frames[0]);
    }
  }, [currentEquippedFrame, frames, selectedItem]);

  // 类型选项
  const typeOptions = [
    { value: 'all', label: 'All', icon: Sparkles },
    { value: 'avatar_frame', label: 'Frames', icon: Frame, count: frames.length },
    // { value: 'avatar', label: 'Avatars', icon: User, count: avatars.length } // 未来支持
  ];

  // 稀有度选项
  const rarityOptions = [
    { value: 'all', label: 'All', color: 'text-gray-400' },
    { value: 'legendary', label: 'Legendary', color: 'text-yellow-400' },
    { value: 'epic', label: 'Epic', color: 'text-purple-400' },
    { value: 'rare', label: 'Rare', color: 'text-blue-400' },
    { value: 'uncommon', label: 'Uncommon', color: 'text-green-400' },
    { value: 'common', label: 'Common', color: 'text-gray-400' }
  ];

  // 筛选后的物品
  const filteredItems = useMemo(() => {
    let result = [...items];
    
    // 类型筛选
    if (typeFilter !== 'all') {
      result = result.filter(item => 
        (item.reward_type || item.type) === typeFilter
      );
    }
    
    // 稀有度筛选
    if (rarityFilter !== 'all') {
      result = result.filter(item => item.rarity === rarityFilter);
    }
    
    return result;
  }, [items, typeFilter, rarityFilter]);

  // 检查是否已装备
  const isEquipped = (item) => {
    const itemType = item.reward_type || item.type;
    const currentEquipped = itemType === 'avatar_frame' 
      ? equipped?.avatar_frame 
      : equipped?.avatar;
    
    if (!currentEquipped) return false;
    return (item.id || item.reward_id) === (currentEquipped.id || currentEquipped.reward_id);
  };

  // 处理卡片点击
  const handleCardClick = (item) => {
    setSelectedItem(item);
    setPreviewItem(item);
    
    // 移动端：打开模态预览
    if (window.innerWidth < 1024) {
      setShowPreviewModal(true);
    }
  };

  // 处理装备
  const handleEquip = async () => {
    if (!selectedItem || isEquipping) return;
    
    setIsEquipping(true);
    try {
      await equipItem(selectedItem);
      if (showPreviewModal) {
        setShowPreviewModal(false);
      }
    } catch (error) {
      console.error('Failed to equip item:', error);
      alert('Failed to equip item. Please try again.');
    } finally {
      setIsEquipping(false);
    }
  };

  // 处理取消装备
  const handleUnequip = async () => {
    if (!selectedItem || isEquipping) return;
    
    const itemType = selectedItem.reward_type || selectedItem.type;
    
    setIsEquipping(true);
    try {
      await unequipItem(itemType);
      setSelectedItem(null);
      setPreviewItem(null);
    } catch (error) {
      console.error('Failed to unequip item:', error);
      alert('Failed to unequip item. Please try again.');
    } finally {
      setIsEquipping(false);
    }
  };

  // 渲染筛选栏
  const renderFilters = () => (
    <div className="space-y-4">
      {/* 类型筛选 */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-gray-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Type:</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {typeOptions.map(option => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setTypeFilter(option.value)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  typeFilter === option.value
                    ? 'text-white bg-green-500 shadow-lg'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-white/10'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{option.label}</span>
                {option.count !== undefined && (
                  <span className="text-xs opacity-70">({option.count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 稀有度筛选 */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-gray-400">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Rarity:</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {rarityOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setRarityFilter(option.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                rarityFilter === option.value
                  ? `${option.color} bg-white/20 shadow-lg`
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/10'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // 渲染预览区域
  const renderPreviewContent = () => {
    if (!previewItem) {
      return (
        <div className="h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select an item to preview</p>
          </div>
        </div>
      );
    }

    const isCurrentEquipped = isEquipped(previewItem);
    const itemType = previewItem.reward_type || previewItem.type;

    return (
      <div className="space-y-6">
        {/* 预览区 */}
        <div className="flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl border-2 border-white/10">
          <div className="relative">
            {/* 背景光晕效果 */}
            <div 
              className="absolute inset-0 blur-3xl opacity-30"
              style={{
                background: `radial-gradient(circle, ${
                  previewItem.rarity === 'legendary' ? '#fbbf24' :
                  previewItem.rarity === 'epic' ? '#a855f7' :
                  previewItem.rarity === 'rare' ? '#3b82f6' :
                  previewItem.rarity === 'uncommon' ? '#10b981' : '#6b7280'
                }, transparent 70%)`
              }}
            />
            
            {/* Avatar 预览 */}
            <Avatar
              src={currentUser?.avatar_url || null}
              userName={currentUser?.name || 'User'}
              size="2xl"
              frame={itemType === 'avatar_frame' ? previewItem : null}
              showRarityGlow={true}
              showRarityParticles={true}
              fallback="initials"
              borderless={false}
            />
          </div>
        </div>

        {/* 信息区 */}
        <div className="space-y-4">
          {/* 物品信息 */}
          <div>
            <h3 className="text-white font-bold text-lg mb-1">
              {previewItem.name || previewItem.reward_name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm font-medium ${
                previewItem.rarity === 'legendary' ? 'text-yellow-400' :
                previewItem.rarity === 'epic' ? 'text-purple-400' :
                previewItem.rarity === 'rare' ? 'text-blue-400' :
                previewItem.rarity === 'uncommon' ? 'text-green-400' :
                'text-gray-400'
              }`}>
                {previewItem.rarity?.charAt(0).toUpperCase() + previewItem.rarity?.slice(1)}
              </span>
              {itemType === 'avatar_frame' && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Frame className="w-3 h-3" />
                  Avatar Frame
                </span>
              )}
              {previewItem.metadata?.animated && (
                <span className="flex items-center gap-1 text-xs text-yellow-400">
                  <Sparkles className="w-3 h-3" />
                  Animated
                </span>
              )}
            </div>
            {previewItem.description && (
              <p className="text-gray-400 text-sm">
                {previewItem.description}
              </p>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="space-y-2">
            {isCurrentEquipped ? (
              <>
                <div className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Currently Equipped</span>
                </div>
                <button
                  onClick={handleUnequip}
                  disabled={isEquipping}
                  className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEquipping ? 'Unequipping...' : 'Unequip'}
                </button>
              </>
            ) : (
              <button
                onClick={handleEquip}
                disabled={isEquipping}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5" />
                <span>{isEquipping ? 'Equipping...' : `Equip ${itemType === 'avatar_frame' ? 'Frame' : 'Avatar'}`}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 渲染侧边预览面板（桌面）
  const renderPreviewPanel = () => {
    return (
      <div className="h-full">
        {renderPreviewContent()}
      </div>
    );
  };

  // 渲染预览模态（移动端）
  const renderPreviewModal = () => {
    if (!showPreviewModal || !previewItem) return null;

    return (
      <div className="fixed inset-0 z-50 lg:hidden bg-black/90 backdrop-blur-sm">
        <div className="h-full flex flex-col p-6">
          {/* 关闭按钮 */}
          <button
            onClick={() => setShowPreviewModal(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* 内容 */}
          <div className="flex-1 flex items-center overflow-y-auto">
            <div className="w-full max-w-md mx-auto">
              {renderPreviewContent()}
              
              {/* 关闭按钮（底部） */}
              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-full mt-4 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading items...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Frame className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-medium mb-2">No items yet</p>
          <p className="text-gray-500 text-sm">Purchase avatar frames from the Rewards Shop</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full ${className}`}>
      {/* 筛选栏 */}
      <div className="mb-6">
        {renderFilters()}
      </div>

      {/* 主内容区 */}
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100%-10rem)]">
        {/* 左侧：物品网格 */}
        <div className="lg:w-2/3 overflow-y-auto pr-2">
          {filteredItems.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400">No items match your filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <RewardCard
                  key={item.id || item.reward_id}
                  item={item}
                  mode="compact"
                  owned={true}
                  equipped={isEquipped(item)}
                  onClick={handleCardClick}
                  showRarity={true}
                  showPrice={false}
                  clickable={true}
                  className={selectedItem?.id === item.id || selectedItem?.reward_id === item.reward_id
                    ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-black/50'
                    : ''
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* 右侧：预览面板（桌面） */}
        <div className="hidden lg:block lg:w-1/3">
          <div className="sticky top-0">
            {renderPreviewPanel()}
          </div>
        </div>
      </div>

      {/* 预览模态（移动端） */}
      {renderPreviewModal()}
    </div>
  );
}