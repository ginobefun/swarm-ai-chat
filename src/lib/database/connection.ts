import { prisma } from './prisma'

// 创建与 Neon 兼容的 SQL 模板字符串函数
export const sql = (strings: TemplateStringsArray, ...values: unknown[]) => {
    // 构建 SQL 查询
    let query = ''
    for (let i = 0; i < strings.length; i++) {
        query += strings[i]
        if (i < values.length) {
            // 对于 Prisma，我们需要使用 $queryRaw 并正确处理参数
            query += `$${i + 1}`
        }
    }

    // 返回 Prisma 查询结果
    return prisma.$queryRawUnsafe(query, ...values)
}

// 检查是否正确配置了数据库
export const isDatabaseConfigured = () => {
    const url = process.env.DATABASE_URL
    return url && !url.includes('placeholder')
}

// 数据库连接测试函数
export async function testConnection() {
    try {
        const result = await prisma.$queryRaw`SELECT 1 as test`
        console.log('Database connection successful:', result)
        return true
    } catch (error) {
        console.error('Database connection failed:', error)
        return false
    }
}

// 检查表是否存在
export async function checkTableExists(tableName: string) {
    try {
        const result = await prisma.$queryRaw`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = ${tableName}
            )
        ` as Array<{ exists: boolean }>
        return result[0]?.exists || false
    } catch (error) {
        console.error(`Error checking table ${tableName}:`, error)
        return false
    }
}

// 初始化数据库（创建表格）
export async function initializeDatabase() {
    try {
        console.log('Initializing database...')

        // 启用 UUID 扩展
        await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

        // 启用向量扩展（如果需要）
        // await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector`

        console.log('Database extensions enabled')
        return true
    } catch (error) {
        console.error('Error initializing database:', error)
        return false
    }
} 