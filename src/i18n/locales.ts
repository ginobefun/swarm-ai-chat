// 国际化文案定义
export type LocaleKey = 'zh-CN' | 'en'

export interface Messages {
    // 通用
    common: {
        loading: string
        error: string
        success: string
        cancel: string
        confirm: string
        save: string
        delete: string
        edit: string
        search: string
        create: string
        menu: string
    }

    // 导航栏
    navbar: {
        logo: string
        searchPlaceholder: string
        publish: string
        notifications: string
        createNew: string
        userMenu: string
        menu: string
        language: string
        theme: string
        lightMode: string
        darkMode: string
        systemMode: string
    }

    // 侧边栏
    sidebar: {
        searchPlaceholder: string
        pinnedChats: string
        recentChats: string
        myAiAgents: string
        justNow: string
        minutesAgo: string
        hoursAgo: string
        yesterday: string
        daysAgo: string
    }

    // 聊天区域
    chat: {
        you: string
        typing: string
        addMember: string
        settings: string
        workspace: string
        inputPlaceholder: string
        mention: string
        attachment: string
        commands: string
        send: string
        members: string
    }

    // 工作区
    workspace: {
        title: string
        summary: string
        keyPoints: string
        mindMap: string
        tasks: string
        pin: string
        unpin: string
        expand: string
        export: string
        close: string
        settings: string
        mindMapDescription: string
        mindMapSubtitle: string
        viewFullMindMap: string
        nextActions: string
    }

    // AI 角色
    agents: {
        requirementAnalyst: string
        userResearcher: string
        techEvaluator: string
        dataAnalyst: string
        creativeMaster: string
        criticalThinker: string
        aiAssistant: string
        specialist: string
        description: {
            dataProcessing: string
            creativityInspiration: string
            logicalAnalysis: string
        }
    }

    // 消息
    messages: {
        processing: string
        analyzing: string
        generating: string
        noMatches: string
        inviteUserResearcher: string
        basedOnMarketResearch: string
    }

    // 任务
    tasks: {
        defineCoreValue: string
        identifyTargetUsers: string
        createMvpFeatures: string
        designArchitecture: string
        completed: string
        pending: string
    }
}

