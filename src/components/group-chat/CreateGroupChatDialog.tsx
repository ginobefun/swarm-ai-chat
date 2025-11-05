/**
 * 创建群聊对话框
 *
 * 允许用户创建新的群聊并选择智能体参与
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Sparkles, ArrowRight, X } from 'lucide-react';
import { AgentLibrary } from '@/components/agents/AgentLibrary';
import { toast } from 'sonner';

interface Agent {
  id: string;
  name: string;
  avatar: string;
  description: string;
  specialty: string;
}

export function CreateGroupChatDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'info' | 'agents'>('info');
  const [loading, setLoading] = useState(false);

  // 表单数据
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);

  const handleSelectAgent = (agent: Agent) => {
    const isSelected = selectedAgents.some(a => a.id === agent.id);

    if (isSelected) {
      // 取消选择
      setSelectedAgents(selectedAgents.filter(a => a.id !== agent.id));
    } else {
      // 选择
      setSelectedAgents([...selectedAgents, agent]);
    }
  };

  const handleRemoveAgent = (agentId: string) => {
    setSelectedAgents(selectedAgents.filter(a => a.id !== agentId));
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error('请输入群聊名称');
      return;
    }

    if (selectedAgents.length === 0) {
      toast.error('请至少选择一个智能体');
      return;
    }

    try {
      setLoading(true);

      // TODO: 从认证系统获取真实的用户 ID
      const userId = 'temp-user-id';

      const response = await fetch('/api/group-chat/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          userId,
          agentIds: selectedAgents.map(a => a.id),
          type: 'GROUP',
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('群聊创建成功!');
        setOpen(false);

        // 重置表单
        setTitle('');
        setDescription('');
        setSelectedAgents([]);
        setStep('info');

        // 跳转到新创建的群聊
        router.push(`/chat?sessionId=${result.data.id}`);
      } else {
        toast.error(result.error || '创建失败');
      }
    } catch (error) {
      console.error('创建群聊失败:', error);
      toast.error('创建失败,请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!title.trim()) {
      toast.error('请输入群聊名称');
      return;
    }
    setStep('agents');
  };

  const handleBack = () => {
    setStep('info');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          创建群聊
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col p-0">
        {step === 'info' ? (
          // 第一步: 输入群聊信息
          <>
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                创建智能体群聊
              </DialogTitle>
              <DialogDescription>
                输入群聊名称和描述,然后选择要参与的智能体
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6">
              <div className="space-y-4">
                {/* 群聊名称 */}
                <div className="space-y-2">
                  <Label htmlFor="title">群聊名称 *</Label>
                  <Input
                    id="title"
                    placeholder="例如: 2026年日本关西7日游规划"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    给你的群聊起一个清晰的名称
                  </p>
                </div>

                {/* 群聊描述 */}
                <div className="space-y-2">
                  <Label htmlFor="description">描述 (可选)</Label>
                  <Textarea
                    id="description"
                    placeholder="描述一下这次协作的目标和期望..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {description.length}/500
                  </p>
                </div>

                {/* 已选择的智能体预览 */}
                {selectedAgents.length > 0 && (
                  <div className="space-y-2">
                    <Label>已选择的智能体 ({selectedAgents.length})</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedAgents.map(agent => (
                        <Badge
                          key={agent.id}
                          variant="secondary"
                          className="pl-2 pr-1 py-1 gap-1"
                        >
                          <span>{agent.avatar}</span>
                          <span>{agent.name}</span>
                          <button
                            onClick={() => handleRemoveAgent(agent.id)}
                            className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 示例场景 */}
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    使用场景示例
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• 产品需求讨论: 邀请产品经理、UX设计师、技术架构师</li>
                    <li>• 旅行计划制定: 邀请旅行专家、预算顾问</li>
                    <li>• 营销方案脑暴: 邀请营销专家、文案大师、数据分析师</li>
                    <li>• 商业计划评审: 邀请商业顾问、批判性思考者</li>
                  </ul>
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button onClick={handleNext} className="gap-2">
                下一步: 选择智能体
                <ArrowRight className="w-4 h-4" />
              </Button>
            </DialogFooter>
          </>
        ) : (
          // 第二步: 选择智能体
          <>
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                选择智能体
              </DialogTitle>
              <DialogDescription>
                从智能体库中选择要参与协作的成员
              </DialogDescription>
            </DialogHeader>

            {/* 已选择的智能体 */}
            {selectedAgents.length > 0 && (
              <div className="px-6 pb-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      已选择 {selectedAgents.length} 位智能体
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgents.map(agent => (
                      <Badge
                        key={agent.id}
                        variant="secondary"
                        className="pl-2 pr-1 py-1 gap-1"
                      >
                        <span>{agent.avatar}</span>
                        <span>{agent.name}</span>
                        <button
                          onClick={() => handleRemoveAgent(agent.id)}
                          className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 智能体库 */}
            <div className="flex-1 overflow-hidden border-t">
              <AgentLibrary
                onSelectAgent={handleSelectAgent}
                selectedAgentIds={selectedAgents.map(a => a.id)}
                multiSelect={true}
              />
            </div>

            <DialogFooter className="p-6 pt-4 border-t">
              <Button variant="outline" onClick={handleBack}>
                上一步
              </Button>
              <Button
                onClick={handleCreate}
                disabled={loading || selectedAgents.length === 0}
                className="gap-2"
              >
                {loading ? '创建中...' : `创建群聊 (${selectedAgents.length} 位智能体)`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
