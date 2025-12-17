import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, CartContextType } from '../types';
import { cartService } from '../services/api';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // Load cart from localStorage on mount
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse saved cart:', error);
      }
    }

    // If user is logged in, try to fetch from server
    const token = localStorage.getItem('token');
    if (token) {
      fetchCart();
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const fetchCart = async () => {
    try {
      const response = await cartService.getCart();
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // User is logged in, sync with server
      try {
        await cartService.addToCart(product.id, quantity);
        await fetchCart(); // Refresh cart after adding
      } catch (error) {
        console.error('Failed to add to cart:', error);
      }
    } else {
      // User is not logged in, store locally
      setItems(prevItems => {
        const existingItem = prevItems.find(item => item.product.id === product.id);
        if (existingItem) {
          return prevItems.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          const newItem: CartItem = {
            id: Date.now(), // Temporary ID for local storage
            product,
            quantity
          };
          return [...prevItems, newItem];
        }
      });
    }
  };

  const removeFromCart = async (itemId: number) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // User is logged in, sync with server
      try {
        await cartService.removeFromCart(itemId);
        setItems(items.filter(item => item.id !== itemId));
      } catch (error) {
        console.error('Failed to remove from cart:', error);
      }
    } else {
      // User is not logged in, remove locally
      setItems(items.filter(item => item.id !== itemId));
    }
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setItems(items.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
