/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client'
import type {
    SwarmModelProvider,
    SwarmModelCapability,
    SwarmModelTier,
    SwarmAgentCategory,
    SwarmTaskType,
    SwarmCommunicationStyle,
    SwarmVerbosity,
    SwarmApproach,
    SwarmDifficulty
} from '@prisma/client'

const prisma = new PrismaClient()

// AI Models seed data
const AI_MODELS = [
    // GPT Models - Latest OpenAI Models
    {
        id: 'gpt-4.1',
        provider: 'OPENROUTER' as SwarmModelProvider,
        modelName: 'openai/gpt-4.1',
        displayName: 'GPT-4.1',
        description: 'Flagship large language model optimized for advanced instruction following, real-world software engineering, and long-context reasoning',
        family: 'GPT',
        version: '4.1',
        baseUrl: 'https://openrouter.ai/api/v1',
        defaultTemperature: 0.7,
        capabilities: ['TEXT_GENERATION', 'REASONING', 'ANALYSIS', 'CODE_GENERATION', 'FUNCTION_CALLING', 'LONG_CONTEXT'] as SwarmModelCapability[],
        contextWindow: 1047576,
        maxOutputTokens: 8192,
        inputPricePerK: 0.002,
        outputPricePerK: 0.008,
        requestsPerMinute: 10000,
        tokensPerMinute: 2000000,
        intelligenceScore: 98,
        tier: 'PREMIUM' as SwarmModelTier,
        releaseDate: new Date('2025-04-14'),
    },
    {
        id: 'gpt-4.1-mini',
        provider: 'OPENROUTER' as SwarmModelProvider,
        modelName: 'openai/gpt-4.1-mini',
        displayName: 'GPT-4.1 Mini',
        description: 'Mid-sized model delivering performance competitive with GPT-4o at substantially lower latency and cost',
        family: 'GPT',
        version: '4.1',
        baseUrl: 'https://openrouter.ai/api/v1',
        defaultTemperature: 0.7,
        capabilities: ['TEXT_GENERATION', 'REASONING', 'ANALYSIS', 'CODE_GENERATION', 'VISION', 'LONG_CONTEXT'] as SwarmModelCapability[],
        contextWindow: 1047576,
        maxOutputTokens: 8192,
        inputPricePerK: 0.0004,
        outputPricePerK: 0.0016,
        requestsPerMinute: 15000,
        tokensPerMinute: 2500000,
        intelligenceScore: 93,
        tier: 'PREMIUM' as SwarmModelTier,
        releaseDate: new Date('2025-04-14'),
    },
    {
        id: 'gpt-4o',
        provider: 'OPENROUTER' as SwarmModelProvider,
        modelName: 'openai/gpt-4o',
        displayName: 'GPT-4o',
        description: 'OpenAI\'s omni model supporting both text and image inputs with enhanced multimodal capabilities',
        family: 'GPT',
        version: '4.0',
        baseUrl: 'https://openrouter.ai/api/v1',
        defaultTemperature: 0.7,
        capabilities: ['TEXT_GENERATION', 'REASONING', 'ANALYSIS', 'CODE_GENERATION', 'FUNCTION_CALLING', 'VISION'] as SwarmModelCapability[],
        contextWindow: 128000,
        maxOutputTokens: 4096,
        inputPricePerK: 0.0025,
        outputPricePerK: 0.01,
        requestsPerMinute: 10000,
        tokensPerMinute: 2000000,
        intelligenceScore: 95,
        tier: 'PREMIUM' as SwarmModelTier,
        releaseDate: new Date('2024-05-13'),
    },

    // Claude 4 Models - Latest Anthropic Models
    {
        id: 'claude-opus-4',
        provider: 'OPENROUTER' as SwarmModelProvider,
        modelName: 'anthropic/claude-opus-4',
        displayName: 'Claude Opus 4',
        description: 'World\'s best coding model with sustained performance on complex, long-running tasks and agent workflows',
        family: 'Claude',
        version: '4.0',
        baseUrl: 'https://openrouter.ai/api/v1',
        defaultTemperature: 0.7,
        capabilities: ['TEXT_GENERATION', 'REASONING', 'ANALYSIS', 'CODE_GENERATION', 'CREATIVE_WRITING', 'LONG_CONTEXT'] as SwarmModelCapability[],
        contextWindow: 200000,
        maxOutputTokens: 8192,
        inputPricePerK: 0.015,
        outputPricePerK: 0.075,
        requestsPerMinute: 4000,
        tokensPerMinute: 400000,
        intelligenceScore: 99,
        tier: 'PREMIUM' as SwarmModelTier,
        releaseDate: new Date('2025-05-22'),
    },
    {
        id: 'claude-sonnet-4',
        provider: 'OPENROUTER' as SwarmModelProvider,
        modelName: 'anthropic/claude-sonnet-4',
        displayName: 'Claude Sonnet 4',
        description: 'Enhanced coding and reasoning capabilities with improved precision and controllability, optimized for practical everyday use',
        family: 'Claude',
        version: '4.0',
        baseUrl: 'https://openrouter.ai/api/v1',
        defaultTemperature: 0.7,
        capabilities: ['TEXT_GENERATION', 'REASONING', 'ANALYSIS', 'CODE_GENERATION', 'CREATIVE_WRITING', 'LONG_CONTEXT'] as SwarmModelCapability[],
        contextWindow: 200000,
        maxOutputTokens: 8192,
        inputPricePerK: 0.003,
        outputPricePerK: 0.015,
        requestsPerMinute: 4000,
        tokensPerMinute: 400000,
        intelligenceScore: 97,
        tier: 'PREMIUM' as SwarmModelTier,
        releaseDate: new Date('2025-05-22'),
    },

    // Gemini 2.5 Models - Latest Google Models
    {
        id: 'gemini-2.5-pro',
        provider: 'OPENROUTER' as SwarmModelProvider,
        modelName: 'google/gemini-2.5-pro',
        displayName: 'Gemini 2.5 Pro',
        description: 'Google\'s state-of-the-art AI model with thinking capabilities, achieving first-place on LMArena leaderboard',
        family: 'Gemini',
        version: '2.5',
        baseUrl: 'https://openrouter.ai/api/v1',
        defaultTemperature: 0.7,
        capabilities: ['TEXT_GENERATION', 'REASONING', 'ANALYSIS', 'CODE_GENERATION', 'VISION', 'LONG_CONTEXT'] as SwarmModelCapability[],
        contextWindow: 1048576,
        maxOutputTokens: 8192,
        inputPricePerK: 0.00125,
        outputPricePerK: 0.01,
        requestsPerMinute: 2000,
        tokensPerMinute: 32000,
        intelligenceScore: 96,
        tier: 'PREMIUM' as SwarmModelTier,
        releaseDate: new Date('2025-06-17'),
    },
    {
        id: 'gemini-2.5-flash',
        provider: 'OPENROUTER' as SwarmModelProvider,
        modelName: 'google/gemini-2.5-flash',
        displayName: 'Gemini 2.5 Flash',
        description: 'Google\'s workhorse model with built-in thinking capabilities for advanced reasoning and scientific tasks',
        family: 'Gemini',
        version: '2.5',
        baseUrl: 'https://openrouter.ai/api/v1',
        defaultTemperature: 0.7,
        capabilities: ['TEXT_GENERATION', 'REASONING', 'ANALYSIS', 'CODE_GENERATION', 'VISION', 'LONG_CONTEXT'] as SwarmModelCapability[],
        contextWindow: 1048576,
        maxOutputTokens: 8192,
        inputPricePerK: 0.0003,
        outputPricePerK: 0.0025,
        requestsPerMinute: 4000,
        tokensPerMinute: 64000,
        intelligenceScore: 93,
        tier: 'PREMIUM' as SwarmModelTier,
        releaseDate: new Date('2025-06-17'),
    },
    {
        id: 'gemini-2.5-flash-preview',
        provider: 'OPENROUTER' as SwarmModelProvider,
        modelName: 'google/gemini-2.5-flash-preview-05-20',
        displayName: 'Gemini 2.5 Flash Preview',
        description: 'Preview version of Gemini 2.5 Flash with enhanced thinking capabilities for advanced reasoning tasks',
        family: 'Gemini',
        version: '2.5',
        baseUrl: 'https://openrouter.ai/api/v1',
        defaultTemperature: 0.7,
        capabilities: ['TEXT_GENERATION', 'REASONING', 'ANALYSIS', 'CODE_GENERATION', 'VISION', 'LONG_CONTEXT'] as SwarmModelCapability[],
        contextWindow: 1048576,
        maxOutputTokens: 8192,
        inputPricePerK: 0.00015,
        outputPricePerK: 0.0006,
        requestsPerMinute: 4000,
        tokensPerMinute: 64000,
        intelligenceScore: 92,
        tier: 'PREMIUM' as SwarmModelTier,
        releaseDate: new Date('2025-05-20'),
    },
    {
        id: 'gemini-2.5-flash-lite',
        provider: 'OPENROUTER' as SwarmModelProvider,
        modelName: 'google/gemini-2.5-flash-lite-preview-06-17',
        displayName: 'Gemini 2.5 Flash Lite',
        description: 'Lightweight reasoning model optimized for ultra-low latency and cost efficiency',
        family: 'Gemini',
        version: '2.5',
        baseUrl: 'https://openrouter.ai/api/v1',
        defaultTemperature: 0.7,
        capabilities: ['TEXT_GENERATION', 'REASONING', 'ANALYSIS', 'CODE_GENERATION', 'LONG_CONTEXT'] as SwarmModelCapability[],
        contextWindow: 1048576,
        maxOutputTokens: 8192,
        inputPricePerK: 0.0001,
        outputPricePerK: 0.0004,
        requestsPerMinute: 6000,
        tokensPerMinute: 96000,
        intelligenceScore: 88,
        tier: 'STANDARD' as SwarmModelTier,
        releaseDate: new Date('2025-06-17'),
    },


]

