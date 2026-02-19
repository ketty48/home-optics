# Quick Start Guide - Safe Home Rwanda E-Commerce

## 🚀 5-Minute Setup

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

### Step 2: Setup Environment

**Backend (.env)**
```bash
cd backend
cp .env.example .env
```

Edit `.env` and set:
```env
MONGODB_URI=mongodb://localhost:27017/safehome-ecommerce
JWT_SECRET=mysecretkey123
```

### Step 3: Start MongoDB

```bash
# Option 1: System service
sudo systemctl start mongod

# Option 2: Docker
docker run -d -p 27017:27017 mongo
```

### Step 4: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 5: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health

## 📝 First Steps

1. **Browse Products**: Visit http://localhost:3000
2. **Register Account**: Click "Login" → "Register"
3. **Add to Cart**: Browse products and add items
4. **Checkout**: View cart and proceed to checkout

## 🛠️ Development Tips

### Hot Reload
Both frontend and backend support hot reload. Changes will reflect automatically.

### TypeScript
The project uses TypeScript for type safety. Your IDE should provide autocompletion.

### Database Access
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/safehome-ecommerce

# View collections
show collections

# View products
db.products.find().pretty()
```

### API Testing
Use tools like Postman or Thunder Client to test API endpoints.

Example Register Request:
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+250123456789"
}
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `sudo systemctl status mongod`
- Check MongoDB URI in .env file
- Try: `sudo systemctl restart mongod`

### Port Already in Use
```bash
# Backend (port 5000)
lsof -ti:5000 | xargs kill -9

# Frontend (port 3000)
lsof -ti:3000 | xargs kill -9
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Rebuild TypeScript
npm run build
```

## 📚 Next Steps

1. **Add Sample Data**: Create products via API or admin panel
2. **Customize Design**: Edit Tailwind config and components
3. **Add Features**: Implement remaining pages (Cart, Checkout, Profile)
4. **Deploy**: Follow deployment guide in README.md

## 🎯 Key Features to Implement

- [ ] Shopping Cart Page
- [ ] Checkout Flow
- [ ] User Profile Page
- [ ] Order History
- [ ] Product Details Page
- [ ] Admin Dashboard
- [ ] Payment Integration
- [ ] Email Notifications
- [ ] Search Functionality
- [ ] Reviews & Ratings

## 💡 Pro Tips

1. Use browser DevTools for debugging
2. Check console for errors and logs
3. Use React DevTools for component inspection
4. Monitor network requests in browser
5. Keep terminal output visible for backend logs

## 📞 Need Help?

- Check README.md for detailed documentation
- Review code comments
- Check API endpoints documentation
- Contact: info@safehomerwanda.com

Happy Coding! 🚀
