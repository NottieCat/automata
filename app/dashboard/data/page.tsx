import React from 'react'
import AgentsData from '../_components/AgentsData'

function DataPage() {
    return (
        <div className='p-10'>
            <h2 className='font-bold text-2xl'>Agents Data</h2>
            <p className='text-gray-500 mt-1'>
                All agents in your workspace — live from the database.
            </p>
            <AgentsData />
        </div>
    )
}

export default DataPage
