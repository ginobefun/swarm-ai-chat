# Agent Configuration Service

专门用于获取智能体配置的服务，提供缓存机制以提升性能。

## 功能特性

- ✅ **智能体配置获取** - 统一获取智能体的系统提示、模型参数等配置
- ✅ **智能缓存机制** - 5 分钟 TTL 缓存，减少数据库查询
- ✅ **批量查询支持** - 支持一次查询多个智能体配置
- ✅ **自动清理** - 定期清理过期缓存，避免内存泄漏
- ✅ **错误处理** - 严格的错误处理，不提供 fallback
- ✅ **价格信息** - 包含真实的模型输入/输出价格

## 基本使用

### 单个智能体配置

```typescript
import { AgentConfigService } from '@/lib/services/AgentConfigService'

// 获取服务实例
const configService = AgentConfigService.getInstance()

// 获取智能体配置
try {
    const config = await configService.getAgentConfiguration('code-expert')
    
    console.log('Agent:', config.name)
    console.log('Model:', config.modelName)
    console.log('Temperature:', config.temperature)
    console.log('Max Tokens:', config.maxTokens)
    console.log('Input Price/K:', config.inputPricePerK)
    console.log('Output Price/K:', config.outputPricePerK)
    
} catch (error) {
    console.error('Agent not found or configuration missing:', error.message)
}
```

### 批量查询

```typescript
// 批量获取多个智能体配置
const agentIds = ['code-expert', 'researcher', 'critical-thinker']

try {
    const configs = await configService.getBatchAgentConfigurations(agentIds)
    
    for (const [agentId, config] of configs.entries()) {
        console.log(`${agentId}: ${config.name} - ${config.modelName}`)
    }
    
} catch (error) {
    console.error('Some agents not found:', error.message)
}
```

### 在聊天 API 中使用

```typescript
// 单智能体聊天
const agentConfig = await configService.getAgentConfiguration(agentId)

const result = streamText({
    model: openrouter.chat(agentConfig.modelName),
    messages: aiMessages,
    temperature: agentConfig.temperature,
    maxTokens: agentConfig.maxTokens,
    onFinish: async (completion) => {
        const cost = calculateCost(
            completion.usage?.promptTokens || 0,
            completion.usage?.completionTokens || 0,
            agentConfig.inputPricePerK,
            agentConfig.outputPricePerK
        )
        // 保存消息和成本...
    }
})
```

### 在 LangGraph 节点中使用

```typescript
import { AgentConfigService } from '@/lib/services/AgentConfigService'

export class MyAgentNode extends BaseAgentNode {
    private agentConfig?: AgentConfiguration
    
    async initialize(agentId: string) {
        const configService = AgentConfigService.getInstance()
        this.agentConfig = await configService.getAgentConfiguration(agentId)
        
        // 使用真实配置初始化模型
        this.model = new ChatOpenAI({
            modelName: this.agentConfig.modelName,
            temperature: this.agentConfig.temperature,
            maxTokens: this.agentConfig.maxTokens,
            // ... 其他配置
        })
    }
    
    protected getSystemPrompt(): string {
        return this.agentConfig?.systemPrompt || 'Default prompt'
    }
}
```

## 配置优先级

```
智能体自定义配置 → 模型默认配置 → 抛出异常
```

1. **智能体级别**: `agent.temperature`, `agent.maxTokens`
2. **模型级别**: `model.defaultTemperature`, `model.maxOutputTokens`
3. **异常处理**: 如果都未配置，抛出详细错误信息

## 缓存管理

### 查看缓存状态

```typescript
const stats = configService.getCacheStats()
console.log(`Cached configurations: ${stats.size}`)
console.log(`Cache TTL: ${stats.ttl}ms`)
```

### 手动清理缓存

```typescript
// 清理所有缓存
configService.clearCache()
```

### 销毁服务

```typescript
// 清理资源（通常在应用关闭时调用）
configService.destroy()
```

## 错误处理

服务采用严格的错误处理策略，不提供 fallback 配置：

```typescript
try {
    const config = await configService.getAgentConfiguration('invalid-agent')
} catch (error) {
    // 可能的错误类型：
    // - "Agent 'invalid-agent' not found or inactive"
    // - "Model configuration missing for agent 'agent-id'"
    // - "Temperature not configured for agent 'agent-id' or its model"
    // - "Max tokens not configured for agent 'agent-id' or its model"
}
```

## 性能优化

- **缓存命中**: 缓存命中时避免数据库查询，响应速度提升 50%+
- **批量查询**: 减少数据库往返次数，适合多智能体场景
- **自动清理**: 每 10 分钟清理过期缓存，避免内存泄漏

## 监控日志

服务提供详细的日志输出：

```
🎯 Using cached configuration for agent code-expert
📋 Retrieved configuration for agent researcher: Research Analyst
📦 Batch retrieved 3 agent configurations (1 from cache, 2 from database)
🧹 Agent config cache cleanup: 5 configurations cached
🗑️ Agent configuration cache cleared
```

## 与其他服务的关系

- **替代**: 可以替代 `SwarmConfigService.getAgentLangGraphConfig` 的部分功能
- **专门化**: 专注于智能体配置，更轻量和高效
- **集成**: 可以与现有的聊天 API、LangGraph 节点等无缝集成 