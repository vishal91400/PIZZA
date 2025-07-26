import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';

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
} from '../redux/slices/cartSlice';

const CartPage = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const cartIsEmpty = useSelector(selectCartIsEmpty);
  const deliveryFee = useSelector(selectDeliveryFee);
  const tax = useSelector(selectTax);
  const grandTotal = useSelector(selectGrandTotal);

  const handleRemoveItem = (pizzaId) => {
    dispatch(removeFromCart(pizzaId));
  };

  const handleIncrementQuantity = (pizzaId) => {
    dispatch(incrementQuantity(pizzaId));
  };

  const handleDecrementQuantity = (pizzaId) => {
    dispatch(decrementQuantity(pizzaId));
  };

  if (cartIsEmpty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaShoppingCart className="h-16 w-16 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-lg text-gray-600 mb-8">
            Looks like you haven't added any pizzas to your cart yet.
          </p>
          <Link
            to="/menu"
            className="btn btn-primary btn-lg"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/menu"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <FaArrowLeft className="h-4 w-4 mr-2" />
            Back to Menu
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-gray-600 mt-2">
            Review your order and proceed to checkout
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Cart Items ({cartItems.length})
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                <AnimatePresence>
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.pizza._id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-6"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Pizza Image */}
                        <img
                          src={item.pizza.image}
                          alt={item.pizza.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />

                        {/* Pizza Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {item.pizza.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {item.pizza.category} • {item.pizza.size}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleDecrementQuantity(item.pizza._id)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <FaMinus className="h-4 w-4" />
                          </button>
                          <span className="text-lg font-medium text-gray-900 min-w-[30px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleIncrementQuantity(item.pizza._id)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <FaPlus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.pizza._id)}
                          className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <FaTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
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

                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-semibold text-primary-600">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Estimated Delivery
                </h3>
                <p className="text-sm text-gray-600">
                  30-45 minutes
                </p>
              </div>

              {/* Checkout Button */}
              <Link
                to="/checkout"
                className="w-full mt-6 btn btn-primary btn-lg"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 