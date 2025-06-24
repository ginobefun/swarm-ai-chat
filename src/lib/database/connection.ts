import { neon } from '@neondatabase/serverless'

// 获取数据库连接字符串
const getDatabaseUrl = () => {
    const url = process.env.DATABASE_URL
    if (!url) {
        // 在构建时使用默认值，运行时会报错
        return 'postgresql://placeholder:placeholder@placeholder/placeholder'
    }
    return url
}

// 创建数据库连接
export const sql = neon(getDatabaseUrl())

// 检查是否正确配置了数据库
export const isDatabaseConfigured = () => {
    const url = process.env.DATABASE_URL
    return url && !url.includes('placeholder')
}

// 数据库连接测试函数
export async function testConnection() {
    try {
        const result = await sql`SELECT 1 as test`
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
        const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      )
    `
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
        await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

        // 启用向量扩展（如果需要）
        // await sql`CREATE EXTENSION IF NOT EXISTS vector`

        console.log('Database extensions enabled')
        return true
    } catch (error) {
        console.error('Error initializing database:', error)
        return false
    }
} 