// AI Agents seed data
const AI_AGENTS = [
    {
        id: 'general-assistant',
        name: 'General Assistant',
        description: 'A versatile AI assistant for general tasks and conversations',
        longDescription: 'An intelligent and helpful assistant capable of handling a wide variety of tasks including answering questions, providing explanations, helping with analysis, and engaging in meaningful conversations.',
        category: 'GENERAL' as SwarmAgentCategory,
        modelId: 'gemini-2.5-flash-preview',
        systemPrompt: 'You are a helpful, harmless, and honest AI assistant. You aim to be helpful and provide accurate, well-reasoned responses to user queries. You should be conversational but professional, and always strive to understand what the user is really asking for.',
        icon: '🤖',
        color: '#3B82F6',
        taskTypes: ['RESEARCH', 'ANALYZE', 'SUMMARIZE', 'CREATE'] as SwarmTaskType[],
        specializations: ['General Knowledge', 'Problem Solving', 'Communication'],
        communicationStyle: 'FRIENDLY' as SwarmCommunicationStyle,
        verbosity: 'BALANCED' as SwarmVerbosity,
        approach: 'PRACTICAL' as SwarmApproach,
        traits: ['Helpful', 'Patient', 'Thorough'],
        difficulty: 'BEGINNER' as SwarmDifficulty,
        tags: ['general', 'assistant', 'versatile'],
    },
    {
        id: 'code-expert',
        name: 'Code Expert',
        description: 'Specialized coding assistant for software development',
        longDescription: 'An expert-level coding assistant with deep knowledge of programming languages, software architecture, debugging, and best practices. Ideal for code review, optimization, and complex development tasks.',
        category: 'CODING' as SwarmAgentCategory,
        modelId: 'claude-sonnet-4',
        systemPrompt: 'You are an expert software engineer and coding assistant. You have deep knowledge of multiple programming languages, software architecture, design patterns, and best practices. You help users write clean, efficient, and maintainable code. Always consider security, performance, and scalability in your suggestions.',
        icon: '👨‍💻',
        color: '#10B981',
        taskTypes: ['DEVELOP', 'REVIEW', 'OPTIMIZE', 'ANALYZE'] as SwarmTaskType[],
        specializations: ['Full-stack Development', 'Code Review', 'Architecture Design', 'Debugging'],
        communicationStyle: 'PROFESSIONAL' as SwarmCommunicationStyle,
        verbosity: 'DETAILED' as SwarmVerbosity,
        approach: 'METHODICAL' as SwarmApproach,
        traits: ['Precise', 'Analytical', 'Security-focused'],
        difficulty: 'ADVANCED' as SwarmDifficulty,
        functionCalling: true,
        temperature: 0.3,
        tags: ['coding', 'development', 'expert'],
    },
    {
        id: 'researcher',
        name: 'Research Analyst',
        description: 'Advanced research and data analysis specialist',
        longDescription: 'A thorough research analyst capable of conducting comprehensive research, analyzing complex information, synthesizing findings from multiple sources, and presenting clear, evidence-based conclusions.',
        category: 'RESEARCH' as SwarmAgentCategory,
        modelId: 'claude-sonnet-4',
        systemPrompt: 'You are a meticulous research analyst with expertise in information gathering, data analysis, and synthesis. You approach problems systematically, consider multiple perspectives, and provide well-sourced, objective analysis. You excel at breaking down complex topics and presenting findings clearly.',
        icon: '🔍',
        color: '#8B5CF6',
        taskTypes: ['RESEARCH', 'ANALYZE', 'SUMMARIZE'] as SwarmTaskType[],
        specializations: ['Data Analysis', 'Literature Review', 'Market Research', 'Academic Research'],
        communicationStyle: 'ACADEMIC' as SwarmCommunicationStyle,
        verbosity: 'COMPREHENSIVE' as SwarmVerbosity,
        approach: 'ANALYTICAL' as SwarmApproach,
        traits: ['Thorough', 'Objective', 'Detail-oriented'],
        difficulty: 'INTERMEDIATE' as SwarmDifficulty,
        tags: ['research', 'analysis', 'data'],
    },
    {
        id: 'creative-writer',
        name: 'Creative Writer',
        description: 'Imaginative content creator and storyteller',
        longDescription: 'A creative writing specialist with expertise in storytelling, content creation, copywriting, and various writing styles. Perfect for generating engaging content, stories, marketing copy, and creative projects.',
        category: 'CREATIVE' as SwarmAgentCategory,
        modelId: 'gpt-4.1',
        systemPrompt: 'You are a talented creative writer with a gift for storytelling and content creation. You can adapt your writing style to match different tones, audiences, and purposes. You excel at creating engaging, original content while maintaining clarity and impact.',
        icon: '✍️',
        color: '#F59E0B',
        taskTypes: ['CREATE', 'REVIEW'] as SwarmTaskType[],
        specializations: ['Storytelling', 'Copywriting', 'Content Strategy', 'Creative Fiction'],
        communicationStyle: 'CREATIVE' as SwarmCommunicationStyle,
        verbosity: 'DETAILED' as SwarmVerbosity,
        approach: 'CREATIVE' as SwarmApproach,
        traits: ['Imaginative', 'Engaging', 'Versatile'],
        difficulty: 'INTERMEDIATE' as SwarmDifficulty,
        temperature: 0.8,
        tags: ['writing', 'creative', 'content'],
    },
    {
        id: 'data-scientist',
        name: 'Data Scientist',
        description: 'Statistical analysis and machine learning expert',
        longDescription: 'An expert data scientist specializing in statistical analysis, machine learning, data visualization, and predictive modeling. Ideal for complex data analysis, model development, and insights generation.',
        category: 'ANALYSIS' as SwarmAgentCategory,
        modelId: 'claude-sonnet-4',
        systemPrompt: 'You are an expert data scientist with deep knowledge of statistics, machine learning, data analysis, and visualization. You approach problems with scientific rigor, consider data quality and limitations, and provide actionable insights based on thorough analysis.',
        icon: '📊',
        color: '#EF4444',
        taskTypes: ['ANALYZE', 'DEVELOP', 'OPTIMIZE'] as SwarmTaskType[],
        specializations: ['Machine Learning', 'Statistical Analysis', 'Data Visualization', 'Predictive Modeling'],
        communicationStyle: 'PROFESSIONAL' as SwarmCommunicationStyle,
        verbosity: 'DETAILED' as SwarmVerbosity,
        approach: 'ANALYTICAL' as SwarmApproach,
        traits: ['Rigorous', 'Data-driven', 'Innovative'],
        difficulty: 'EXPERT' as SwarmDifficulty,
        functionCalling: true,
        temperature: 0.4,
        tags: ['data', 'analysis', 'ml'],
    },
    {
        id: 'education-tutor',
        name: 'Education Tutor',
        description: 'Patient teacher and learning facilitator',
        longDescription: 'A dedicated educational tutor skilled in explaining complex concepts, adapting to different learning styles, and providing personalized guidance across various subjects and skill levels.',
        category: 'EDUCATION' as SwarmAgentCategory,
        modelId: 'gpt-4.1',
        systemPrompt: 'You are a patient and knowledgeable tutor who excels at teaching and explaining complex concepts in simple, understandable terms. You adapt your teaching style to the student\'s level and learning preferences, provide encouraging feedback, and help build confidence.',
        icon: '👨‍🏫',
        color: '#06B6D4',
        taskTypes: ['CREATE', 'REVIEW', 'ANALYZE'] as SwarmTaskType[],
        specializations: ['Curriculum Design', 'Learning Assessment', 'Skill Development', 'Knowledge Transfer'],
        communicationStyle: 'FRIENDLY' as SwarmCommunicationStyle,
        verbosity: 'BALANCED' as SwarmVerbosity,
        approach: 'METHODICAL' as SwarmApproach,
        traits: ['Patient', 'Encouraging', 'Adaptive'],
        difficulty: 'BEGINNER' as SwarmDifficulty,
        tags: ['education', 'teaching', 'learning'],
    },
    {
        id: 'critical-thinker',
        name: 'Critical Thinker',
        description: 'Logical reasoning and problem-solving specialist',
        longDescription: 'An analytical thinker specializing in logical reasoning, problem decomposition, critical analysis, and structured decision-making. Excellent for complex problem-solving and strategic thinking.',
        category: 'ANALYSIS' as SwarmAgentCategory,
        modelId: 'gpt-4.1',
        systemPrompt: 'You are a critical thinker who excels at logical reasoning, problem analysis, and structured thinking. You break down complex problems systematically, consider multiple perspectives, identify assumptions and biases, and provide well-reasoned conclusions.',
        icon: '🧠',
        color: '#7C3AED',
        taskTypes: ['ANALYZE', 'REVIEW', 'RESEARCH'] as SwarmTaskType[],
        specializations: ['Problem Solving', 'Decision Analysis', 'Risk Assessment', 'Strategic Planning'],
        communicationStyle: 'PROFESSIONAL' as SwarmCommunicationStyle,
        verbosity: 'DETAILED' as SwarmVerbosity,
        approach: 'METHODICAL' as SwarmApproach,
        traits: ['Logical', 'Systematic', 'Objective'],
        difficulty: 'ADVANCED' as SwarmDifficulty,
        temperature: 0.3,
        tags: ['thinking', 'analysis', 'logic'],
    },
]

