/**
 * OpenRouter Models Configuration
 * 
 * Centralized configuration for all OpenRouter models
 * Used to initialize the model registry with actual model data
 */

import type { SwarmAIModel, ModelCapability } from '@/lib/models/SwarmAIModel'

// OpenRouter base configuration
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

/**
 * OpenRouter model definitions
 * Based on actual OpenRouter model catalog with current pricing
 */
export const openRouterModels: SwarmAIModel[] = [
    // === Premium Models ===
    {
        id: 'openrouter-gpt-4o',
        provider: 'openrouter',
        modelName: 'openai/gpt-4o',
        showName: 'GPT-4o',
        description: 'OpenAI\'s most advanced multimodal model',
        baseUrl: OPENROUTER_BASE_URL,
        temperature: 0.7,
        capabilities: [
            'text-generation',
            'code-generation',
            'reasoning',
            'analysis',
            'creative-writing',
            'multilingual',
            'function-calling',
            'vision'
        ],
        pricing: {
            input: 0.005,  // $5 per 1M tokens
            output: 0.015, // $15 per 1M tokens
            currency: 'USD'
        },
        limits: {
            contextWindow: 128000,
            maxOutputTokens: 4096,
            rpm: 500,
            tpm: 30000
        },
        isActive: true,
        tier: 'premium',
        metadata: {
            family: 'GPT',
            version: '4o',
            releaseDate: '2024-05-13',
            providerConfig: {
                supports_vision: true,
                supports_function_calling: true
            }
        },
        createdAt: new Date('2024-05-13'),
        updatedAt: new Date()
    },

    {
        id: 'openrouter-claude-3-5-sonnet',
        provider: 'openrouter',
        modelName: 'anthropic/claude-3.5-sonnet',
        showName: 'Claude 3.5 Sonnet',
        description: 'Anthropic\'s most intelligent model with enhanced reasoning',
        baseUrl: OPENROUTER_BASE_URL,
        temperature: 0.7,
        capabilities: [
            'text-generation',
            'code-generation',
            'reasoning',
            'analysis',
            'creative-writing',
            'multilingual',
            'long-context'
        ],
        pricing: {
            input: 0.003,  // $3 per 1M tokens
            output: 0.015, // $15 per 1M tokens
            currency: 'USD'
        },
        limits: {
            contextWindow: 200000,
            maxOutputTokens: 4096,
            rpm: 400,
            tpm: 40000
        },
        isActive: true,
        tier: 'premium',
        metadata: {
            family: 'Claude',
            version: '3.5',
            releaseDate: '2024-06-20',
            providerConfig: {
                supports_long_context: true
            }
        },
        createdAt: new Date('2024-06-20'),
        updatedAt: new Date()
    },

    // === Standard Models ===
    {
        id: 'openrouter-gpt-4o-mini',
        provider: 'openrouter',
        modelName: 'openai/gpt-4o-mini',
        showName: 'GPT-4o Mini',
        description: 'Smaller, faster version of GPT-4o with good performance',
        baseUrl: OPENROUTER_BASE_URL,
        temperature: 0.7,
        capabilities: [
            'text-generation',
            'code-generation',
            'reasoning',
            'analysis',
            'creative-writing',
            'multilingual',
            'function-calling'
        ],
        pricing: {
            input: 0.00015,  // $0.15 per 1M tokens
            output: 0.0006,  // $0.6 per 1M tokens
            currency: 'USD'
        },
        limits: {
            contextWindow: 128000,
            maxOutputTokens: 16384,
            rpm: 1000,
            tpm: 200000
        },
        isActive: true,
        tier: 'standard',
        metadata: {
            family: 'GPT',
            version: '4o-mini',
            releaseDate: '2024-07-18',
            providerConfig: {
                supports_function_calling: true
            }
        },
        createdAt: new Date('2024-07-18'),
        updatedAt: new Date()
    },

    {
        id: 'openrouter-claude-3-haiku',
        provider: 'openrouter',
        modelName: 'anthropic/claude-3-haiku',
        showName: 'Claude 3 Haiku',
        description: 'Fast and efficient model for quick tasks',
        baseUrl: OPENROUTER_BASE_URL,
        temperature: 0.7,
        capabilities: [
            'text-generation',
            'code-generation',
            'reasoning',
            'analysis',
            'multilingual'
        ],
        pricing: {
            input: 0.00025,  // $0.25 per 1M tokens
            output: 0.00125, // $1.25 per 1M tokens
            currency: 'USD'
        },
        limits: {
            contextWindow: 200000,
            maxOutputTokens: 4096,
            rpm: 1000,
            tpm: 100000
        },
        isActive: true,
        tier: 'standard',
        metadata: {
            family: 'Claude',
            version: '3-haiku',
            releaseDate: '2024-03-07',
            providerConfig: {}
        },
        createdAt: new Date('2024-03-07'),
        updatedAt: new Date()
    },

    {
        id: 'openrouter-gemini-pro',
        provider: 'openrouter',
        modelName: 'google/gemini-pro-1.5',
        showName: 'Gemini Pro 1.5',
        description: 'Google\'s advanced multimodal model',
        baseUrl: OPENROUTER_BASE_URL,
        temperature: 0.7,
        capabilities: [
            'text-generation',
            'code-generation',
            'reasoning',
            'analysis',
            'creative-writing',
            'multilingual',
            'vision',
            'long-context'
        ],
        pricing: {
            input: 0.00125,  // $1.25 per 1M tokens
            output: 0.005,   // $5 per 1M tokens
            currency: 'USD'
        },
        limits: {
            contextWindow: 1000000, // 1M tokens
            maxOutputTokens: 8192,
            rpm: 300,
            tpm: 50000
        },
        isActive: true,
        tier: 'standard',
        metadata: {
            family: 'Gemini',
            version: '1.5-pro',
            releaseDate: '2024-02-15',
            providerConfig: {
                supports_vision: true,
                supports_long_context: true
            }
        },
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date()
    },

    // === Basic Models ===
    {
        id: 'openrouter-llama-3-1-8b',
        provider: 'openrouter',
        modelName: 'meta-llama/llama-3.1-8b-instruct',
        showName: 'Llama 3.1 8B',
        description: 'Meta\'s efficient open-source model',
        baseUrl: OPENROUTER_BASE_URL,
        temperature: 0.7,
        capabilities: [
            'text-generation',
            'code-generation',
            'reasoning',
            'multilingual'
        ],
        pricing: {
            input: 0.0001,   // $0.1 per 1M tokens
            output: 0.0001,  // $0.1 per 1M tokens
            currency: 'USD'
        },
        limits: {
            contextWindow: 32768,
            maxOutputTokens: 2048,
            rpm: 2000,
            tpm: 500000
        },
        isActive: true,
        tier: 'basic',
        metadata: {
            family: 'Llama',
            version: '3.1-8b',
            releaseDate: '2024-07-23',
            providerConfig: {
                open_source: true
            }
        },
        createdAt: new Date('2024-07-23'),
        updatedAt: new Date()
    },

    {
        id: 'openrouter-mixtral-8x7b',
        provider: 'openrouter',
        modelName: 'mistralai/mixtral-8x7b-instruct',
        showName: 'Mixtral 8x7B',
        description: 'Mistral\'s mixture of experts model',
        baseUrl: OPENROUTER_BASE_URL,
        temperature: 0.7,
        capabilities: [
            'text-generation',
            'code-generation',
            'reasoning',
            'analysis',
            'multilingual'
        ],
        pricing: {
            input: 0.00024,  // $0.24 per 1M tokens
            output: 0.00024, // $0.24 per 1M tokens
            currency: 'USD'
        },
        limits: {
            contextWindow: 32768,
            maxOutputTokens: 4096,
            rpm: 1500,
            tpm: 300000
        },
        isActive: true,
        tier: 'basic',
        metadata: {
            family: 'Mixtral',
            version: '8x7b',
            releaseDate: '2023-12-11',
            providerConfig: {
                mixture_of_experts: true
            }
        },
        createdAt: new Date('2023-12-11'),
        updatedAt: new Date()
    },

    // === Specialized Models ===
    {
        id: 'openrouter-codestral',
        provider: 'openrouter',
        modelName: 'mistralai/codestral-latest',
        showName: 'Codestral',
        description: 'Specialized coding model by Mistral',
        baseUrl: OPENROUTER_BASE_URL,
        temperature: 0.3,
        capabilities: [
            'code-generation',
            'text-generation',
            'reasoning',
            'analysis'
        ],
        pricing: {
            input: 0.0002,   // $0.2 per 1M tokens
            output: 0.0006,  // $0.6 per 1M tokens
            currency: 'USD'
        },
        limits: {
            contextWindow: 32768,
            maxOutputTokens: 4096,
            rpm: 1000,
            tpm: 200000
        },
        isActive: true,
        tier: 'standard',
        metadata: {
            family: 'Codestral',
            version: 'latest',
            releaseDate: '2024-05-29',
            providerConfig: {
                specialized_for_code: true
            }
        },
        createdAt: new Date('2024-05-29'),
        updatedAt: new Date()
    }
]

