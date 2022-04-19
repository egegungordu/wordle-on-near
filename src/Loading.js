import React from 'react'

export default function Loading() {
    return (
        <div className='loading' style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        }}>
        <h1>
            <span role="img" aria-label="loading">⏳</span>
        </h1>
        </div>
    )
}