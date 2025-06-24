-- SwarmAI.chat 增强版数据库架构
-- 避免未来频繁修改的完整设计

-- 启用扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 用户和权限系统
-- ============================================================================

-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'enterprise')),
    subscription_status VARCHAR(20) DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro', 'enterprise')),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 核心业务表 (VARCHAR 主键)
-- ============================================================================

-- 技能标签表
CREATE TABLE skill_tags (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('core', 'tool', 'domain')),
    color VARCHAR(7) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 工具表 (增强版)
CREATE TABLE tools (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    description TEXT,
    category VARCHAR(50) NOT NULL,
    version VARCHAR(20) DEFAULT '1.0.0',
    api_endpoint TEXT,
    configuration_schema JSONB DEFAULT '{}',
    default_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    requires_auth BOOLEAN DEFAULT false,
    cost_per_use DECIMAL(10,4) DEFAULT 0,
    rate_limit INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI 角色表 (增强版)
CREATE TABLE ai_agents (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(10),
    avatar_style TEXT,
    description TEXT,
    specialty VARCHAR(255),
    personality TEXT,
    model_preference VARCHAR(50) DEFAULT 'gpt-4',
    system_prompt TEXT,
    tags TEXT[], -- 支持标签分类
    capability_level INTEGER DEFAULT 1 CHECK (capability_level >= 1 AND capability_level <= 5),
    average_response_time INTEGER DEFAULT 3000, -- 毫秒
    cost_per_message DECIMAL(10,4) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    version VARCHAR(20) DEFAULT '1.0.0',
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 关联表
-- ============================================================================

-- AI 角色技能关联表
CREATE TABLE agent_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(50) NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    skill_id VARCHAR(50) NOT NULL REFERENCES skill_tags(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    proficiency_level INTEGER DEFAULT 3 CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, skill_id)
);

-- AI 角色工具关联表 (增强版)
CREATE TABLE agent_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(50) NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    tool_id VARCHAR(50) NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    custom_config JSONB DEFAULT '{}', -- 覆盖默认配置
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, tool_id)
);

-- 使用示例表
CREATE TABLE usage_examples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(50) NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 3),
    expected_output TEXT,
    success_rate DECIMAL(3,2) DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 会话和消息系统 (增强版)
-- ============================================================================

-- 会话表 (增强版)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    description TEXT,
    type VARCHAR(20) DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'workflow')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
    created_by UUID NOT NULL REFERENCES users(id),
    primary_agent_id VARCHAR(50) REFERENCES ai_agents(id),
    configuration JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    is_template BOOLEAN DEFAULT false,
    message_count INTEGER DEFAULT 0,
    total_cost DECIMAL(10,4) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 会话参与者表 (支持多人会话)
CREATE TABLE session_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    agent_id VARCHAR(50) REFERENCES ai_agents(id),
    role VARCHAR(20) DEFAULT 'participant' CHECK (role IN ('owner', 'admin', 'participant', 'observer')),
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_participant_type CHECK (
        (user_id IS NOT NULL AND agent_id IS NULL) OR 
        (user_id IS NULL AND agent_id IS NOT NULL)
    )
);

-- 消息表 (增强版)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'agent', 'system')),
    sender_id VARCHAR(50) NOT NULL, -- user.id 或 agent.id
    reply_to_id UUID REFERENCES messages(id),
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'text' CHECK (content_type IN ('text', 'file', 'image', 'code', 'system')),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'delivered', 'read', 'failed')),
    metadata JSONB DEFAULT '{}',
    token_count INTEGER DEFAULT 0,
    processing_time INTEGER DEFAULT 0, -- 毫秒
    confidence_score DECIMAL(3,2),
    cost DECIMAL(10,4) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 反馈和统计系统
-- ============================================================================

-- 消息反馈表
CREATE TABLE message_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_type VARCHAR(20) CHECK (feedback_type IN ('helpful', 'unhelpful', 'inappropriate', 'accurate', 'inaccurate')),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 使用统计表
CREATE TABLE usage_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('agent', 'tool', 'skill')),
    entity_id VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 索引优化
-- ============================================================================

-- 核心业务索引
CREATE INDEX idx_ai_agents_active ON ai_agents(is_active);
CREATE INDEX idx_ai_agents_public ON ai_agents(is_public, is_active);
CREATE INDEX idx_ai_agents_featured ON ai_agents(is_featured, is_active);
CREATE INDEX idx_ai_agents_usage ON ai_agents(usage_count DESC);
CREATE INDEX idx_ai_agents_rating ON ai_agents(rating DESC);
CREATE INDEX idx_skill_tags_category ON skill_tags(category, is_active);
CREATE INDEX idx_tools_category ON tools(category, is_active);

-- 会话和消息索引
CREATE INDEX idx_sessions_user ON sessions(created_by, created_at DESC);
CREATE INDEX idx_sessions_agent ON sessions(primary_agent_id);
CREATE INDEX idx_sessions_status ON sessions(status, updated_at DESC);
CREATE INDEX idx_messages_session ON messages(session_id, created_at);
CREATE INDEX idx_messages_sender ON messages(sender_type, sender_id);
CREATE INDEX idx_messages_reply ON messages(reply_to_id);

-- 关联表索引
CREATE INDEX idx_agent_skills_agent ON agent_skills(agent_id);
CREATE INDEX idx_agent_tools_agent ON agent_tools(agent_id);
CREATE INDEX idx_usage_examples_agent ON usage_examples(agent_id, order_index);
CREATE INDEX idx_session_participants_session ON session_participants(session_id);
CREATE INDEX idx_session_participants_user ON session_participants(user_id);

-- 统计和反馈索引
CREATE INDEX idx_message_feedback_message ON message_feedback(message_id);
CREATE INDEX idx_usage_statistics_entity ON usage_statistics(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_usage_statistics_user ON usage_statistics(user_id, created_at DESC);

-- ============================================================================
-- 性能优化
-- ============================================================================

-- 消息表分区 (按月分区，便于归档)
-- CREATE TABLE messages_y2024m01 PARTITION OF messages FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
-- CREATE TABLE messages_y2024m02 PARTITION OF messages FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- ... 后续可按需添加分区 