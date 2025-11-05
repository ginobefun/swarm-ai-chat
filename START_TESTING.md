# 🚀 开始测试 - 快速指南

## 📋 当前状态

✅ **已完成**:
- 环境依赖检查通过
- PostgreSQL 数据库运行中
- 数据库模式已初始化
- 种子数据已填充
- 自动化测试全部通过 (189/189)
- 测试记录文档已创建

⚠️ **待完成**:
- 获取 OpenRouter API 密钥
- 启动开发服务器
- 执行手动测试

---

## 🔑 第一步：获取 OpenRouter API 密钥

这是**必需**步骤，没有它聊天功能无法工作。

1. 访问 https://openrouter.ai/
2. 注册或登录账户
3. 在 Dashboard 中创建 API Key
4. 复制 API Key（格式：`sk-or-v1-...`）

5. 编辑 `.env.local` 文件：
```bash
# 使用你喜欢的编辑器
code .env.local
# 或
vim .env.local
# 或
nano .env.local
```

6. 替换 `OPENROUTER_API_KEY` 的值：
```env
OPENROUTER_API_KEY="sk-or-v1-你的真实密钥"
```

---

## 🚀 第二步：启动开发服务器

有两种方式启动：

### 方式 1：使用快捷脚本（推荐）
```bash
./dev.sh
```

### 方式 2：手动启动
```bash
export $(cat .env.local | grep -v '^#' | xargs)
pnpm dev
```

服务器将在 http://localhost:3000 启动。

---

## 🧪 第三步：开始测试

打开浏览器访问 http://localhost:3000

### 快速冒烟测试（5分钟）

1. **页面加载** ✅
   - 首页是否正常显示？
   - 无 JavaScript 错误？

2. **创建会话** ✅
   - 点击 "新对话" 按钮
   - 输入标题，选择 Agent
   - 会话是否出现在侧边栏？

3. **发送消息** ✅
   - 输入："你好，请介绍一下自己"
   - 按 Enter 发送
   - AI 是否正常响应？
   - 流式输出是否流畅？

4. **测试代码生成** ✅
   - 输入："生成一个 Python 排序函数"
   - Artifact 面板是否显示？
   - 代码高亮是否正常？

5. **主题切换** ✅
   - 点击主题切换按钮
   - 深色/浅色模式是否正常？

**如果以上都通过，基础功能 OK！继续详细测试。**

---

## 📋 第四步：详细测试

参考 `TEST_RESULTS.md` 文档，按照测试清单逐项测试：

```bash
# 在浏览器中打开测试清单
open TEST_RESULTS.md
```

### 测试优先级

#### 🔴 高优先级（必须测试）
1. 用户认证（注册/登录/登出）
2. 会话管理（创建/切换/编辑/删除）
3. 消息功能（发送/接收/格式化）
4. Artifact 功能（代码/图表/Mermaid）

#### 🟡 中优先级（重要）
5. @ 提及功能
6. 错误处理
7. 响应式设计
8. 深色模式

#### 🟢 低优先级（可选）
9. 性能测试
10. 长消息处理
11. 边界情况

---

## 📝 第五步：记录测试结果

在 `TEST_RESULTS.md` 中：

1. **完成测试项**：将 `- [ ]` 改为 `- [x]`
2. **记录 Bug**：在 "发现的问题" 部分添加
3. **更新性能指标**：填写实际测试数据
4. **总体评估**：最后给出发布建议

---

## 🛠️ 常用命令

```bash
# 查看 PostgreSQL 状态
docker ps | grep swarm-postgres

# 重启数据库
docker restart swarm-postgres

# 查看数据库数据
pnpm db:studio

# 运行测试
pnpm test

# 代码检查
pnpm lint

# 查看日志（开发服务器终端）
# Ctrl+C 停止服务器
```

---

## 🐛 遇到问题？

### Q1: 服务器启动失败
```bash
# 检查端口占用
lsof -i :3000

# 杀死占用进程
kill -9 <PID>
```

### Q2: 数据库连接失败
```bash
# 检查容器状态
docker ps | grep swarm-postgres

# 重启容器
docker restart swarm-postgres

# 查看容器日志
docker logs swarm-postgres
```

### Q3: AI 不响应
- 检查 OpenRouter API 密钥是否正确
- 查看浏览器控制台错误
- 查看 Network 标签，检查 API 请求状态

### Q4: 页面报错
- 打开浏览器开发者工具（F12）
- 查看 Console 标签的错误信息
- 复制错误信息到 TEST_RESULTS.md

---

## ✅ 测试完成标准

测试被认为完成当：

- ✅ 所有高优先级测试项已完成
- ✅ 至少 80% 中优先级测试项已完成
- ✅ 无阻塞性 Bug
- ✅ 测试结果已记录在 TEST_RESULTS.md

---

## 📊 测试进度追踪

在测试过程中，你可以：

1. 在 `TEST_RESULTS.md` 中勾选完成的测试项
2. 记录发现的问题和 Bug
3. 截图保存测试证据
4. 记录性能数据

---

## 🎯 下一步行动

```bash
# 1. 获取 API 密钥后，编辑 .env.local
code .env.local

# 2. 启动服务器
./dev.sh

# 3. 打开浏览器
open http://localhost:3000

# 4. 打开测试清单
open TEST_RESULTS.md

# 5. 开始测试！🚀
```

---

**祝测试顺利！如有问题，查看 TESTING_GUIDE.md 获取详细指导。**
