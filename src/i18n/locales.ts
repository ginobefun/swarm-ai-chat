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
        retry: string
        creating: string
        optional: string
    }

    // 导航栏
    navbar: {
        logo: string
        brandName: string
        brandTagline: string
        searchPlaceholder: string
        searchAriaLabel: string
        globalSearch: string
        mainNavigation: string
        toggleSidebar: string
        publish: string
        notifications: string
        unreadNotifications: string
        createNew: string
        userMenu: string
        userMenuAriaLabel: string
        userInitial: string
        menu: string
        language: string
        theme: string
        lightMode: string
        darkMode: string
        systemMode: string
        discoverAgents: string
    }

    // 用户菜单
    userMenu: {
        myProfile: string
        settings: string
        preferences: string
        account: string
        signOut: string
        confirmSignOut: string
        signOutMessage: string
        signingOut: string
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
        selectSession: string
        noMembers: string
        untitledSession: string
        agents: string
        messages: string
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
            requirementAnalyst: string
            userResearcher: string
            techEvaluator: string
            dataAnalyst: string
            creativeMaster: string
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

    // 欢迎页面
    welcome: {
        title: string
        subtitle: string
        createNewSession: string
        exploreAgents: string
        quickStartLabel: string
        featuredLabel: string
        features: {
            multiAgent: {
                title: string
                description: string
            }
            professionalRoles: {
                title: string
                description: string
            }
            structuredOutput: {
                title: string
                description: string
            }
        }
        quickStart: {
            title: string
            subtitle: string
            step1: {
                title: string
                description: string
            }
            step2: {
                title: string
                description: string
            }
            step3: {
                title: string
                description: string
            }
        }
        featuredAgents: {
            title: string
            subtitle: string
        }
    }

    // 会话管理
    session: {
        // 会话类型
        createSession: string
        createNewSession: string
        sessionTitle: string
        sessionName: string
        sessionDescription: string
        description: string
        enterSessionName: string
        enterDescription: string

        // AI 角色选择
        selectAgents: string
        agentsSelected: string
        searchAgents: string
        noAgentsFound: string

        // 会话操作
        rename: string
        pin: string
        unpin: string
        archive: string
        duplicate: string
        export: string
        confirmDelete: string
        confirmDeleteMessage: string
        operationFailed: string
        retryLater: string
        copy: string

        // 会话类型
        allSessions: string
        singleChat: string
        directChat: string
        groupChat: string
        workflowChat: string

        // 会话状态
        noMessages: string
        noSessions: string
        messagesCount: string
        agentsCount: string
        unknownTime: string
        unknownAgent: string

        // 会话分组
        pinnedSessions: string
        recentSessions: string
        aiAgentGroups: string
        searchSessions: string

        // 重命名相关
        renameSession: string
        newSessionName: string
        newName: string
        enterNewName: string
        nameRequired: string
        nameTooShort: string
        nameTooLong: string

        // 创建会话相关
        titleRequired: string
        agentRequired: string
        createError: string

        // 其他
        optional: string
        autoGenerate: string
        describePurpose: string
        creating: string
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
            retry: '重试',
            creating: '创建中...',
            optional: '可选',
        },
        navbar: {
            logo: 'SwarmAI',
            brandName: 'SwarmAI',
            brandTagline: '多智能体协作',
            searchPlaceholder: '搜索对话、角色、文件...',
            searchAriaLabel: '搜索对话、智能体和文件',
            globalSearch: '全局搜索',
            mainNavigation: '主导航',
            toggleSidebar: '切换侧边栏导航',
            publish: '发布',
            notifications: '通知',
            unreadNotifications: '未读通知',
            createNew: '新建',
            userMenu: '用户菜单',
            userMenuAriaLabel: '用户菜单和账户设置',
            userInitial: 'U',
            menu: '菜单',
            language: '语言',
            theme: '主题',
            lightMode: '浅色模式',
            darkMode: '深色模式',
            systemMode: '跟随系统',
            discoverAgents: '发现 AI 智能体',
        },

        // 用户菜单
        userMenu: {
            myProfile: '个人资料',
            settings: '设置',
            preferences: '偏好设置',
            account: '账户管理',
            signOut: '退出登录',
            confirmSignOut: '确认退出',
            signOutMessage: '您确定要退出登录吗？',
            signingOut: '正在退出...',
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
            selectSession: '请选择一个会话开始对话',
            noMembers: '暂无成员',
            untitledSession: '未命名会话',
            agents: '个 AI 智能体',
            messages: '条消息',
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
                requirementAnalyst: '专业的需求梳理和业务分析专家',
                userResearcher: '深入了解用户需求和行为模式',
                techEvaluator: '评估技术方案和架构设计',
                dataAnalyst: '擅长数据分析和可视化报告',
                creativeMaster: '激发创意灵感，提供创新思路',
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
        welcome: {
            title: '欢迎使用 SwarmAI.chat',
            subtitle: '多智能体协作平台，让 AI 团队为您服务',
            createNewSession: '创建新会话',
            exploreAgents: '探索 AI 智能体',
            quickStartLabel: '快速上手',
            featuredLabel: '精选推荐',
            features: {
                multiAgent: {
                    title: '多智能体协作',
                    description: '将不同专业领域的 AI 智能体组成团队，协同完成复杂任务'
                },
                professionalRoles: {
                    title: '专业角色扮演',
                    description: '每个 AI 都有专业背景，如分析师、创意师、技术专家等角色'
                },
                structuredOutput: {
                    title: '结构化输出',
                    description: '智能整理对话内容，生成摘要、任务清单等结构化文档'
                }
            },
            quickStart: {
                title: '如何开始？',
                subtitle: '三个简单步骤，立即体验 AI 团队协作的强大功能',
                step1: {
                    title: '创建新会话',
                    description: '点击左侧"创建新会话"开始对话'
                },
                step2: {
                    title: '邀请 AI 智能体',
                    description: '选择适合的 AI 智能体加入您的讨论'
                },
                step3: {
                    title: '开始协作',
                    description: '使用@符号定向特定 AI 回答问题'
                }
            },
            featuredAgents: {
                title: '热门 AI 智能体',
                subtitle: '选择专业的 AI 角色来协助您完成各种任务'
            }
        },
        session: {
            // 会话类型
            createSession: '创建会话',
            createNewSession: '创建新会话',
            sessionTitle: '会话标题',
            sessionName: '会话名称',
            sessionDescription: '会话描述',
            description: '描述',
            enterSessionName: '请输入会话名称',
            enterDescription: '请输入会话描述',

            // AI 角色选择
            selectAgents: '选择 AI 角色',
            agentsSelected: '个已选择',
            searchAgents: '搜索 AI 角色...',
            noAgentsFound: '未找到匹配的 AI 角色',

            // 会话操作
            rename: '重命名',
            pin: '置顶',
            unpin: '取消置顶',
            archive: '归档',
            duplicate: '复制会话',
            export: '导出',
            confirmDelete: '确定要删除这个会话吗？',
            confirmDeleteMessage: '此操作不可撤销。',
            operationFailed: '操作失败',
            retryLater: '请稍后重试',
            copy: '副本',

            // 会话类型
            allSessions: '全部会话',
            singleChat: '单聊',
            directChat: '单聊',
            groupChat: '群聊',
            workflowChat: '工作流',

            // 会话状态
            noMessages: '暂无消息',
            noSessions: '暂无会话',
            messagesCount: '条消息',
            agentsCount: '个 AI 角色',
            unknownTime: '未知时间',
            unknownAgent: '未知角色',

            // 会话分组
            pinnedSessions: '置顶会话',
            recentSessions: '最近会话',
            aiAgentGroups: 'AI 角色分组',
            searchSessions: '搜索会话...',

            // 重命名相关
            renameSession: '重命名会话',
            newSessionName: '新会话名称',
            newName: '新名称',
            enterNewName: '请输入新的名称',
            nameRequired: '名称不能为空',
            nameTooShort: '名称至少需要 1 个字符',
            nameTooLong: '名称不能超过 100 个字符',

            // 创建会话相关
            titleRequired: '会话标题是必需的',
            agentRequired: '至少需要选择一个 AI 角色',
            createError: '创建会话失败',

            // 其他
            optional: '可选',
            autoGenerate: '不填写将自动生成',
            describePurpose: '描述这个会话的目的或用途',
            creating: '创建中...',
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
            retry: 'Retry',
            creating: 'Creating...',
            optional: 'Optional',
        },
        navbar: {
            logo: 'SwarmAI',
            brandName: 'SwarmAI',
            brandTagline: 'Multi-Agent Collaboration',
            searchPlaceholder: 'Search chats, agents, files...',
            searchAriaLabel: 'Search conversations, AI agents and files',
            globalSearch: 'Global Search',
            mainNavigation: 'Main Navigation',
            toggleSidebar: 'Toggle sidebar navigation',
            publish: 'Publish',
            notifications: 'Notifications',
            unreadNotifications: 'Unread notifications',
            createNew: 'Create New',
            userMenu: 'User Menu',
            userMenuAriaLabel: 'User menu and account settings',
            userInitial: 'U',
            menu: 'Menu',
            language: 'Language',
            theme: 'Theme',
            lightMode: 'Light Mode',
            darkMode: 'Dark Mode',
            systemMode: 'System',
            discoverAgents: 'Discover AI Agents',
        },

        // User menu
        userMenu: {
            myProfile: 'My Profile',
            settings: 'Settings',
            preferences: 'Preferences',
            account: 'Account',
            signOut: 'Sign Out',
            confirmSignOut: 'Confirm Sign Out',
            signOutMessage: 'Are you sure you want to sign out?',
            signingOut: 'Signing out...',
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
            selectSession: 'Please select a session to start conversation',
            noMembers: 'No members',
            untitledSession: 'Untitled Session',
            agents: ' AI agents',
            messages: ' messages',
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
                requirementAnalyst: 'Professional requirement analysis and business strategy expert',
                userResearcher: 'Deep understanding of user needs and behavior patterns',
                techEvaluator: 'Evaluate technical solutions and architecture design',
                dataAnalyst: 'Expert in data analysis and visualization reports',
                creativeMaster: 'Inspire creative ideas and provide innovative solutions',
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
        welcome: {
            title: 'Welcome to SwarmAI.chat',
            subtitle: 'Multi-agent collaboration platform where AI teams work for you',
            createNewSession: 'Create New Session',
            exploreAgents: 'Explore AI Agents',
            quickStartLabel: 'Quick Start',
            featuredLabel: 'Featured',
            features: {
                multiAgent: {
                    title: 'Multi-Agent Collaboration',
                    description: 'Assemble AI agents from different domains into teams to tackle complex tasks together'
                },
                professionalRoles: {
                    title: 'Professional Role-Playing',
                    description: 'Each AI has professional backgrounds as analysts, creatives, technical experts, and more'
                },
                structuredOutput: {
                    title: 'Structured Output',
                    description: 'Intelligently organize conversations to generate summaries, task lists, and structured documents'
                }
            },
            quickStart: {
                title: 'How to Get Started?',
                subtitle: 'Three simple steps to experience the power of AI team collaboration',
                step1: {
                    title: 'Create New Session',
                    description: 'Click "Create New Session" on the left to start chatting'
                },
                step2: {
                    title: 'Invite AI Agents',
                    description: 'Select suitable AI agents to join your discussion'
                },
                step3: {
                    title: 'Start Collaborating',
                    description: 'Use @ symbol to direct specific AI agents to answer questions'
                }
            },
            featuredAgents: {
                title: 'Popular AI Agents',
                subtitle: 'Choose professional AI roles to assist you with various tasks'
            }
        },
        session: {
            // Session types
            createSession: 'Create Session',
            createNewSession: 'Create New Session',
            sessionTitle: 'Session Title',
            sessionName: 'Session Name',
            sessionDescription: 'Session Description',
            description: 'Description',
            enterSessionName: 'Enter session name',
            enterDescription: 'Enter session description',

            // AI agent selection
            selectAgents: 'Select AI Agents',
            agentsSelected: ' selected',
            searchAgents: 'Search AI agents...',
            noAgentsFound: 'No matching AI agents found',

            // Session operations
            rename: 'Rename',
            pin: 'Pin',
            unpin: 'Unpin',
            archive: 'Archive',
            duplicate: 'Duplicate',
            export: 'Export',
            confirmDelete: 'Are you sure to delete this session?',
            confirmDeleteMessage: 'This action cannot be undone.',
            operationFailed: 'Operation failed',
            retryLater: 'Please try again later',
            copy: '(Copy)',

            // Session types
            allSessions: 'All Sessions',
            singleChat: 'Single Chat',
            directChat: 'Direct Chat',
            groupChat: 'Group Chat',
            workflowChat: 'Workflow',

            // Session status
            noMessages: 'No messages',
            noSessions: 'No sessions yet',
            messagesCount: ' messages',
            agentsCount: ' AI agents',
            unknownTime: 'Unknown time',
            unknownAgent: 'Unknown Agent',

            // Session groups
            pinnedSessions: 'Pinned Sessions',
            recentSessions: 'Recent Sessions',
            aiAgentGroups: 'AI Agent Groups',
            searchSessions: 'Search sessions...',

            // Rename related
            renameSession: 'Rename Session',
            newSessionName: 'New Session Name',
            newName: 'New Name',
            enterNewName: 'Enter new name',
            nameRequired: 'Name is required',
            nameTooShort: 'Name must be at least 1 character',
            nameTooLong: 'Name must be less than 100 characters',

            // Create session related
            titleRequired: 'Session title is required',
            agentRequired: 'At least one AI agent must be selected',
            createError: 'Failed to create session',

            // Others
            optional: 'Optional',
            autoGenerate: 'Will auto-generate if not provided',
            describePurpose: 'Describe the purpose of this session',
            creating: 'Creating...',
        },
    },
} 