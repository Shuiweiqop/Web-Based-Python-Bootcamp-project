import React, { useState, useMemo, useEffect } from 'react';
import { X, Check, Eye, Sparkles, Filter } from 'lucide-react';
import RewardCard from './RewardCard';
import BackgroundContainer from './BackgroundContainer';
import { useEquip } from '@/Contexts/EquipContext';

/**
 * BackgroundSelector - 背景选择器
 * 
 * 功能:
 * 1. 侧边栏预览 + 模态窗口预览（响应式）
 * 2. 稀有度筛选（简化版）
 * 3. 实时预览（使用 BackgroundContainer）
 * 4. 预览确认模式
 * 5. 内部 fetch 数据
 * 6. 完整响应式支持
 */
export default function BackgroundSelector({ 
  items = [],
  loading = false,
  onClose = null,
  className = ''
}) {
  const { equipped, equipItem, unequipItem } = useEquip();
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [rarityFilter, setRarityFilter] = useState('all');
  const [isEquipping, setIsEquipping] = useState(false);
  useEffect(() => {
    console.log('🎨 BackgroundSelector Debug:', {
      equipped,
      currentBackground: equipped?.background,
      items: items.length,
      firstItem: items[0]
    });
  }, [equipped, items]);
  // 当前装备的背景
  const currentEquipped = equipped?.background;

  // 初始化：选中当前装备的背景
  useEffect(() => {
    if (currentEquipped && items.length > 0) {
      const current = items.find(item => 
        item.id === currentEquipped.id || 
        item.reward_id === currentEquipped.id
      );
      if (current) {
        console.log('✅ Found current equipped:', current);
        setSelectedItem(current);
        setPreviewItem(current);
      }
    } else if (items.length > 0 && !selectedItem) {
      // 如果没有装备，默认选中第一个
      setSelectedItem(items[0]);
      setPreviewItem(items[0]);
    }
  }, [currentEquipped, items, selectedItem]);

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
    
    if (rarityFilter !== 'all') {
      result = result.filter(item => item.rarity === rarityFilter);
    }
    
    return result;
  }, [items, rarityFilter]);

  // 检查是否已装备
  const isEquipped = (item) => {
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
            const itemToEquip = {
        reward: selectedItem.reward || {
          reward_id: selectedItem.reward_id || selectedItem.id,
          reward_name: selectedItem.name || selectedItem.reward_name,
          reward_type: 'profile_background',
          image_url: selectedItem.image_url,
          rarity: selectedItem.rarity,
          metadata: selectedItem.metadata
        }
      };
      await equipItem(itemToEquip);
      console.log('✅ Equipped successfully');
      // 装备成功后关闭模态（移动端）
      if (showPreviewModal) {
        setShowPreviewModal(false);
      }
    } catch (error) {
      console.error('Failed to equip background:', error);
      alert('Failed to equip background. Please try again.');
    } finally {
      setIsEquipping(false);
    }
  };

  // 处理取消装备
  const handleUnequip = async () => {
    if (isEquipping || !selectedItem) return;
    console.log('🔓 Unequipping:', selectedItem);
    setIsEquipping(true);
    try {
      await unequipItem('profile_background');
      setSelectedItem(null);
      setPreviewItem(null);
    } catch (error) {
      console.error('Failed to unequip background:', error);
      alert('Failed to unequip background. Please try again.');
    } finally {
      setIsEquipping(false);
    }
  };

  // 渲染筛选栏
  const renderFilters = () => (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2 text-gray-400">
        <Filter className="w-4 h-4" />
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
  );
