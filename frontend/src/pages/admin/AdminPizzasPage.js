import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaSearch,
  FaFilter, FaTimes, FaPizzaSlice, FaStar
} from 'react-icons/fa';

import {
  fetchPizzas, createPizza, updatePizza, deletePizza, togglePizzaAvailability,
  selectPizzas, selectPizzaLoading, selectCurrentPizza
} from '../../redux/slices/pizzaSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { PizzaCardSkeleton } from '../../components/ui/Skeleton';

const AdminPizzasPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingPizza, setEditingPizza] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');

  const dispatch = useDispatch();
  const pizzas = useSelector(selectPizzas);
  const loading = useSelector(selectPizzaLoading);
  const currentPizza = useSelector(selectCurrentPizza);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Veg',
    size: 'Medium',
    toppings: '',
    preparationTime: 20,
    calories: '',
    spicyLevel: 1,
    isPopular: false,
    isAvailable: true
  });

  useEffect(() => {
    dispatch(fetchPizzas());
  }, [dispatch]);

  useEffect(() => {
    if (editingPizza) {
      setFormData({
        name: editingPizza.name,
        description: editingPizza.description,
        price: editingPizza.price,
        category: editingPizza.category,
        size: editingPizza.size,
        toppings: editingPizza.toppings.join(', '),
        preparationTime: editingPizza.preparationTime,
        calories: editingPizza.calories || '',
        spicyLevel: editingPizza.spicyLevel,
        isPopular: editingPizza.isPopular,
        isAvailable: editingPizza.isAvailable
      });
    }
  }, [editingPizza]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const pizzaData = {
      ...formData,
      price: parseFloat(formData.price),
      calories: formData.calories ? parseInt(formData.calories) : undefined,
      toppings: formData.toppings.split(',').map(t => t.trim()).filter(t => t)
    };

    try {
      if (editingPizza) {
        await dispatch(updatePizza({ id: editingPizza._id, pizzaData })).unwrap();
        toast.success('Pizza updated successfully!');
      } else {
        await dispatch(createPizza(pizzaData)).unwrap();
        toast.success('Pizza created successfully!');
      }
      handleCloseModal();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (pizzaId) => {
    if (window.confirm('Are you sure you want to delete this pizza?')) {
      try {
        await dispatch(deletePizza(pizzaId)).unwrap();
        toast.success('Pizza deleted successfully!');
      } catch (error) {
        toast.error(error.message || 'Delete failed');
      }
    }
  };

  const handleToggleAvailability = async (pizzaId) => {
    try {
      await dispatch(togglePizzaAvailability(pizzaId)).unwrap();
      toast.success('Availability updated!');
    } catch (error) {
      toast.error(error.message || 'Update failed');
    }
  };

  const handleEdit = (pizza) => {
    setEditingPizza(pizza);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPizza(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Veg',
      size: 'Medium',
      toppings: '',
      preparationTime: 20,
      calories: '',
      spicyLevel: 1,
      isPopular: false,
      isAvailable: true
    });
  };

  const filteredPizzas = pizzas.filter(pizza => {
    const matchesSearch = pizza.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pizza.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || pizza.category === filterCategory;
    const matchesAvailability = filterAvailability === 'all' ||
      (filterAvailability === 'available' && pizza.isAvailable) ||
      (filterAvailability === 'unavailable' && !pizza.isAvailable);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Pizzas</h1>
          <p className="text-gray-600">Add, edit, and manage your pizza menu</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <FaPlus />
          <span>Add Pizza</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search pizzas..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Veg">Vegetarian</option>
              <option value="Non-Veg">Non-Vegetarian</option>
              <option value="Vegan">Vegan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
            <select
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pizzas Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <PizzaCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredPizzas.map((pizza, index) => (
              <motion.div
                key={pizza._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img
                    src={pizza.image}
                    alt={pizza.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {pizza.isPopular && (
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        <FaStar className="mr-1" />
                        Popular
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${pizza.category === 'Veg' ? 'bg-green-100 text-green-800' :
                        pizza.category === 'Non-Veg' ? 'bg-red-100 text-red-800' :
                          'bg-purple-100 text-purple-800'
                      }`}>
                      {pizza.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleAvailability(pizza._id)}
                    className={`absolute top-2 left-2 p-2 rounded-full ${pizza.isAvailable ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                      } hover:opacity-80 transition-opacity`}
                  >
                    {pizza.isAvailable ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{pizza.name}</h3>
                    <p className="text-lg font-bold text-red-600">${pizza.price}</p>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{pizza.description}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>Size: {pizza.size}</span>
                    <span>Spicy: {pizza.spicyLevel}/5</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(pizza)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(pizza._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${pizza.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {pizza.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filteredPizzas.length === 0 && (
        <div className="text-center py-12">
          <FaPizzaSlice className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pizzas found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingPizza ? 'Edit Pizza' : 'Add New Pizza'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="Veg">Vegetarian</option>
                      <option value="Non-Veg">Non-Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                    <select
                      name="size"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="Small">Small</option>
                      <option value="Medium">Medium</option>
                      <option value="Large">Large</option>
                      <option value="Extra Large">Extra Large</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spicy Level</label>
                    <select
                      name="spicyLevel"
                      value={formData.spicyLevel}
                      onChange={(e) => setFormData({ ...formData, spicyLevel: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5].map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Toppings (comma-separated)</label>
                    <input
                      type="text"
                      name="toppings"
                      value={formData.toppings}
                      onChange={(e) => setFormData({ ...formData, toppings: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Cheese, Mushrooms, Peppers"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Calories</label>
                    <input
                      type="number"
                      name="calories"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPopular"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Mark as Popular</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Available</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {editingPizza ? 'Update Pizza' : 'Add Pizza'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPizzasPage; 