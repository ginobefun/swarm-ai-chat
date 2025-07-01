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
        comingSoon: string
        minute: string
        hour: string
        day: string
        today: string
        yesterday: string
        saving: string
        close: string
        copied: string
        copyCode: string
    }

    // 认证系统
    auth: {
        // 登录/注册标题
        loginTitle: string
        registerTitle: string

        // 社交登录
        loginWithGoogle: string
        loginWithGithub: string

        // 表单字段
        emailLabel: string
        emailPlaceholder: string
        usernameLabel: string
        usernamePlaceholder: string
        nameLabel: string
        namePlaceholder: string
        passwordLabel: string
        passwordPlaceholder: string

        // 按钮状态
        signingIn: string
        signingUp: string
        signIn: string
        signUp: string

        // 切换模式
        noAccount: string
        hasAccount: string
        createAccount: string
        signInNow: string

        // 分隔符
        orContinueWith: string

        // 错误信息
        checkUsernameError: string
        usernameUnavailable: string
        networkError: string
        usernameInUse: string
        usernameFormatError: string
        signInError: string
        emailAlreadyExists: string
        signUpError: string
        usernameFormatInvalid: string
        operationFailed: string
        socialLoginError: string

        // 成功信息
        usernameSet: string
        usernameSetError: string

        // 用户名验证
        usernameOptional: string
        usernameAutoGenerate: string
        usernameRules: string

        // 日志信息
        checkingUsername: string
        settingUsername: string
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

    // 用户个人资料
    userProfile: {
        title: string
        username: string
        usernamePlaceholder: string
        noUsername: string
        memberSince: string
        lastUpdated: string
        loadError: string
        validation: {
            tooShort: string
            tooLong: string
            invalidChars: string
            reserved: string
        }
    }

    // 设置
    settings: {
        title: string
        general: string
        notifications: string
        privacy: string
        language: string
        theme: string
        themeLight: string
        themeDark: string
        themeSystem: string
        timezone: string
        emailNotifications: string
        emailNotificationsDesc: string
        browserNotifications: string
        browserNotificationsDesc: string
        mobileNotifications: string
        mobileNotificationsDesc: string
        showOnlineStatus: string
        showOnlineStatusDesc: string
        allowDirectMessages: string
        allowDirectMessagesDesc: string
    }

    // 订阅状态
    subscription: {
        free: string
        pro: string
        premium: string
    }

    // 用户角色
    role: {
        user: string
        moderator: string
        admin: string
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
        startConversation: string
        startConversationDesc: string
        loginToSendMessage: string
        aiThinking: string
        selectMember: string
        aiAgent: string
        user: string
        // Dialog related
        addAgent: string
        addAgentDesc: string
        chatSettings: string
        sessionInfo: string
        participants: string
        preferences: string
        basicInfo: string
        statistics: string
        currentParticipants: string
        chatPreferences: string
        // ChatArea specific
        collaborationMode: string
        agentsCollaborating: string
        agentsCollaboratingInProgress: string
        needsClarification: string
        pleaseReply: string
        collaborationSummary: string
        collaborationCost: string
        retry: string
        // Error messages
        sendMessageFailed: string
        networkTimeout: string
        rateLimitExceeded: string
        authenticationFailed: string
        quotaExceeded: string
        genericError: string
        // Message actions
        actions: {
            like: string
            dislike: string
            copy: string
            copied: string
        }
        // Collaboration messages
        collaboration: {
            newTaskAssigned: string
            taskCompleted: string
            progress: string
        }
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
        techExpert: string
        marketAnalyst: string
        category: {
            analysis: string
            creative: string
            technical: string
            business: string
            general: string
        }
        description: {
            dataProcessing: string
            creativityInspiration: string
            logicalAnalysis: string
            requirementAnalyst: string
            userResearcher: string
            techEvaluator: string
            dataAnalyst: string
            creativeMaster: string
            requirementAnalysis: string
            creativeDesign: string
            dataAnalysis: string
            techImplementation: string
            marketInsight: string
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
        mainTitle: string
        mainSubtitle: string
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
        noDescription: string
        enterSessionName: string
        enterDescription: string

        // AI 角色选择
        selectAgents: string
        agentsSelected: string
        searchAgents: string
        noAgentsFound: string
        allAgentsAdded: string
        noAgentsAvailable: string
        contactAdmin: string
        tryDifferentSearch: string
        clearSearch: string

        // 会话操作
        rename: string
        pin: string
        unpin: string
        archive: string
        unarchive: string
        duplicate: string
        export: string
        untitled: string
        pinned: string
        confirmDelete: string
        confirmDeleteMessage: string
        operationFailed: string
        retryLater: string
        copy: string
        delete: string

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
        justNow: string

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
        dialogSubtitle: string
        titleHelper: string
        descriptionHelper: string

        // 其他
        optional: string
        autoGenerate: string
        describePurpose: string
        creating: string
        loadingSessions: string
        welcomeToSwarm: string
        multiAgentChat: string
        multiAgentDesc: string
        smartWorkflows: string
        workflowDesc: string
        sessionManager: string
        sessionDesc: string
        loginToGetStarted: string
        loginViaNavbar: string
        createFirstSession: string
        loginToUnlock: string
        freeToUse: string
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
            comingSoon: '即将推出',
            minute: '分钟前',
            hour: '小时前',
            day: '天前',
            today: '今天',
            yesterday: '昨天',
            saving: '保存中...',
            close: '关闭',
            copied: '已复制!',
            copyCode: '复制代码',
        },

        // Authentication system
        auth: {
            // Login/Register titles
            loginTitle: '登录 SwarmAI',
            registerTitle: '注册 SwarmAI',

            // Social login
            loginWithGoogle: '使用 Google 登录',
            loginWithGithub: '使用 GitHub 登录',

            // Form fields
            emailLabel: '邮箱地址',
            emailPlaceholder: '邮箱地址',
            usernameLabel: '用户名',
            usernamePlaceholder: '用户名（可选，英文、数字、下划线，6-20 字符）',
            nameLabel: '姓名',
            namePlaceholder: '姓名',
            passwordLabel: '密码',
            passwordPlaceholder: '密码',

            // Button states
            signingIn: '登录中...',
            signingUp: '注册中...',
            signIn: '登录',
            signUp: '注册',

            // Mode switching
            noAccount: '还没有账号？',
            hasAccount: '已有账号？',
            createAccount: '立即注册',
            signInNow: '立即登录',

            // Separator
            orContinueWith: '或',

            // Error messages
            checkUsernameError: '检查用户名时出错',
            usernameUnavailable: '用户名不可用',
            networkError: '网络错误，请检查网络连接',
            usernameInUse: '用户名已被使用，请尝试其他用户名',
            usernameFormatError: '用户名只能包含英文、数字和下划线，长度 6-20 个字符',
            signInError: '登录失败，请检查邮箱和密码',
            emailAlreadyExists: '该邮箱已被注册',
            signUpError: '注册失败，请检查信息后重试',
            usernameFormatInvalid: '用户名格式不正确',
            operationFailed: '操作失败，请稍后重试',
            socialLoginError: '登录失败，请稍后重试',

            // Success messages
            usernameSet: '用户名已设置为',
            usernameSetError: '设置用户名失败',

            // Username validation
            usernameOptional: '用户名现在是可选的',
            usernameAutoGenerate: '如果没有提供用户名，自动生成',
            usernameRules: '用户名只能包含英文、数字和下划线，长度 3-20 个字符',

            // Log messages
            checkingUsername: '检查用户名时出错：',
            settingUsername: '用户名已设置为：',
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

        // 用户个人资料
        userProfile: {
            title: '个人资料',
            username: '用户名',
            usernamePlaceholder: '请输入用户名',
            noUsername: '未设置用户名',
            memberSince: '注册时间',
            lastUpdated: '最后更新',
            loadError: '加载资料失败',
            validation: {
                tooShort: '用户名至少需要6个字符',
                tooLong: '用户名不能超过50个字符',
                invalidChars: '用户名只能包含字母、数字、下划线和连字符',
                reserved: '该用户名为系统保留，无法使用'
            }
        },

        // 设置
        settings: {
            title: '设置',
            general: '通用',
            notifications: '通知',
            privacy: '隐私',
            language: '语言',
            theme: '主题',
            themeLight: '浅色',
            themeDark: '深色',
            themeSystem: '跟随系统',
            timezone: '时区',
            emailNotifications: '邮件通知',
            emailNotificationsDesc: '接收重要更新和通知的邮件',
            browserNotifications: '浏览器通知',
            browserNotificationsDesc: '在浏览器中显示实时通知',
            mobileNotifications: '移动端通知',
            mobileNotificationsDesc: '在移动设备上接收推送通知',
            showOnlineStatus: '显示在线状态',
            showOnlineStatusDesc: '让其他用户看到您的在线状态',
            allowDirectMessages: '允许私信',
            allowDirectMessagesDesc: '允许其他用户向您发送私信',
        },

        // 订阅状态
        subscription: {
            free: '免费版',
            pro: '专业版',
            premium: '高级版',
        },

        // 用户角色
        role: {
            user: '用户',
            moderator: '管理员',
            admin: '超级管理员',
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
            startConversation: '开始对话',
            startConversationDesc: '发送消息开始与 AI 助手的对话。你可以提问、寻求帮助或开始讨论。',
            loginToSendMessage: '请登录后发送消息...',
            aiThinking: 'AI 正在思考...',
            selectMember: '选择成员',
            aiAgent: 'AI 助手',
            user: '用户',
            // Dialog related
            addAgent: '添加智能体',
            addAgentDesc: '选择专业的 AI 智能体加入对话',
            chatSettings: '聊天设置',
            sessionInfo: '会话信息',
            participants: '参与者',
            preferences: '偏好设置',
            basicInfo: '基本信息',
            statistics: '统计信息',
            currentParticipants: '当前参与者',
            chatPreferences: '聊天偏好',
            // ChatArea specific
            collaborationMode: '协作模式',
            agentsCollaborating: '个智能体协作',
            agentsCollaboratingInProgress: '智能体协作中...',
            needsClarification: '需要澄清：',
            pleaseReply: '请回复...',
            collaborationSummary: '协作总结：',
            collaborationCost: '本次协作成本：',
            retry: '重试',
            // Error messages
            sendMessageFailed: '发送消息失败，请重试',
            networkTimeout: '网络连接超时，请检查网络后重试',
            rateLimitExceeded: '请求过于频繁，请稍后再试',
            authenticationFailed: '认证失败，请重新登录',
            quotaExceeded: '服务额度已用尽，请联系管理员',
            genericError: '出现错误，请重试',
            // Message actions
            actions: {
                like: '点赞',
                dislike: '点踩',
                copy: '复制',
                copied: '已复制',
            },
            // Collaboration messages
            collaboration: {
                newTaskAssigned: '新任务分配',
                taskCompleted: '任务完成',
                progress: '协作进度',
            },
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
            techExpert: '技术专家',
            marketAnalyst: '市场分析师',
            category: {
                analysis: '分析类',
                creative: '创意类',
                technical: '技术类',
                business: '商务类',
                general: '通用类',
            },
            description: {
                dataProcessing: '擅长数据处理和可视化',
                creativityInspiration: '激发创意灵感',
                logicalAnalysis: '逻辑分析和论证',
                requirementAnalyst: '专业的需求梳理和业务分析专家',
                userResearcher: '深入了解用户需求和行为模式',
                techEvaluator: '评估技术方案和架构设计',
                dataAnalyst: '擅长数据分析和可视化报告',
                creativeMaster: '激发创意灵感，提供创新思路',
                requirementAnalysis: '需求分析',
                creativeDesign: '创意设计',
                dataAnalysis: '数据分析',
                techImplementation: '技术实现',
                marketInsight: '市场洞察',
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
            mainTitle: '多智能体协作平台，让 AI 团队 为您服务',
            mainSubtitle: '将不同专业的 AI 智能体组成团队，协同完成复杂任务',
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
            noDescription: '暂无描述',
            enterSessionName: '请输入会话名称',
            enterDescription: '请输入会话描述',

            // AI 角色选择
            selectAgents: '选择 AI 角色',
            agentsSelected: '个已选择',
            searchAgents: '搜索 AI 角色...',
            noAgentsFound: '未找到匹配的 AI 角色',
            allAgentsAdded: '所有智能体都已添加',
            noAgentsAvailable: '暂无 AI 角色',
            contactAdmin: '请联系管理员添加 AI 角色',
            tryDifferentSearch: '请尝试其他搜索词',
            clearSearch: '清除搜索',

            // 会话操作
            rename: '重命名',
            pin: '置顶',
            unpin: '取消置顶',
            archive: '归档',
            unarchive: '取消归档',
            duplicate: '复制会话',
            export: '导出',
            untitled: '未命名会话',
            pinned: '已置顶',
            confirmDelete: '确定要删除这个会话吗？',
            confirmDeleteMessage: '此操作不可撤销。',
            operationFailed: '操作失败',
            retryLater: '请稍后重试',
            copy: '副本',
            delete: '删除',

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
            dialogSubtitle: '配置您的 AI 团队协作',
            titleHelper: '为您的 AI 协作会话选择一个描述性名称',
            descriptionHelper: '添加上下文以帮助 AI 智能体理解您的目标',

            // 其他
            optional: '可选',
            autoGenerate: '不填写将自动生成',
            describePurpose: '描述这个会话的目的或用途',
            creating: '创建中...',
            loadingSessions: '正在加载会话...',
            welcomeToSwarm: '欢迎使用 SwarmAI.chat',
            multiAgentChat: '多智能体对话',
            multiAgentDesc: '与多个 AI 智能体同时对话',
            smartWorkflows: '智能工作流',
            workflowDesc: '自动化复杂任务处理',
            sessionManager: '会话管理',
            sessionDesc: '保存和管理您的对话历史',
            loginToGetStarted: '登录后即可开始使用',
            loginViaNavbar: '请点击右上角登录按钮',
            createFirstSession: '创建您的第一个会话开始对话',
            loginToUnlock: '登录解锁所有功能',
            freeToUse: '完全免费使用',
            justNow: '刚刚',
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
            comingSoon: 'Coming Soon',
            minute: 'm ago',
            hour: 'h ago',
            day: 'd ago',
            today: 'Today',
            yesterday: 'Yesterday',
            saving: 'Saving...',
            close: 'Close',
            copied: 'Copied!',
            copyCode: 'Copy Code',
        },

        // Authentication system
        auth: {
            // Login/Register titles
            loginTitle: 'Sign in to SwarmAI',
            registerTitle: 'Sign up for SwarmAI',

            // Social login
            loginWithGoogle: 'Continue with Google',
            loginWithGithub: 'Continue with GitHub',

            // Form fields
            emailLabel: 'Email',
            emailPlaceholder: 'Email address',
            usernameLabel: 'Username',
            usernamePlaceholder: 'Username (optional, alphanumeric and underscore, 6-20 chars)',
            nameLabel: 'Name',
            namePlaceholder: 'Full name',
            passwordLabel: 'Password',
            passwordPlaceholder: 'Password',

            // Button states
            signingIn: 'Signing in...',
            signingUp: 'Signing up...',
            signIn: 'Sign In',
            signUp: 'Sign Up',

            // Mode switching
            noAccount: "Don't have an account?",
            hasAccount: 'Already have an account?',
            createAccount: 'Sign up now',
            signInNow: 'Sign in now',

            // Separator
            orContinueWith: 'or',

            // Error messages
            checkUsernameError: 'Error checking username',
            usernameUnavailable: 'Username not available',
            networkError: 'Network error, please check your connection',
            usernameInUse: 'Username already taken, please try another one',
            usernameFormatError: 'Username can only contain letters, numbers and underscores, 6-20 characters',
            signInError: 'Sign in failed, please check your email and password',
            emailAlreadyExists: 'This email is already registered',
            signUpError: 'Sign up failed, please check your information and try again',
            usernameFormatInvalid: 'Username format is invalid',
            operationFailed: 'Operation failed, please try again later',
            socialLoginError: 'Login failed, please try again later',

            // Success messages
            usernameSet: 'Username set to',
            usernameSetError: 'Failed to set username',

            // Username validation
            usernameOptional: 'Username is now optional',
            usernameAutoGenerate: 'Auto-generate if no username provided',
            usernameRules: 'Username can only contain letters, numbers and underscores, 3-20 characters',

            // Log messages
            checkingUsername: 'Error checking username:',
            settingUsername: 'Username set to:',
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

        // User profile
        userProfile: {
            title: 'Personal Profile',
            username: 'Username',
            usernamePlaceholder: 'Enter your username',
            noUsername: 'No username set',
            memberSince: 'Member since',
            lastUpdated: 'Last updated',
            loadError: 'Failed to load profile',
            validation: {
                tooShort: 'Username must be at least 6 characters',
                tooLong: 'Username cannot exceed 50 characters',
                invalidChars: 'Username can only contain letters, numbers, underscores, and hyphens',
                reserved: 'This username is reserved and cannot be used'
            }
        },

        // Settings
        settings: {
            title: 'Settings',
            general: 'General',
            notifications: 'Notifications',
            privacy: 'Privacy',
            language: 'Language',
            theme: 'Theme',
            themeLight: 'Light',
            themeDark: 'Dark',
            themeSystem: 'System',
            timezone: 'Timezone',
            emailNotifications: 'Email Notifications',
            emailNotificationsDesc: 'Receive important updates and notifications via email',
            browserNotifications: 'Browser Notifications',
            browserNotificationsDesc: 'Show real-time notifications in browser',
            mobileNotifications: 'Mobile Notifications',
            mobileNotificationsDesc: 'Receive push notifications on mobile devices',
            showOnlineStatus: 'Show Online Status',
            showOnlineStatusDesc: 'Let other users see when you are online',
            allowDirectMessages: 'Allow Direct Messages',
            allowDirectMessagesDesc: 'Allow other users to send you private messages',
        },

        // Subscription status
        subscription: {
            free: 'Free',
            pro: 'Pro',
            premium: 'Premium',
        },

        // User roles
        role: {
            user: 'User',
            moderator: 'Moderator',
            admin: 'Administrator',
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
            startConversation: 'Start Conversation',
            startConversationDesc: 'Send a message to begin your chat with the AI assistant. You can ask questions, request help, or start a discussion.',
            loginToSendMessage: 'Please login to send messages...',
            aiThinking: 'AI is thinking...',
            selectMember: 'Select Member',
            aiAgent: 'AI Agent',
            user: 'User',
            // Dialog related
            addAgent: 'Add Agent',
            addAgentDesc: 'Select professional AI agents to join the conversation',
            chatSettings: 'Chat Settings',
            sessionInfo: 'Session Info',
            participants: 'Participants',
            preferences: 'Preferences',
            basicInfo: 'Basic Info',
            statistics: 'Statistics',
            currentParticipants: 'Current Participants',
            chatPreferences: 'Chat Preferences',
            // ChatArea specific
            collaborationMode: 'Collaboration Mode',
            agentsCollaborating: ' agents collaborating',
            agentsCollaboratingInProgress: 'AI agents collaborating...',
            needsClarification: 'Needs clarification:',
            pleaseReply: 'Please reply...',
            collaborationSummary: 'Collaboration Summary:',
            collaborationCost: 'Collaboration cost:',
            retry: 'Retry',
            // Error messages
            sendMessageFailed: 'Failed to send message, please retry',
            networkTimeout: 'Network timeout, please check your connection and retry',
            rateLimitExceeded: 'Too many requests, please try again later',
            authenticationFailed: 'Authentication failed, please login again',
            quotaExceeded: 'Service quota exceeded, please contact administrator',
            genericError: 'An error occurred, please retry',
            // Message actions
            actions: {
                like: 'Like',
                dislike: 'Dislike',
                copy: 'Copy',
                copied: 'Copied',
            },
            // Collaboration messages
            collaboration: {
                newTaskAssigned: 'New Task Assigned',
                taskCompleted: 'Task Completed',
                progress: 'Collaboration Progress',
            },
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
            techExpert: 'Tech Expert',
            marketAnalyst: 'Market Analyst',
            category: {
                analysis: 'Analysis',
                creative: 'Creative',
                technical: 'Technical',
                business: 'Business',
                general: 'General',
            },
            description: {
                dataProcessing: 'Expert in data processing and visualization',
                creativityInspiration: 'Inspiring creativity and innovation',
                logicalAnalysis: 'Logical analysis and reasoning',
                requirementAnalyst: 'Professional requirement analysis and business strategy expert',
                userResearcher: 'Deep understanding of user needs and behavior patterns',
                techEvaluator: 'Evaluate technical solutions and architecture design',
                dataAnalyst: 'Expert in data analysis and visualization reports',
                creativeMaster: 'Inspire creative ideas and provide innovative solutions',
                requirementAnalysis: 'Requirement Analysis',
                creativeDesign: 'Creative Design',
                dataAnalysis: 'Data Analysis',
                techImplementation: 'Tech Implementation',
                marketInsight: 'Market Insight',
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
            mainTitle: 'Multi-agent collaboration platform where AI teams work for you',
            mainSubtitle: 'Assemble AI agents from different specialties into teams to tackle complex tasks collaboratively',
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
            noDescription: 'No description',
            enterSessionName: 'Enter session name',
            enterDescription: 'Enter session description',

            // AI agent selection
            selectAgents: 'Select AI Agents',
            agentsSelected: ' selected',
            searchAgents: 'Search AI agents...',
            noAgentsFound: 'No matching AI agents found',
            allAgentsAdded: 'All agents have been added',
            noAgentsAvailable: 'No AI agents available',
            contactAdmin: 'Please contact administrator to add AI agents',
            tryDifferentSearch: 'Try a different search term',
            clearSearch: 'Clear search',

            // Session operations
            rename: 'Rename',
            pin: 'Pin',
            unpin: 'Unpin',
            archive: 'Archive',
            unarchive: 'Unarchive',
            duplicate: 'Duplicate',
            export: 'Export',
            untitled: 'Untitled Session',
            pinned: 'Pinned',
            confirmDelete: 'Are you sure to delete this session?',
            confirmDeleteMessage: 'This action cannot be undone.',
            operationFailed: 'Operation failed',
            retryLater: 'Please try again later',
            copy: '(Copy)',
            delete: 'Delete',

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
            dialogSubtitle: 'Configure your AI team collaboration',
            titleHelper: 'Choose a descriptive name for your AI collaboration session',
            descriptionHelper: 'Add context to help AI agents understand your goals',

            // Others
            optional: 'Optional',
            autoGenerate: 'Will auto-generate if not provided',
            describePurpose: 'Describe the purpose of this session',
            creating: 'Creating...',
            loadingSessions: 'Loading sessions...',
            welcomeToSwarm: 'Welcome to SwarmAI.chat',
            multiAgentChat: 'Multi-Agent Chat',
            multiAgentDesc: 'Chat with multiple AI agents simultaneously',
            smartWorkflows: 'Smart Workflows',
            workflowDesc: 'Automate complex task processing',
            sessionManager: 'Session Manager',
            sessionDesc: 'Save and manage your conversation history',
            loginToGetStarted: 'Please login to get started',
            loginViaNavbar: 'Click the login button in the top right corner',
            createFirstSession: 'Create your first session to start chatting',
            loginToUnlock: 'Login to unlock all features',
            freeToUse: 'Fully free to use',
            justNow: 'Just now',
        },
    },
} 