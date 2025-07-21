import React from 'react';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    size = 'medium', 
    color = '#000000' 
}) => {
    const getSize = () => {
        switch (size) {
            case 'small': return '1rem';
            case 'large': return '3rem';
            default: return '2rem';
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '1rem'
            }}
        >
            <div
                style={{
                    width: getSize(),
                    height: getSize(),
                    border: `3px solid ${color}20`,
                    borderTop: `3px solid ${color}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}
            />
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

export default LoadingSpinner;