async function main() {
    console.log('🚀 Starting database migration...')

    try {
        // Clean existing data (development only)
        if (process.env.NODE_ENV === 'development') {
            console.log('🧹 Cleaning existing AI data...')
            await prisma.swarmAIAgent.deleteMany()
            await prisma.swarmAIModel.deleteMany()
        }

        // Seed AI Models with upsert for safety
        console.log('📚 Seeding AI Models...')
        for (const modelData of AI_MODELS) {
            const { capabilities, ...modelWithoutCapabilities } = modelData
            await prisma.swarmAIModel.upsert({
                where: { id: modelData.id },
                update: {
                    ...modelWithoutCapabilities,
                    capabilities: capabilities as any[],
                },
                create: {
                    ...modelWithoutCapabilities,
                    capabilities: capabilities as any[],
                }
            })
            console.log(`✅ Created/Updated model: ${modelData.displayName}`)
        }

        // Seed AI Agents with upsert for safety
        console.log('🤖 Seeding AI Agents...')
        for (const agentData of AI_AGENTS) {
            const { taskTypes, ...agentWithoutTaskTypes } = agentData
            await prisma.swarmAIAgent.upsert({
                where: { id: agentData.id },
                update: {
                    ...agentWithoutTaskTypes,
                    taskTypes: taskTypes as any[],
                },
                create: {
                    ...agentWithoutTaskTypes,
                    taskTypes: taskTypes as any[],
                }
            })
            console.log(`✅ Created/Updated agent: ${agentData.name}`)
        }

        console.log('🎉 Database migration completed successfully!')
    } catch (error) {
        console.error('❌ Error during migration:', error)
        throw error
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    }) 