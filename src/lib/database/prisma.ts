import { PrismaClient } from '@prisma/client'

// 全局声明以避免开发环境中的多个实例
declare global {
    var __prisma: PrismaClient | undefined
}

// 创建 Prisma 客户端实例
export const prisma = global.__prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
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

// 清理所有数据（仅用于开发/测试）
export async function clearAllData() {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('无法在生产环境中清理数据')
    }

    try {
        // 按依赖关系顺序删除数据
        await prisma.messageFeedback.deleteMany()
        await prisma.usageStatistic.deleteMany()
        await prisma.message.deleteMany()
        await prisma.sessionParticipant.deleteMany()
        await prisma.session.deleteMany()
        await prisma.usageExample.deleteMany()
        await prisma.agentTool.deleteMany()
        await prisma.agentSkill.deleteMany()
        await prisma.aIAgent.deleteMany()
        await prisma.tool.deleteMany()
        await prisma.skillTag.deleteMany()
        await prisma.user.deleteMany()

        console.log('✅ 所有数据已清理')
    } catch (error) {
        console.error('❌ 清理数据时出错：', error)
        throw error
    }
}

// 导出 Prisma 客户端作为默认导出
export default prisma 