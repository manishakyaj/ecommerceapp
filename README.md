# 🛒 FASHION - E-commerce App

A modern, responsive e-commerce application built with React frontend and Python Flask backend, inspired by the Quick Carts design.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Product Catalog**: Browse products with search, filtering, and pagination
- **Shopping Cart**: Add, remove, and update items with real-time updates
- **User Authentication**: Login and registration system
- **Product Details**: Detailed product pages with image galleries
- **Category Browsing**: Filter products by categories and brands
- **Search Functionality**: Search products by name and description
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Python Flask** for the API server
- **SQLAlchemy** for database ORM
- **Flask-CORS** for cross-origin requests
- **Flask-JWT-Extended** for authentication
- **SQLite** database (easily replaceable with PostgreSQL/MySQL)

## 📁 Project Structure

```
ecommerce-app/
├── backend/
│   ├── app.py                 # Flask application
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React context providers
│   │   ├── services/         # API service functions
│   │   ├── types/            # TypeScript type definitions
│   │   └── utils/            # Utility functions
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **pip** (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-app
   ```

2. **Set up the Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```
   The backend will start on `http://localhost:5000`

3. **Set up the Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend will start on `http://localhost:3000`

### Alternative: Using npm/yarn for frontend

If you prefer using npm or yarn instead of the above commands:

```bash
# Using npm
cd frontend
npm install
npm run dev

# Using yarn
cd frontend
yarn install
yarn dev
```

## 🎯 Available Scripts

### Backend
- `python app.py` - Start the Flask development server

### Frontend
- `npm run dev` - Start the Vite development server
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

## 📱 Pages and Features

### 🏠 Home Page (`/`)
- Hero section with call-to-action
- Featured products showcase
- Category browsing
- Newsletter signup

### 🔍 Products Page (`/products`)
- Product grid with pagination
- Search and filter functionality
- Category filtering
- Sort options

### 📄 Product Detail Page (`/product/:id`)
- Detailed product information
- Image gallery
- Add to cart functionality
- Product specifications

### 🛒 Cart Page (`/cart`)
- Shopping cart management
- Quantity updates
- Price calculations
- Checkout process

### 🔐 Authentication
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - New user registration

### 🔍 Search & Categories
- **Search** (`/search?q=`) - Product search results
- **Category** (`/category/:category`) - Category-specific products

## 🎨 Design Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Clean, professional interface inspired by Quick Carts
- **Interactive Elements**: Hover effects, smooth transitions
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance**: Optimized images and lazy loading

## 🔧 API Endpoints

### Products
- `GET /api/products` - Get all products with pagination and filters
- `GET /api/products/:id` - Get product details
- `GET /api/categories` - Get all categories

### Cart
- `GET /api/cart` - Get user's cart items
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart/:id` - Remove item from cart

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

## 🗄️ Database Schema

The app uses SQLite with the following main tables:
- **Users**: User account information
- **Products**: Product catalog
- **CartItems**: Shopping cart items
- **Orders**: Order history

## 🚀 Deployment

### Backend Deployment
1. Set up a Python hosting service (Heroku, Railway, etc.)
2. Install dependencies: `pip install -r requirements.txt`
3. Set environment variables for production
4. Run: `python app.py`

### Frontend Deployment
1. Build the app: `npm run build`
2. Deploy the `dist` folder to a static hosting service (Vercel, Netlify, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the existing issues
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Future Enhancements

- [ ] Payment integration (Stripe, PayPal)
- [ ] Order tracking system
- [ ] User reviews and ratings
- [ ] Wishlist functionality
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Product recommendations
- [ ] Multi-language support

---

**Happy Shopping! 🛍️**
