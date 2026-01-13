import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

/**
 * cn() 是一个结合 clsx 和 tailwind-merge 的实用函数。
 * - clsx 负责根据条件拼接 className。
 * - twMerge 负责处理 Tailwind 样式冲突（例如重复的 p-2 / p-4）。
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
