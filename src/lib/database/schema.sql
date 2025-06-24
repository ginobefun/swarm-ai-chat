-- SwarmAI.chat 数据库架构
-- 适用于 PostgreSQL 15+ 和 Neon

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 技能标签表
CREATE TABLE skill_tags (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('core', 'tool', 'domain')),
    color VARCHAR(7) NOT NULL, -- hex color code
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 工具表
CREATE TABLE tools (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10), -- emoji
    description TEXT,
    category VARCHAR(50) NOT NULL,
    api_endpoint TEXT,
    config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI 角色表
CREATE TABLE ai_agents (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(10), -- emoji
    avatar_style TEXT, -- CSS gradient style
    description TEXT NOT NULL,
    specialty VARCHAR(200) NOT NULL,
    personality TEXT,
    model_preference VARCHAR(50) DEFAULT 'gpt-4',
    system_prompt TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    created_by UUID, -- 用户 ID，用于自定义角色
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    embedding VECTOR(1536), -- 用于向量搜索
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 使用示例表
CREATE TABLE usage_examples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(50) NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    prompt TEXT NOT NULL,
    description TEXT,
    expected_output TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI 角色技能关联表（多对多）
CREATE TABLE agent_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(50) NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    skill_id VARCHAR(50) NOT NULL REFERENCES skill_tags(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(agent_id, skill_id)
);

-- AI 角色工具关联表（多对多）
CREATE TABLE agent_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(50) NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    tool_id VARCHAR(50) NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    config_override JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(agent_id, tool_id)
);

-- 用户表（简化版）
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 对话会话表（简化表名）
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group', 'workflow')),
    created_by UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 会话参与者表
CREATE TABLE session_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    participant_type VARCHAR(20) NOT NULL CHECK (participant_type IN ('user', 'agent')),
    participant_id VARCHAR(50) NOT NULL, -- user_id 或 agent_id
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 消息表
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'agent', 'system')),
    sender_id VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),
    metadata JSONB DEFAULT '{}',
    parent_message_id UUID REFERENCES messages(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 角色评价表
CREATE TABLE agent_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(50) NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    session_id UUID REFERENCES sessions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(agent_id, user_id, session_id)
);

-- 创建索引优化查询性能
CREATE INDEX idx_ai_agents_specialty ON ai_agents(specialty);
CREATE INDEX idx_ai_agents_is_active ON ai_agents(is_active);
CREATE INDEX idx_ai_agents_created_by ON ai_agents(created_by);
CREATE INDEX idx_ai_agents_usage_count ON ai_agents(usage_count DESC);
CREATE INDEX idx_ai_agents_rating ON ai_agents(rating DESC);

CREATE INDEX idx_skill_tags_category ON skill_tags(category);
CREATE INDEX idx_tools_category ON tools(category);
CREATE INDEX idx_tools_is_active ON tools(is_active);

CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_type, sender_id);

CREATE INDEX idx_sessions_created_by ON sessions(created_by);
CREATE INDEX idx_sessions_type ON sessions(type);
CREATE INDEX idx_sessions_is_active ON sessions(is_active);

-- 为向量搜索创建索引
CREATE INDEX idx_ai_agents_embedding ON ai_agents USING ivfflat (embedding vector_cosine_ops);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表添加更新时间触发器
CREATE TRIGGER update_ai_agents_updated_at 
    BEFORE UPDATE ON ai_agents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_tags_updated_at 
    BEFORE UPDATE ON skill_tags 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tools_updated_at 
    BEFORE UPDATE ON tools 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at 
    BEFORE UPDATE ON sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 