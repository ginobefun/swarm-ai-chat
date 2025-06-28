import { PrismaClient } from '@prisma/client'

// 全局声明以避免开发环境中的多个实例
declare global {
    var __prisma: PrismaClient | undefined
}

// 创建 Prisma 客户端实例
export const prisma = global.__prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

// 在开发环境中保持全局实例，避免热重载时创建多个连接
if (process.env.NODE_ENV === 'development') {
    global.__prisma = prisma
}

// 数据库连接测试函数
export async function testDatabaseConnection() {
    try {
        await prisma.$connect()
        console.log('✅ 数据库连接成功')
        return true
    } catch (error) {
        console.error('❌ 数据库连接失败：', error)
        return false
    }
}

// 优雅关闭数据库连接
export async function disconnectDatabase() {
    try {
        await prisma.$disconnect()
        console.log('✅ 数据库连接已断开')
    } catch (error) {
        console.error('❌ 断开数据库连接时出错：', error)
    }
}

// 检查数据库是否准备就绪
export async function isDatabaseReady() {
    try {
        // 简单查询测试连接
        await prisma.$queryRaw`SELECT 1`
        return true
    } catch (error) {
        console.error('数据库未准备就绪：', error)
        return false
    }
}

// 导出 Prisma 客户端作为默认导出
export default prisma 