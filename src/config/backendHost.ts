// src/config/backendHost.ts

// 🔹 Твой ZeroTier IP (ноутбук с бэкендом)
export const ZEROTIER_PC_HOST = '10.112.25.129'  // ✅ ТВОЙ АДРЕС

// 🔹 Телефон (опционально, для тестов)
export const ZEROTIER_PHONE_HOST = '10.112.25.104'  // ← замени на IP телефона, если нужно

// 🔹 Алиасы
export const ZEROTIER_HOST = ZEROTIER_PC_HOST
export const BACKEND_HOST = ZEROTIER_PC_HOST
export const LOCAL_BACKEND_HOST = '127.0.0.1'

// 🔹 Порты
export const API_PORT = 8080
export const MINIO_PORT = 9090  // удали, если не используешь

// 🔹 Полные origin-адреса
export const API_ORIGIN_PC = `http://${ZEROTIER_PC_HOST}:${API_PORT}`  // http://10.112.25.52:8080
export const API_ORIGIN_LOCAL = `http://${LOCAL_BACKEND_HOST}:${API_PORT}`
export const MINIO_ORIGIN_PC = `http://${ZEROTIER_PC_HOST}:${MINIO_PORT}`  // опционально