import React from 'react';

const Loader = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  const spinner = (
    <div
      className={`${sizes[size]} border-primary-600 border-t-transparent rounded-full animate-spin`}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          {spinner}
        </div>
      </div>
    );
  }

  return <div className="flex justify-center items-center p-4">{spinner}</div>;
};

export default Loader;
