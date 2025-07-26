import React from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FaPlus, FaStar, FaFire } from 'react-icons/fa';

import { addToCart } from '../../redux/slices/cartSlice';

const PizzaCard = ({ pizza }) => {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({ pizza, quantity: 1 }));
  };

  const renderSpicyLevel = (level) => {
    return Array.from({ length: level }, (_, i) => (
      <FaFire key={i} className="h-3 w-3 text-red-500" />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="card overflow-hidden group"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={pizza.image}
          alt={pizza.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Popular Badge */}
        {pizza.isPopular && (
          <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
            <FaStar className="h-3 w-3 mr-1" />
            Popular
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${pizza.category === 'Veg'
              ? 'bg-green-100 text-green-800'
              : pizza.category === 'Vegan'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-red-100 text-red-800'
            }`}>
            {pizza.category}
          </span>
        </div>

        {/* Add to Cart Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 bg-primary-600 text-white p-2 rounded-full shadow-lg hover:bg-primary-700 transition-colors opacity-0 group-hover:opacity-100"
        >
          <FaPlus className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {pizza.name}
          </h3>
          <span className="text-lg font-bold text-primary-600">
            ${pizza.price.toFixed(2)}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {pizza.description}
        </p>

        {/* Pizza Details */}
        <div className="space-y-2">
          {/* Size */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Size:</span>
            <span className="font-medium">{pizza.size}</span>
          </div>

          {/* Spicy Level */}
          {pizza.spicyLevel > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Spicy Level:</span>
              <div className="flex items-center space-x-1">
                {renderSpicyLevel(pizza.spicyLevel)}
              </div>
            </div>
          )}

          {/* Calories */}
          {pizza.calories && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Calories:</span>
              <span className="font-medium">{pizza.calories} cal</span>
            </div>
          )}

          {/* Preparation Time */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Prep Time:</span>
            <span className="font-medium">{pizza.preparationTime} min</span>
          </div>
        </div>

        {/* Toppings */}
        {pizza.toppings && pizza.toppings.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Toppings:</p>
            <div className="flex flex-wrap gap-1">
              {pizza.toppings.slice(0, 3).map((topping, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {topping}
                </span>
              ))}
              {pizza.toppings.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  +{pizza.toppings.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Add to Cart Button (Mobile) */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          className="w-full mt-4 btn btn-primary group-hover:opacity-0 md:hidden"
        >
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PizzaCard; 