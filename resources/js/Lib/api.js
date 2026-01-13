// @/Lib/api.js
import axios from 'axios';

// ✅ 创建配置好的 Axios 实例
export const api = axios.create({
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

/**
 * ✅ 装备物品
 * @param {number} inventoryId - 背包物品 ID
 * @returns {Promise<{success: boolean, message: string, equipped: object}>}
 */
export async function equipItem(inventoryId) {
  try {
    console.log('📤 [API] Equip request:', { inventoryId });
    
    const response = await api.post(`/student/inventory/${inventoryId}/equip`);
    
    console.log('📥 [API] Equip response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Equip error:', error);
    throw error;
  }
}

/**
 * ✅ 卸载物品
 * @param {number} inventoryId - 背包物品 ID
 * @returns {Promise<{success: boolean, message: string, equipped: object}>}
 */
export async function unequipItem(inventoryId) {
  try {
    console.log('📤 [API] Unequip request:', { inventoryId });
    
    const response = await api.post(`/student/inventory/${inventoryId}/unequip`);
    
    console.log('📥 [API] Unequip response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Unequip error:', error);
    throw error;
  }
}

/**
 * ✅ 切换装备状态
 * @param {number} inventoryId - 背包物品 ID
 * @returns {Promise<{success: boolean, message: string, equipped: object}>}
 */
export async function toggleEquip(inventoryId) {
  try {
    console.log('📤 [API] Toggle request:', { inventoryId });
    
    const response = await api.post(`/student/inventory/${inventoryId}/toggle`);
    
    console.log('📥 [API] Toggle response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Toggle error:', error);
    throw error;
  }
}

/**
 * ✅ 获取当前装备状态
 * @returns {Promise<{success: boolean, equipped: object}>}
 */
export async function getEquipped() {
  try {
    console.log('📤 [API] Get equipped request');
    
    const response = await api.get('/student/inventory/equipped');
    
    console.log('📥 [API] Get equipped response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Get equipped error:', error);
    throw error;
  }
}

/**
 * 错误处理辅助函数
 * @param {Error} error - Axios 错误对象
 * @returns {string} 用户友好的错误消息
 */
export function handleApiError(error) {
  if (error.response) {
    // 服务器返回错误响应 (4xx, 5xx)
    const message = error.response.data?.message || 'Server error occurred';
    console.error('❌ [API] Server error:', {
      status: error.response.status,
      message: message,
      data: error.response.data
    });
    return message;
  } else if (error.request) {
    // 请求发送但没有收到响应
    console.error('❌ [API] No response:', error.request);
    return 'No response from server. Please check your connection.';
  } else {
    // 请求配置错误
    console.error('❌ [API] Request error:', error.message);
    return error.message || 'Request failed';
  }
}

/**
 * 检查响应是否成功
 * @param {object} response - API 响应对象
 * @returns {boolean}
 */
export function isSuccessResponse(response) {
  return response && response.success === true;
}

// 导出所有 API 函数（保持向后兼容）
export default {
  api,
  equipItem,
  unequipItem,
  toggleEquip,
  getEquipped,
  handleApiError,
  isSuccessResponse,
};