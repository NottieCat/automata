"use client"
import { Button } from '@/components/ui/button'
import { Agent } from '@/types/AgentType'
import { ChevronLeft, Play, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

type Props = {
    agentDetail: Agent | undefined;
    previewHeader?: boolean;
    onPublish?: () => void;
}

function Header({ agentDetail, previewHeader = false, onPublish }: Props) {
    const router = useRouter();

    // Go back to wherever the user actually came from (Data tab, My Agents,
    // Dashboard…). Fall back to /dashboard when there is no in-app history,
    // e.g. the builder URL was opened directly in a new tab.
    const goBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div className='w-full p-3 flex items-center justify-between'>
            <div className='flex gap-2 items-center'>
                <button onClick={goBack} aria-label='Go back' className='cursor-pointer'>
                    <ChevronLeft className='h-8 w-8 rounded-md hover:bg-neutral-100 transition-colors' />
                </button>
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
