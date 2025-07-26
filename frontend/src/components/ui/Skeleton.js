import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({
  variant = 'rectangular',
  width = '100%',
  height = '20px',
  className = '',
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-gray-200 rounded';

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-size-200'
  };

  const variantClasses = {
    rectangular: '',
    circular: 'rounded-full',
    text: 'h-4',
    title: 'h-6',
    avatar: 'rounded-full w-10 h-10'
  };

  const style = {
    width,
    height: variant === 'circular' ? width : height
  };

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

// Predefined skeleton components
export const PizzaCardSkeleton = () => (
  <div className="card overflow-hidden">
    <Skeleton variant="rectangular" height="200px" className="w-full" />
    <div className="p-4 space-y-3">
      <Skeleton variant="title" width="70%" />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="60%" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton variant="text" width="80px" height="32px" />
        <Skeleton variant="circular" width="40px" height="40px" />
      </div>
    </div>
  </div>
);

export const OrderCardSkeleton = () => (
  <div className="card p-4 space-y-3">
    <div className="flex justify-between items-start">
      <Skeleton variant="title" width="120px" />
      <Skeleton variant="text" width="80px" />
    </div>
    <Skeleton variant="text" width="100%" />
    <Skeleton variant="text" width="70%" />
    <div className="flex justify-between items-center pt-2">
      <Skeleton variant="text" width="100px" />
      <Skeleton variant="text" width="60px" height="32px" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            variant="text"
            width={colIndex === columns - 1 ? "60px" : "100%"}
          />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton; 