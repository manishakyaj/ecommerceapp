// React import not required with new JSX transform
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import Category from './pages/Category';
import CategoriesAdmin from './pages/admin/Categories';
import ProductsAdmin from './pages/admin/Products';
import OrdersAdmin from './pages/admin/Orders';
import SalesAdmin from './pages/admin/Sales';
import InventoryAdmin from './pages/admin/Inventory';
import AdminLogin from './pages/admin/Login';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<Search />} />
              <Route path="/category/:category" element={<Category />} />
              <Route path="/admin/categories" element={<CategoriesAdmin />} />
              <Route path="/admin/products" element={<ProductsAdmin />} />
              <Route path="/admin/orders" element={<OrdersAdmin />} />
              <Route path="/admin/sales" element={<SalesAdmin />} />
              <Route path="/admin/inventory" element={<InventoryAdmin />} />
              <Route path="/admin/login" element={<AdminLogin />} />
            </Routes>
          </Layout>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
