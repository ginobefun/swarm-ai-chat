'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import {
    ThumbsUp,
    ThumbsDown,
    Copy,
    Check
} from 'lucide-react'
import { useTranslation } from '@/contexts/AppContext'

interface MessageActionsProps {
    messageId: string
    content: string
    onLike?: (messageId: string) => void
    onDislike?: (messageId: string) => void
    onCopy?: (content: string) => void
}

export const MessageActions: React.FC<MessageActionsProps> = ({
    messageId,
    content,
    onLike,
    onDislike,
    onCopy
}) => {
    const { t } = useTranslation()
    const [copied, setCopied] = useState(false)
    const [liked, setLiked] = useState(false)
    const [disliked, setDisliked] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content)
            setCopied(true)
            onCopy?.(content)

            // Reset copy state after 2 seconds
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Failed to copy message:', error)
        }
    }

    const handleLike = () => {
        setLiked(!liked)
        if (disliked) setDisliked(false) // Reset dislike if like is clicked
        onLike?.(messageId)
    }

    const handleDislike = () => {
        setDisliked(!disliked)
        if (liked) setLiked(false) // Reset like if dislike is clicked
        onDislike?.(messageId)
    }

    return (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* Like button */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLike}
                        className={`h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 ${liked ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                            }`}
                    >
                        <ThumbsUp className="h-3.5 w-3.5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    {t('chat.actions.like')}
                </TooltipContent>
            </Tooltip>

            {/* Dislike button */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDislike}
                        className={`h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 ${disliked ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
                            }`}
                    >
                        <ThumbsDown className="h-3.5 w-3.5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    {t('chat.actions.dislike')}
                </TooltipContent>
            </Tooltip>

            {/* Copy button */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                    >
                        {copied ? (
                            <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                        ) : (
                            <Copy className="h-3.5 w-3.5" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    {copied ? t('chat.actions.copied') : t('chat.actions.copy')}
                </TooltipContent>
            </Tooltip>
        </div>
    )
} 