export const locales: Record<LocaleKey, Messages> = {
    'zh-CN': {
        common: {
            loading: '加载中...',
            error: '错误',
            success: '成功',
            cancel: '取消',
            confirm: '确认',
            save: '保存',
            delete: '删除',
            edit: '编辑',
            search: '搜索',
            create: '创建',
            menu: '菜单',
        },
        navbar: {
            logo: 'SwarmAI',
            searchPlaceholder: '搜索对话、角色、文件...',
            publish: '发布',
            notifications: '通知',
            createNew: '新建',
            userMenu: '用户菜单',
            menu: '菜单',
            language: '语言',
            theme: '主题',
            lightMode: '浅色模式',
            darkMode: '深色模式',
            systemMode: '跟随系统',
        },
        sidebar: {
            searchPlaceholder: '搜索对话...',
            pinnedChats: '置顶对话',
            recentChats: '最近对话',
            myAiAgents: '我的 AI 角色',
            justNow: '刚刚',
            minutesAgo: '分钟前',
            hoursAgo: '小时前',
            yesterday: '昨天',
            daysAgo: '天前',
        },
        chat: {
            you: '我',
            typing: '正在输入...',
            addMember: '添加成员',
            settings: '设置',
            workspace: '工作区',
            inputPlaceholder: '输入消息...',
            mention: '提及 AI 角色',
            attachment: '附件',
            commands: '快捷命令',
            send: '发送消息',
            members: '你、@需求分析师、@用户研究员、@技术评估师',
        },
        workspace: {
            title: '工作区',
            summary: '对话概要',
            keyPoints: '关键要点',
            mindMap: '思维导图',
            tasks: '后续行动',
            pin: '置顶',
            unpin: '取消置顶',
            expand: '展开',
            export: '导出',
            close: '关闭',
            settings: '设置',
            mindMapDescription: '知识结构可视化',
            mindMapSubtitle: '点击查看完整思维导图',
            viewFullMindMap: '查看完整思维导图',
            nextActions: '后续行动',
        },
        agents: {
            requirementAnalyst: '需求分析师',
            userResearcher: '用户研究员',
            techEvaluator: '技术评估师',
            dataAnalyst: '数据分析师',
            creativeMaster: '创意大师',
            criticalThinker: '批判思维者',
            aiAssistant: 'AI 助手',
            specialist: '专家',
            description: {
                dataProcessing: '擅长数据处理和可视化',
                creativityInspiration: '激发创意灵感',
                logicalAnalysis: '逻辑分析和论证',
            },
        },
        messages: {
            processing: '我正在处理您的请求...',
            analyzing: '正在分析中...',
            generating: '正在生成详细的用户画像...',
            noMatches: '无匹配结果',
            inviteUserResearcher: '让我邀请用户研究员来详细分析目标用户群体...',
            basedOnMarketResearch: '基于市场调研，我识别出四类核心用户群体：',
        },
        tasks: {
            defineCoreValue: '完成核心价值定义',
            identifyTargetUsers: '确定目标用户群体',
            createMvpFeatures: '制定 MVP 功能列表',
            designArchitecture: '设计技术架构方案',
            completed: '已完成',
            pending: '待完成',
        },
    },
    'en': {
        common: {
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            cancel: 'Cancel',
            confirm: 'Confirm',
            save: 'Save',
            delete: 'Delete',
            edit: 'Edit',
            search: 'Search',
            create: 'Create',
            menu: 'Menu',
        },
        navbar: {
            logo: 'SwarmAI',
            searchPlaceholder: 'Search chats, agents, files...',
            publish: 'Publish',
            notifications: 'Notifications',
            createNew: 'Create New',
            userMenu: 'User Menu',
            menu: 'Menu',
            language: 'Language',
            theme: 'Theme',
            lightMode: 'Light Mode',
            darkMode: 'Dark Mode',
            systemMode: 'System',
        },
        sidebar: {
            searchPlaceholder: 'Search chats...',
            pinnedChats: 'Pinned Chats',
            recentChats: 'Recent Chats',
            myAiAgents: 'My AI Agents',
            justNow: 'Just now',
            minutesAgo: 'minutes ago',
            hoursAgo: 'hours ago',
            yesterday: 'Yesterday',
            daysAgo: 'days ago',
        },
        chat: {
            you: 'You',
            typing: 'Typing...',
            addMember: 'Add Member',
            settings: 'Settings',
            workspace: 'Workspace',
            inputPlaceholder: 'Type a message...',
            mention: 'Mention AI Agent',
            attachment: 'Attachment',
            commands: 'Commands',
            send: 'Send Message',
            members: 'You, @Requirement Analyst, @User Researcher, @Tech Evaluator',
        },
        workspace: {
            title: 'Workspace',
            summary: 'Conversation Summary',
            keyPoints: 'Key Points',
            mindMap: 'Mind Map',
            tasks: 'Next Actions',
            pin: 'Pin',
            unpin: 'Unpin',
            expand: 'Expand',
            export: 'Export',
            close: 'Close',
            settings: 'Settings',
            mindMapDescription: 'Knowledge Structure Visualization',
            mindMapSubtitle: 'Click to view full mind map',
            viewFullMindMap: 'View Full Mind Map',
            nextActions: 'Next Actions',
        },
        agents: {
            requirementAnalyst: 'Requirement Analyst',
            userResearcher: 'User Researcher',
            techEvaluator: 'Tech Evaluator',
            dataAnalyst: 'Data Analyst',
            creativeMaster: 'Creative Master',
            criticalThinker: 'Critical Thinker',
            aiAssistant: 'AI Assistant',
            specialist: 'Specialist',
            description: {
                dataProcessing: 'Expert in data processing and visualization',
                creativityInspiration: 'Inspiring creativity and innovation',
                logicalAnalysis: 'Logical analysis and reasoning',
            },
        },
        messages: {
            processing: 'I am processing your request...',
            analyzing: 'Analyzing...',
            generating: 'Generating detailed user personas...',
            noMatches: 'No matches found',
            inviteUserResearcher: 'Let me invite the user researcher to analyze target user groups in detail...',
            basedOnMarketResearch: 'Based on market research, I identified four core user groups:',
        },
        tasks: {
            defineCoreValue: 'Define Core Value',
            identifyTargetUsers: 'Identify Target Users',
            createMvpFeatures: 'Create MVP Feature List',
            designArchitecture: 'Design Technical Architecture',
            completed: 'Completed',
            pending: 'Pending',
        },
    },
} 