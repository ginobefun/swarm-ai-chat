/**
 * 智能体库组件
 *
 * 展示所有可用的预定义智能体,支持筛选、搜索和选择
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Search, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Agent {
  id: string;
  name: string;
  avatar: string;
  avatarStyle: string;
  description: string;
  specialty: string;
  tags: string[];
  capabilityLevel: number;
  rating: number;
  usageCount: number;
  isFeatured: boolean;
  skills: Array<{
    id: string;
    name: string;
    category: string;
    color: string;
    isPrimary: boolean;
  }>;
  tools: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
}

interface AgentLibraryProps {
  onSelectAgent?: (agent: Agent) => void;
  selectedAgentIds?: string[];
  multiSelect?: boolean;
}

export function AgentLibrary({
  onSelectAgent,
  selectedAgentIds = [],
}: AgentLibraryProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 获取智能体列表
  useEffect(() => {
    fetchAgents();
  }, []);

  // 筛选和搜索
  useEffect(() => {
    let filtered = agents;

    // 按分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(agent =>
        agent.tags.some(tag => tag.toLowerCase() === selectedCategory.toLowerCase())
      );
    }

    // 按搜索关键词筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query) ||
        agent.specialty.toLowerCase().includes(query) ||
        agent.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredAgents(filtered);
  }, [agents, selectedCategory, searchQuery]);

  async function fetchAgents() {
    try {
      setLoading(true);
      const response = await fetch('/api/agents');
      const result = await response.json();

      if (result.success) {
        setAgents(result.data);
        setFilteredAgents(result.data);
      }
    } catch (error) {
      console.error('获取智能体列表失败:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectAgent = (agent: Agent) => {
    onSelectAgent?.(agent);
  };

  const isSelected = (agentId: string) => selectedAgentIds.includes(agentId);

  // 获取所有分类
  const categories = [
    { id: 'all', name: '全部', icon: '🎯' },
    { id: '产品', name: '产品', icon: '📱' },
    { id: '营销', name: '营销', icon: '📊' },
    { id: '技术', name: '技术', icon: '💻' },
    { id: '旅行', name: '旅行', icon: '✈️' },
    { id: '创意', name: '创意', icon: '✍️' },
    { id: '战略', name: '战略', icon: '🎯' },
    { id: '设计', name: '设计', icon: '🎨' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载智能体库...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 搜索栏 */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="搜索智能体..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 分类选项卡 */}
      <div className="border-b">
        <div className="flex overflow-x-auto px-4 py-2 gap-2">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* 智能体网格 */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* 精选智能体 */}
          {selectedCategory === 'all' && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold">精选智能体</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAgents
                  .filter(agent => agent.isFeatured)
                  .map(agent => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      isSelected={isSelected(agent.id)}
                      onSelect={handleSelectAgent}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* 所有智能体 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5" />
              <h3 className="text-lg font-semibold">
                {selectedCategory === 'all' ? '所有智能体' : `${selectedCategory}类智能体`}
              </h3>
              <Badge variant="secondary">{filteredAgents.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAgents.map(agent => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isSelected={isSelected(agent.id)}
                  onSelect={handleSelectAgent}
                />
              ))}
            </div>
          </div>

          {filteredAgents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>未找到匹配的智能体</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

/**
 * 智能体卡片组件
 */
interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: (agent: Agent) => void;
}

function AgentCard({ agent, isSelected, onSelect }: AgentCardProps) {
  return (
    <div
      className={`
        relative group p-4 border rounded-lg transition-all cursor-pointer
        hover:shadow-md hover:scale-[1.02]
        ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'hover:border-blue-300'}
      `}
      onClick={() => onSelect(agent)}
    >
      {/* 选中标记 */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* 精选标记 */}
      {agent.isFeatured && (
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Sparkles className="w-3 h-3 mr-1" />
            精选
          </Badge>
        </div>
      )}

      {/* 头像和基本信息 */}
      <div className="flex items-start gap-3 mb-3 mt-6">
        <div className="text-4xl">{agent.avatar}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{agent.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex">
              {Array.from({ length: agent.capabilityLevel }).map((_, i) => (
                <span key={i} className="text-yellow-400 text-xs">★</span>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {agent.usageCount} 次使用
            </span>
          </div>
        </div>
      </div>

      {/* 描述 */}
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {agent.description}
      </p>

      {/* 专长 */}
      <div className="mb-3">
        <p className="text-xs text-muted-foreground mb-1">擅长领域:</p>
        <p className="text-xs line-clamp-1">{agent.specialty}</p>
      </div>

      {/* 标签 */}
      <div className="flex flex-wrap gap-1 mb-3">
        {agent.tags.slice(0, 3).map(tag => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      {/* 技能和工具 */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
        <span>{agent.skills.length} 个技能</span>
        <span>{agent.tools.length} 个工具</span>
      </div>
    </div>
  );
}
