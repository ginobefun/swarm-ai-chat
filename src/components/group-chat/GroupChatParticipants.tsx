/**
 * 群聊参与者面板
 *
 * 显示群聊中的所有参与者 (用户和智能体)
 * 支持管理参与者 (邀请/移除)
 */

'use client';

import React, { useState } from 'react';
import { Users, UserPlus, MoreVertical, UserMinus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Participant {
  id: string;
  type: 'USER' | 'AGENT';
  role: string;
  joinedAt: Date;
  agent?: {
    id: string;
    name: string;
    avatar: string;
    avatarStyle: string;
    description: string;
    specialty: string;
  };
}

interface GroupChatParticipantsProps {
  sessionId: string;
  participants: Participant[];
  onInviteAgent?: () => void;
  onRemoveAgent?: (agentId: string) => void;
  canManage?: boolean;
}

export function GroupChatParticipants({
  sessionId: _sessionId,
  participants,
  onInviteAgent,
  onRemoveAgent,
  canManage = false,
}: GroupChatParticipantsProps) {
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);

  const agents = participants.filter(p => p.type === 'AGENT' && p.agent);
  const users = participants.filter(p => p.type === 'USER');

  const handleToggleExpand = (agentId: string) => {
    setExpandedAgentId(expandedAgentId === agentId ? null : agentId);
  };

  return (
    <div className="flex flex-col h-full border-l bg-background">
      {/* 标题栏 */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          <h3 className="font-semibold">参与者</h3>
          <Badge variant="secondary">{participants.length}</Badge>
        </div>
        {canManage && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onInviteAgent}
            className="gap-1"
          >
            <UserPlus className="w-4 h-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* 用户列表 */}
          {users.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                用户 ({users.length})
              </h4>
              <div className="space-y-2">
                {users.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {user.id.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">你</span>
                        {user.role === 'OWNER' && (
                          <Badge variant="secondary" className="text-xs">
                            群主
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 智能体列表 */}
          {agents.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                智能体 ({agents.length})
              </h4>
              <div className="space-y-2">
                {agents.map(participant => {
                  const agent = participant.agent!;
                  const isExpanded = expandedAgentId === agent.id;

                  return (
                    <div
                      key={agent.id}
                      className="border rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 p-3">
                        {/* 头像 */}
                        <div className="text-3xl flex-shrink-0">
                          {agent.avatar}
                        </div>

                        {/* 信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {agent.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {agent.specialty}
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex items-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleToggleExpand(agent.id)}
                                >
                                  <Info className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                查看详情
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {canManage && onRemoveAgent && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => onRemoveAgent(agent.id)}
                                  className="text-red-600"
                                >
                                  <UserMinus className="w-4 h-4 mr-2" />
                                  移除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>

                      {/* 展开的详细信息 */}
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t bg-accent/50">
                          <p className="text-sm text-muted-foreground">
                            {agent.description}
                          </p>
                          <div className="mt-2 pt-2 border-t border-dashed flex justify-between text-xs text-muted-foreground">
                            <span>
                              加入时间: {new Date(participant.joinedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 邀请提示 */}
          {agents.length === 0 && canManage && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm mb-3">还没有智能体参与</p>
              <Button onClick={onInviteAgent} size="sm" className="gap-2">
                <UserPlus className="w-4 h-4" />
                邀请智能体
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 底部说明 */}
      <div className="p-4 border-t bg-accent/30">
        <p className="text-xs text-muted-foreground text-center">
          在消息中使用 @智能体名称 来指定回复
        </p>
      </div>
    </div>
  );
}