const getPreviewBackground = (item) => {
    if (!item) return null;
    
    return {
      id: item.reward?.reward_id || item.id || item.reward_id,
      name: item.reward?.reward_name || item.name || item.reward_name,
      image_url: item.reward?.image_url || item.image_url,
      reward_type: 'profile_background',
      rarity: item.reward?.rarity || item.rarity,
      metadata: item.reward?.metadata || item.metadata || {}
    };
  };
  // 渲染侧边预览面板（桌面）
  const renderPreviewPanel = () => {
    if (!previewItem) {
      return (
        <div className="h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a background to preview</p>
          </div>
        </div>
      );
    }

    const isCurrentEquipped = isEquipped(previewItem);
    const previewBg = getPreviewBackground(previewItem);
    const itemName = previewItem.reward?.reward_name || previewItem.name || previewItem.reward_name;
    const itemRarity = previewItem.reward?.rarity || previewItem.rarity;
    const itemMetadata = previewItem.reward?.metadata || previewItem.metadata || {};
    const itemDescription = previewItem.reward?.description || previewItem.description;


     return (
      <div className="h-full flex flex-col">
        {/* 实时预览区 */}
        <div className="flex-1 relative rounded-xl overflow-hidden border-2 border-white/10 min-h-[300px]">
          <BackgroundContainer equippedBackground={previewBg}>
            {/* 模拟内容 */}
            <div className="h-full flex items-center justify-center p-8">
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-md">
                <h3 className="text-white text-2xl font-bold mb-2">Preview</h3>
                <p className="text-gray-300 text-sm mb-4">
                  This is how your background will look
                </p>
                <div className="flex items-center space-x-2 text-gray-400 text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>Live Preview Mode</span>
                </div>
              </div>
            </div>
          </BackgroundContainer>
        </div>

        {/* 信息和操作区 */}
        <div className="mt-4 space-y-4">
          {/* 物品信息 */}
          <div>
            <h3 className="text-white font-bold text-lg mb-1">
              {itemName}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm font-medium ${
                itemRarity === 'legendary' ? 'text-yellow-400' :
                itemRarity === 'epic' ? 'text-purple-400' :
                itemRarity === 'rare' ? 'text-blue-400' :
                itemRarity === 'uncommon' ? 'text-green-400' :
                'text-gray-400'
              }`}>
                {itemRarity?.charAt(0).toUpperCase() + itemRarity?.slice(1)}
              </span>
              {itemMetadata?.animated && (
                <span className="flex items-center gap-1 text-xs text-yellow-400">
                  <Sparkles className="w-3 h-3" />
                  Animated
                </span>
              )}
            </div>
            {itemDescription && (
              <p className="text-gray-400 text-sm">
                {itemDescription}
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
                <span>{isEquipping ? 'Equipping...' : 'Equip Background'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 渲染预览模态（移动端）
  const renderPreviewModal = () => {
    if (!showPreviewModal || !previewItem) return null;

    const isCurrentEquipped = isEquipped(previewItem);

    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        {/* 背景遮罩 */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowPreviewModal(false)}
        />
        
        {/* 模态内容 */}
        <div className="relative h-full flex flex-col">
          {/* 实时预览区 */}
          <div className="flex-1 relative">
            <BackgroundContainer equippedBackground={previewItem}>
              <div className="h-full flex items-end p-6">
                <div className="w-full bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <h3 className="text-white text-xl font-bold mb-2">
                    {previewItem.name || previewItem.reward_name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-sm font-medium ${
                      previewItem.rarity === 'legendary' ? 'text-yellow-400' :
                      previewItem.rarity === 'epic' ? 'text-purple-400' :
                      previewItem.rarity === 'rare' ? 'text-blue-400' :
                      previewItem.rarity === 'uncommon' ? 'text-green-400' :
                      'text-gray-400'
                    }`}>
                      {previewItem.rarity?.charAt(0).toUpperCase() + previewItem.rarity?.slice(1)}
                    </span>
                    {previewItem.metadata?.animated && (
                      <span className="flex items-center gap-1 text-xs text-yellow-400">
                        <Sparkles className="w-3 h-3" />
                        Animated
                      </span>
                    )}
                  </div>
                  {previewItem.description && (
                    <p className="text-gray-300 text-sm mb-4">
                      {previewItem.description}
                    </p>
                  )}

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
                          className="w-full px-4 py-3 bg-red-500/20 text-red-400 rounded-lg font-medium disabled:opacity-50"
                        >
                          {isEquipping ? 'Unequipping...' : 'Unequip'}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleEquip}
                        disabled={isEquipping}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium shadow-lg disabled:opacity-50"
                      >
                        <Sparkles className="w-5 h-5" />
                        <span>{isEquipping ? 'Equipping...' : 'Equip Background'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => setShowPreviewModal(false)}
                      className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              </div>
            </BackgroundContainer>
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={() => setShowPreviewModal(false)}
            className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading backgrounds...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-medium mb-2">No backgrounds yet</p>
          <p className="text-gray-500 text-sm">Purchase backgrounds from the Rewards Shop</p>
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
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100%-5rem)]">
        {/* 左侧：物品网格 */}
        <div className="lg:w-2/3 overflow-y-auto pr-2">
          {filteredItems.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400">No backgrounds match your filter</p>
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