/**
 * Model capability mappings for easier filtering
 */
export const modelsByCapability: Record<ModelCapability, string[]> = {
    'text-generation': [
        'openrouter-gpt-4o',
        'openrouter-claude-3-5-sonnet',
        'openrouter-gpt-4o-mini',
        'openrouter-claude-3-haiku',
        'openrouter-gemini-pro',
        'openrouter-llama-3-1-8b',
        'openrouter-mixtral-8x7b',
        'openrouter-codestral'
    ],
    'code-generation': [
        'openrouter-gpt-4o',
        'openrouter-claude-3-5-sonnet',
        'openrouter-gpt-4o-mini',
        'openrouter-claude-3-haiku',
        'openrouter-gemini-pro',
        'openrouter-llama-3-1-8b',
        'openrouter-mixtral-8x7b',
        'openrouter-codestral'
    ],
    'reasoning': [
        'openrouter-gpt-4o',
        'openrouter-claude-3-5-sonnet',
        'openrouter-gpt-4o-mini',
        'openrouter-claude-3-haiku',
        'openrouter-gemini-pro',
        'openrouter-llama-3-1-8b',
        'openrouter-mixtral-8x7b',
        'openrouter-codestral'
    ],
    'analysis': [
        'openrouter-gpt-4o',
        'openrouter-claude-3-5-sonnet',
        'openrouter-gpt-4o-mini',
        'openrouter-claude-3-haiku',
        'openrouter-gemini-pro',
        'openrouter-mixtral-8x7b',
        'openrouter-codestral'
    ],
    'creative-writing': [
        'openrouter-gpt-4o',
        'openrouter-claude-3-5-sonnet',
        'openrouter-gpt-4o-mini',
        'openrouter-gemini-pro'
    ],
    'multilingual': [
        'openrouter-gpt-4o',
        'openrouter-claude-3-5-sonnet',
        'openrouter-gpt-4o-mini',
        'openrouter-claude-3-haiku',
        'openrouter-gemini-pro',
        'openrouter-llama-3-1-8b',
        'openrouter-mixtral-8x7b'
    ],
    'function-calling': [
        'openrouter-gpt-4o',
        'openrouter-gpt-4o-mini'
    ],
    'vision': [
        'openrouter-gpt-4o',
        'openrouter-gemini-pro'
    ],
    'long-context': [
        'openrouter-claude-3-5-sonnet',
        'openrouter-claude-3-haiku',
        'openrouter-gemini-pro'
    ]
}

/**
 * Default model recommendations by use case
 */
export const defaultModelRecommendations = {
    // General purpose - balanced performance and cost
    general: 'openrouter-gpt-4o-mini',

    // Coding tasks - specialized model
    coding: 'openrouter-codestral',

    // Analysis and reasoning - premium model
    analysis: 'openrouter-claude-3-5-sonnet',

    // Creative writing - good at creative tasks
    creative: 'openrouter-gpt-4o',

    // Research - long context capability
    research: 'openrouter-claude-3-5-sonnet',

    // Budget-friendly - cheapest option
    budget: 'openrouter-llama-3-1-8b',

    // Premium - best overall performance
    premium: 'openrouter-gpt-4o'
}

/**
 * Model tier groupings
 */
export const modelsByTier = {
    basic: [
        'openrouter-llama-3-1-8b',
        'openrouter-mixtral-8x7b'
    ],
    standard: [
        'openrouter-gpt-4o-mini',
        'openrouter-claude-3-haiku',
        'openrouter-gemini-pro',
        'openrouter-codestral'
    ],
    premium: [
        'openrouter-gpt-4o',
        'openrouter-claude-3-5-sonnet'
    ]
} 