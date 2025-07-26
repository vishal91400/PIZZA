import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaTrash, FaMinus, FaPlus } from 'react-icons/fa';

import {
  selectCartItems,
  selectCartTotal,
  selectCartIsEmpty,
  selectDeliveryFee,
  selectTax,
  selectGrandTotal,
  removeFromCart,
  incrementQuantity,
  decrementQuantity
} from '../../redux/slices/cartSlice';
import { closeCart } from '../../redux/slices/uiSlice';

const CartSidebar = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const cartIsEmpty = useSelector(selectCartIsEmpty);
  const deliveryFee = useSelector(selectDeliveryFee);
  const tax = useSelector(selectTax);
  const grandTotal = useSelector(selectGrandTotal);

  const handleCloseCart = () => {
    dispatch(closeCart());
  };

  const handleRemoveItem = (pizzaId) => {
    dispatch(removeFromCart(pizzaId));
  };

  const handleIncrementQuantity = (pizzaId) => {
    dispatch(incrementQuantity(pizzaId));
  };

  const handleDecrementQuantity = (pizzaId) => {
    dispatch(decrementQuantity(pizzaId));
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleCloseCart}
      />

      {/* Sidebar */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Cart</h2>
          <button
            onClick={handleCloseCart}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cartIsEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaTimes className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add some delicious pizzas to get started!</p>
              <Link
                to="/menu"
                onClick={handleCloseCart}
                className="btn btn-primary"
              >
                Browse Menu
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <motion.div
                  key={item.pizza._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  {/* Pizza Image */}
                  <img
                    src={item.pizza.image}
                    alt={item.pizza.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />

                  {/* Pizza Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {item.pizza.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDecrementQuantity(item.pizza._id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaMinus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-medium text-gray-900 min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleIncrementQuantity(item.pizza._id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaPlus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.pizza._id)}
                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary */}
        {!cartIsEmpty && (
          <div className="border-t border-gray-200 p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-semibold text-primary-600">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              to="/checkout"
              onClick={handleCloseCart}
              className="w-full btn btn-primary btn-lg"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default CartSidebar; 