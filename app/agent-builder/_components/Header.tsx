import { Button } from '@/components/ui/button'
import { Agent } from '@/types/AgentType'
import { ChevronLeft, Play, X } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = {
    agentDetail: Agent | undefined;
    previewHeader?: boolean;
    onPublish?: () => void;
}

function Header({ agentDetail, previewHeader = false, onPublish }: Props) {
    // Back: preview → builder canvas, builder → dashboard
    const backHref = previewHeader
        ? `/agent-builder/${agentDetail?.agentId}`
        : '/dashboard';

    return (
        <div className='w-full p-3 flex items-center justify-between'>
            <div className='flex gap-2 items-center'>
                <Link href={backHref} aria-label='Go back'>
                    <ChevronLeft className='h-8 w-8 cursor-pointer rounded-md hover:bg-neutral-100 transition-colors' />
                </Link>
                <h2 className='text-xl'>{agentDetail?.name}</h2>
            </div>
            <div className='flex items-center gap-3'>
                {!previewHeader ? (
                    <Link href={`/agent-builder/${agentDetail?.agentId}/preview`}>
                        <Button>
                            <Play /> Preview
                        </Button>
                    </Link>
                ) : (
                    <Link href={`/agent-builder/${agentDetail?.agentId}`}>
                        <Button variant={'outline'}>
                            <X /> Close preview
                        </Button>
                    </Link>
                )}

                <Button onClick={() => onPublish && onPublish()}>
                    Publish
                </Button>
            </div>
        </div>
    )
}

export default Header;
