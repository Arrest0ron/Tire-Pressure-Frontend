// src/config/pagesRuntime.ts
import { ZEROTIER_PHONE_HOST } from './backendHost'

// 🔹 Детект мобильного устройства по User-Agent
function isMobileUserAgent(): boolean {
  return /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

// 🔹 Решаем, использовать ли только mock-данные
// Возвращает true, если:
// 1. Запущено на телефоне в ZeroTier-сети, ИЛИ
// 2. Определён как мобильное устройство по User-Agent
export function shouldUseMockOnly(): boolean {
  if (typeof window === 'undefined') return false  // SSR/Node.js
  if (window.location.hostname === ZEROTIER_PHONE_HOST) return true
  return isMobileUserAgent()
}