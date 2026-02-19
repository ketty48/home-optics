# Safe Home Rwanda E-Commerce Platform

A modern, full-stack e-commerce platform built with TypeScript, Node.js, Express, MongoDB, and React. This is an improved version of safehomerwanda.com with enhanced UI/UX, better performance, and modern development practices.

## 🚀 Features

### Customer Features
- ✨ Modern, responsive UI with smooth animations
- 🛍️ Product browsing with advanced filtering and sorting
- 🔍 Search functionality
- 🛒 Shopping cart with persistent storage
- 👤 User authentication (Register/Login)
- 📦 Order management
- ⭐ Product reviews and ratings
- 💳 Multiple payment methods (Stripe, Mobile Money, Cash on Delivery)
- 📱 Mobile-first responsive design

### Admin Features
- 📊 Product management (CRUD operations)
- 📈 Order management
- 👥 User management
- 📊 Analytics dashboard

### Technical Features
- 🔒 Secure authentication with JWT
- 🎨 Beautiful UI with Tailwind CSS
- ⚡ Fast performance with optimized queries
- 📱 Fully responsive design
- 🌐 RESTful API
- 🔄 State management with Zustand
- 🎭 Smooth animations with Framer Motion
- 🔥 Hot module replacement for development

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, bcryptjs
- **Validation**: Express Validator
- **File Upload**: Multer
- **Email**: Nodemailer
- **Payment**: Stripe

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Build Tool**: Vite

## 📦 Project Structure

```
safehome-ecommerce/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   └── productController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── error.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Product.ts
│   │   │   ├── Order.ts
│   │   │   ├── Cart.ts
│   │   │   └── Review.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   └── productRoutes.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Header.tsx
    │   │   ├── Footer.tsx
    │   │   └── ProductCard.tsx
    │   ├── pages/
    │   │   ├── Home.tsx
    │   │   └── Shop.tsx
    │   ├── store/
    │   │   ├── authStore.ts
    │   │   └── cartStore.ts
    │   ├── types/
    │   │   └── index.ts
    │   ├── utils/
    │   │   └── api.ts
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/safehome-ecommerce
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

5. Start MongoDB:
```bash
# Using MongoDB service
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

6. Start the development server:
```bash
npm run dev
```

The backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional):
```bash
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on http://localhost:3000

## 🔧 Available Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/updateprofile` - Update user profile (Protected)
- `PUT /api/auth/updatepassword` - Update password (Protected)

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/slug/:slug` - Get product by slug
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)
- `GET /api/products/categories` - Get all categories

## 🎨 Key Improvements Over Original

### User Experience
1. **Modern Design**: Clean, contemporary UI with better visual hierarchy
2. **Smooth Animations**: Framer Motion for delightful interactions
3. **Better Navigation**: Intuitive menu structure and breadcrumbs
4. **Advanced Filtering**: Multiple filter options with instant results
5. **Mobile Optimized**: Perfect experience on all devices
6. **Fast Loading**: Optimized images and lazy loading

### Performance
1. **TypeScript**: Type safety and better developer experience
2. **Optimized Queries**: MongoDB indexes for faster searches
3. **Code Splitting**: Smaller bundle sizes
4. **Caching**: Browser and API caching strategies
5. **Compression**: Gzip compression for responses

### Security
1. **JWT Authentication**: Secure token-based auth
2. **Password Hashing**: bcrypt for password security
3. **Input Validation**: Server-side validation
4. **CORS Configuration**: Controlled cross-origin requests
5. **Helmet.js**: Security headers

### Developer Experience
1. **TypeScript**: Full type safety
2. **Hot Reload**: Fast development iteration
3. **ESLint**: Code quality enforcement
4. **Organized Structure**: Clean, maintainable codebase
5. **Environment Variables**: Secure configuration management

## 🔒 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/safehome-ecommerce
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
STRIPE_SECRET_KEY=your-stripe-key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚢 Deployment

### Backend Deployment (Railway, Render, Heroku)
1. Set environment variables
2. Update MongoDB URI to production database
3. Set NODE_ENV to 'production'
4. Deploy using platform CLI or Git

### Frontend Deployment (Vercel, Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set VITE_API_URL to production API URL

## 📝 License

This project is licensed under the ISC License.

## 👥 Contact

For support or inquiries:
- Email: info@safehomerwanda.com
- Phone: +250 726 168 023

## 🙏 Acknowledgments

- Original website: https://safehomerwanda.com/
- Built with modern web technologies
- Designed for the Rwandan market

---

**Built with ❤️ for Safe Home Rwanda**
