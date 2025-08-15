import React, { useState, useEffect } from 'react';

const LoadingComponent = ({ children, isLoading, delay = 200 }) => {
    const [showLoader, setShowLoader] = useState(false);

    useEffect(() => {
        if (isLoading) {
            const timer = setTimeout(() => {
                setShowLoader(true); 
            }, delay);
            return () => clearTimeout(timer);
        } else {
            setShowLoader(false);
        }
    }, [isLoading, delay]);

    return (
        <div>
            {isLoading && showLoader ? (
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            ) : (
                children 
            )}
        </div>
    );
};

export default LoadingComponent;
