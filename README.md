# Smart Shopping List & Expense Manager

## Project Overview

You can view the live, production version of this front-end at:

> **GroceryMate Front-End (Netlify)**  
> https://grocerymate.netlify.app/home

---

## 📦 Installation & Local Development

1. **Clone the repository**  
   ```bash
   git clone https://github.com/Fruerdd/smart-shopping-list-expense-manager-fe.git
   cd smart-shopping-list-expense-manager-fe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start #or ng serve
   ```

---

The **Smart Shopping List & Expense Manager** is an Angular web application designed to help users efficiently manage their grocery shopping and expenses. It enables users to:

- Create and organize shopping lists
- Compare prices from registered markets
- Track spending habits
- Collaborate with family members or housemates

## Technology Stack

- **Backend:** Java, Spring  
- **Frontend:** Angular 19
- **Database:** PostgreSQL  
- **Hosting:** Netlify/Render

## Team Members & Feature Assignment

### **Team Member 1:** Amina 
- **User Authentication & Profile Management** – Sign up, log in, and manage profiles. [Issue #4](https://github.com/Fruerdd/smart-shopping-list-expense-manager-issues/issues/4)
- **Referral & Loyalty System** – Earn rewards for referring friends and accumulating loyalty points. [Issue #5](https://github.com/Fruerdd/smart-shopping-list-expense-manager-issues/issues/5)
- **Dark Mode Toggle** – Customize UI with light and dark mode. [Issue #6](https://github.com/Fruerdd/smart-shopping-list-expense-manager-issues/issues/6)

### **Team Member 2:** Tarik
- **Shopping List Management & Smart Item Search** – Search for and add items based on availability and pricing. [Issue #1](https://github.com/Fruerdd/smart-shopping-list-expense-manager-issues/issues/1)
- **Price Comparison & Intelligent Store Selection** – Compare prices and get smart store recommendations. [Issue #2](https://github.com/Fruerdd/smart-shopping-list-expense-manager-issues/issues/2)
- **Favorite Products & Stores** – Mark favorites for quick access and personalized recommendations. [Issue #3](https://github.com/Fruerdd/smart-shopping-list-expense-manager-issues/issues/3)

### **Team Member 3:** Pavel
- **Admin Management of Markets, Products & Users** – Manage market, product, and user data via an admin dashboard. [Issue #7](https://github.com/Fruerdd/smart-shopping-list-expense-manager-issues/issues/7)
- **Multi-User Sync & Shared Lists** – Sync and manage shared shopping lists. [Issue #8](https://github.com/Fruerdd/smart-shopping-list-expense-manager-issues/issues/8)
- **Expense Tracking & Budget Analytics** – Track grocery expenses and generate reports. [Issue #9](https://github.com/Fruerdd/smart-shopping-list-expense-manager-issues/issues/9)

## Site Map

![sitemap](https://github.com/Fruerdd/smart-shopping-list-expense-manager-issues/blob/main/sitemap.jpg)


## Mockups

- Visual mockups and wireframes will be designed using Figma.
- Each feature will have an associated wireframe illustrating its UI/UX.
- Mockups will be stored in the `mockups/` folder in the repository.
- [View the Figma Design](https://www.figma.com/design/XnMqWbvwiok3RbDHW1Vm1q/SE-Project?node-id=434-428&t=ghnVfiVUUWDewfmv-1)

## Frontend Features & Architecture

### Key UI Components
- **Angular Material Design** - Modern, responsive UI components
- **Bootstrap 5** - Grid system and utility classes
- **Ignite UI Angular** - Advanced data grids and charts
- **Chart.js** - Interactive data visualization for analytics
- **QR Code Generation** - For loyalty program and sharing features

### Main Application Modules
- **Authentication Module** - Login, register, profile management
- **Shopping Lists Module** - Create, manage, and collaborate on lists
- **Products Module** - Search, favorites, price comparison
- **Analytics Module** - Expense tracking and spending insights
- **Admin Module** - Store and product management (admin users)
- **Notifications Module** - Real-time updates and friend requests

### Data Integration
The frontend consumes data from the backend API which maintains:
- Product catalog with pricing across different stores
- User profiles and authentication
- Shopping list data with real-time collaboration
- Analytics and expense tracking data
- Market and store information managed by administrators

## Intelligent Shopping List Management

Users can:

- **Search for Items:** Items available will appear under the search bar.
- **Smart Store Selection:** Automatically selects the product from:
  - The cheapest store
  - A preferred store (if set)
  - A favorite store (based on past purchases)
- **Grouped Shopping Logic:** Ensures most items are bought from the same store unless price differences are significant.
- **Manual Store Selection:** Users can override automatic selection.

## Referral & Loyalty System

### **Referral System**
- Users can invite friends via a unique referral code or link.
- Both the referrer and the new user receive rewards upon sign-up and first purchase.
- The system tracks successful referrals.

### **Loyalty Program**
- Users earn points for purchases.
- Points can be redeemed for discounts and exclusive deals.
- Loyalty tiers (Bronze, Silver, Gold) offer increasing rewards.

## API Documentation

### **API Endpoints**

#### **Authentication Endpoints**
| Method | URL Path         | Request       | Response       | Description                          |
|--------|------------------|---------------|----------------|--------------------------------------|
| POST   | `/auth/register` | `RegisterDTO` | `String`       | Registers a new user                 |
| POST   | `/auth/login`    | `AuthDTO`     | `AuthResponse` | Authenticates user and returns token |

#### **User Profile & Management Endpoints**
| Method | URL Path                            | Request         | Response        | Description                    |
|--------|-------------------------------------|-----------------|-----------------|--------------------------------|
| GET    | `/user/profile/{id}`                | -               | `UserDTO`       | Gets user profile by ID        |
| GET    | `/user/profile/me`                  | -               | `UserDTO`       | Gets current user profile      |
| PUT    | `/user/profile/{id}`                | `UserDTO`       | `UserDTO`       | Updates user profile           |
| PATCH  | `/user/profile/{id}`                | `UserDTO`       | `UserDTO`       | Partially updates user profile |
| POST   | `/user/profile/upload-picture/{id}` | `MultipartFile` | `String`        | Uploads profile picture        |
| GET    | `/user/search`                      | `?q=query`      | `List<UserDTO>` | Searches users                 |

#### **Friends & Social Endpoints**
| Method | URL Path                     | Request             | Response        | Description             |
|--------|------------------------------|---------------------|-----------------|-------------------------|
| GET    | `/user/friends/{id}`         | -                   | `List<UserDTO>` | Gets user's friends     |
| POST   | `/user/friends/{id}/request` | `?friendId=uuid`    | `String`        | Sends friend request    |
| POST   | `/user/friends/{id}/accept`  | `?requesterId=uuid` | `String`        | Accepts friend request  |
| POST   | `/user/friends/{id}/decline` | `?requesterId=uuid` | `String`        | Declines friend request |
| DELETE | `/user/friends/{id}/remove`  | `?friendId=uuid`    | `String`        | Removes friend          |

#### **Loyalty & Referral Endpoints**
| Method | URL Path                            | Request                         | Response  | Description              |
|--------|-------------------------------------|---------------------------------|-----------|--------------------------|
| GET    | `/user/profile/loyalty-points/{id}` | -                               | `Integer` | Gets user loyalty points |
| PUT    | `/user/profile/loyalty-points/{id}` | `?points=number`                | `Integer` | Updates loyalty points   |
| POST   | `/user/profile/award-points/{id}`   | `?activity=string&count=number` | `String`  | Awards loyalty points    |
| POST   | `/user/profile/referral/{id}`       | `?referralCode=string`          | `String`  | Applies referral code    |
| GET    | `/user/profile/referral-code/{id}`  | -                               | `String`  | Gets user referral code  |

#### **Notifications Endpoints**
| Method | URL Path                                    | Request | Response                | Description                     |
|--------|---------------------------------------------|---------|-------------------------|---------------------------------|
| GET    | `/user/notifications/{id}`                  | -       | `List<NotificationDTO>` | Gets user notifications         |
| GET    | `/user/notifications/{id}/unread`           | -       | `List<NotificationDTO>` | Gets unread notifications       |
| GET    | `/user/notifications/{id}/count`            | -       | `Long`                  | Gets unread notification count  |
| PATCH  | `/user/notifications/{notificationId}/read` | -       | `String`                | Marks notification as read      |
| PATCH  | `/user/notifications/{id}/read-all`         | -       | `String`                | Marks all notifications as read |

#### **Shopping List Management Endpoints**
| Method | URL Path                                 | Request           | Response                | Description                |
|--------|------------------------------------------|-------------------|-------------------------|----------------------------|
| POST   | `/api/shopping-lists`                    | `ShoppingListDTO` | `ShoppingListDTO`       | Creates shopping list      |
| GET    | `/api/shopping-lists/{id}`               | -                 | `ShoppingListDTO`       | Gets shopping list by ID   |
| GET    | `/api/shopping-lists/user/{userId}`      | -                 | `List<ShoppingListDTO>` | Gets user's shopping lists |
| PUT    | `/api/shopping-lists/{id}`               | `ShoppingListDTO` | `ShoppingListDTO`       | Updates shopping list      |
| PUT    | `/api/shopping-lists/{id}/soft-delete`   | -                 | `Void`                  | Soft deletes shopping list |
| GET    | `/api/shopping-lists/{id}/collaborators` | -                 | `List<CollaboratorDTO>` | Gets list collaborators    |

#### **Product & Store Search Endpoints**
| Method | URL Path                                               | Request        | Response                    | Description                     |
|--------|--------------------------------------------------------|----------------|-----------------------------|---------------------------------|
| GET    | `/api/shopping-lists/products`                         | -              | `List<ShoppingListItemDTO>` | Gets all products               |
| GET    | `/api/shopping-lists/products/search`                  | `?term=string` | `List<ShoppingListItemDTO>` | Searches products               |
| GET    | `/api/shopping-lists/products/category/{categoryId}`   | -              | `List<ShoppingListItemDTO>` | Gets products by category       |
| GET    | `/api/shopping-lists/categories`                       | -              | `List<CategoryDTO>`         | Gets all categories             |
| GET    | `/api/shopping-lists/sidebar-categories`               | -              | `List<CategoryDTO>`         | Gets sidebar categories         |
| GET    | `/api/shopping-lists/stores`                           | -              | `List<StoreDTO>`            | Gets all available stores       |
| GET    | `/api/shopping-lists/items/{itemId}/price-comparisons` | -              | `List<StoreItemDTO>`        | Gets price comparisons for item |

#### **User Dashboard Endpoints**
| Method | URL Path                                        | Request | Response                   | Description                       |
|--------|-------------------------------------------------|---------|----------------------------|-----------------------------------|
| GET    | `/api/users/{id}`                               | -       | `UserDTO`                  | Gets user by ID                   |
| GET    | `/api/users/{id}/favorite-products`             | -       | `List<FavoriteProductDTO>` | Gets user's favorite products     |
| POST   | `/api/users/{id}/favorite-products/{productId}` | -       | `FavoriteProductDTO`       | Adds favorite product             |
| DELETE | `/api/users/{id}/favorite-products/{productId}` | -       | `Void`                     | Removes favorite product          |
| GET    | `/api/users/{id}/favorite-stores`               | -       | `List<FavoriteStoreDTO>`   | Gets user's favorite stores       |
| POST   | `/api/users/{id}/favorite-stores/{storeId}`     | -       | `FavoriteStoreDTO`         | Adds favorite store               |
| DELETE | `/api/users/{id}/favorite-stores/{storeId}`     | -       | `Void`                     | Removes favorite store            |
| GET    | `/api/users/{id}/products/{productId}/prices`   | -       | `List<StorePriceDTO>`      | Gets product prices across stores |
| GET    | `/api/users/loyalty/{userId}`                   | -       | `LoyaltyTierEnum`          | Gets user loyalty tier            |

#### **User Analytics Endpoints**
| Method | URL Path                         | Request | Response                 | Description                      |
|--------|----------------------------------|---------|--------------------------|----------------------------------|
| GET    | `/api/profile/money-spent`       | -       | `List<MoneySpentDTO>`    | Gets money spent analytics       |
| GET    | `/api/profile/category-spending` | -       | `List<CategorySpendDTO>` | Gets category spending breakdown |
| GET    | `/api/profile/price-averages`    | -       | `List<PriceAverageDTO>`  | Gets price averages              |
| GET    | `/api/profile/store-expenses`    | -       | `List<StoreExpenseDTO>`  | Gets store expense breakdown     |
| GET    | `/api/profile/savings`           | -       | `List<SavingDTO>`        | Gets savings analytics           |

#### **Admin Store Management Endpoints**
| Method | URL Path                         | Request                | Response                | Description             |
|--------|----------------------------------|------------------------|-------------------------|-------------------------|
| GET    | `/api/stores`                    | -                      | `List<StoreDTO>`        | Gets all stores         |
| POST   | `/api/stores`                    | `StoreCreateUpdateDTO` | `StoreDTO`              | Creates new store       |
| PUT    | `/api/stores/{storeId}`          | `StoreCreateUpdateDTO` | `StoreDTO`              | Updates store           |
| GET    | `/api/stores/{storeId}`          | -                      | `StoreDTO`              | Gets store by ID        |
| GET    | `/api/stores/{storeId}/products` | -                      | `List<StoreProductDTO>` | Gets products for store |
| GET    | `/api/stores/popular`            | -                      | `List<PopularShopDTO>`  | Gets popular stores     |

#### **Admin Product Management Endpoints**
| Method | URL Path             | Request               | Response        | Description        |
|--------|----------------------|-----------------------|-----------------|--------------------|
| POST   | `/api/products/bulk` | `List<AddProductDTO>` | `BulkResultDTO` | Bulk adds products |

#### **Admin Analytics Endpoints**
| Method | URL Path                                  | Request | Response                     | Description                   |
|--------|-------------------------------------------|---------|------------------------------|-------------------------------|
| GET    | `/api/products/analytics/daily-searches`  | -       | `List<DailySearchDTO>`       | Gets daily search analytics   |
| GET    | `/api/products/analytics/weekly-adds`     | -       | `List<DailySearchDTO>`       | Gets weekly product additions |
| GET    | `/api/products/analytics/monthly-adds`    | -       | `List<MonthlyProductAddDTO>` | Gets monthly additions        |
| GET    | `/api/products/analytics/weekly-searches` | -       | `List<DailySearchDTO>`       | Gets weekly search analytics  |
| GET    | `/api/products/analytics/top`             | -       | `List<TopProductDTO>`        | Gets top products             |

#### **Health Check Endpoint**
| Method | URL Path  | Request | Response              | Description           |
|--------|-----------|---------|-----------------------|-----------------------|
| GET    | `/health` | -       | `Map<String, Object>` | Health check endpoint |

### **Data Transfer Objects (DTOs)**

#### **Authentication DTOs**


`RegisterDTO`:
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```
`AuthDTO`:
```json
{
  "email": "string",
  "password": "string"
}
```
`AuthResponse`:
```json
{
  "token": "string",
  "message": "string",
  "userType": "string"
}
```

#### **User DTOs**
`UserDTO`:
```json
{
  "id": "uuid",
  "email": "string",
  "name": "string",
  "phone": "string",
  "address": "string",
  "avatar": "string",
  "loyaltyTier": "BRONZE|SILVER|GOLD",
  "bonus_points": "integer",
  "loyaltyPoints": "integer",
  "couponCode": "string",
  "creditsAvailable": "double",
  "qrCodeValue": "string",
  "shoppingLists": "List<ShoppingListDTO>"
}
```
`UserStatisticsDTO`:
```json
{
  "totalShoppingLists": "integer",
  "totalFriends": "integer",
  "totalLoyaltyPoints": "integer",
  "totalExpenses": "double"
}
```

#### **Shopping List DTOs**
`ShoppingListDTO`:
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "listType": "string",
  "isActive": "boolean",
  "ownerId": "uuid",
  "ownerName": "string",
  "ownerAvatar": "string",
  "storeId": "uuid",
  "storeName": "string",
  "image": "string",
  "category": "string",
  "createdAt": "instant",
  "updatedAt": "instant",
  "items": "List<ShoppingListItemDTO>",
  "collaborators": "List<CollaboratorDTO>"
}
```
`ShoppingListItemDTO`:
```json
{
  "id": "uuid",
  "productId": "uuid",
  "productName": "string",
  "image": "string",
  "price": "double",
  "storeName": "string",
  "categoryId": "uuid",
  "quantity": "double",
  "isChecked": "boolean",
  "status": "string"
}
```
`CollaboratorDTO`:
```json
{
  "userId": "uuid",
  "userName": "string",
  "permission": "VIEW|EDIT"
}
```

#### **Product & Store DTOs**
`ProductDTO`:
```json
{
  "id": "uuid",
  "name": "string",
  "category": "CategoryEntity"
}
```
`StoreDTO`:
```json
{
  "id": "uuid",
  "name": "string",
  "icon": "string"
}
```
`CategoryDTO`:
```json
{
  "id": "uuid",
  "name": "string",
  "icon": "string",
  "products": "List<ShoppingListItemDTO>"
}
```
`StorePriceDTO`:
```json
{
  "storeId": "uuid",
  "storeName": "string",
  "price": "BigDecimal"
}
```
`StoreItemDTO`:
```json
{
  "storeId": "uuid",
  "storeName": "string",
  "storeIcon": "string",
  "price": "double"
}
```

#### **Favorites DTOs**
`FavoriteProductDTO`:
```json
{
  "id": "uuid",
  "productId": "uuid",
  "productName": "string"
}
```
`FavoriteStoreDTO`:
```json
{
  "id": "uuid",
  "storeId": "uuid",
  "storeName": "string"
}
```

#### **Notification DTO**
`NotificationDTO`:
```json
{
  "id": "uuid",
  "sourceUserId": "uuid",
  "sourceUserName": "string",
  "sourceUserAvatar": "string",
  "destinationUserId": "uuid",
  "title": "string",
  "message": "string",
  "notificationType": "string",
  "isRead": "boolean",
  "createdAt": "instant"
}
```

#### **Analytics DTOs**
`MoneySpentDTO`:
```json
{
  "month": "string",
  "thisYear": "double",
  "lastYear": "double"
}
```
`CategorySpendDTO`:
```json
{
  "category": "string",
  "spent": "double"
}
```
`PriceAverageDTO`:
```json
{
  "product": "string",
  "averagePrice": "double"
}
```
`StoreExpenseDTO`:
```json
{
  "store": "string",
  "spent": "double"
}
```
`SavingDTO`:
```json
{
  "month": "string",
  "saved": "double"
}
```

#### **Admin DTOs**
`StoreCreateUpdateDTO`:
```json
{
  "name": "string",
  "icon": "string",
  "location": "string",
  "contact": "string"
}
```
`StoreProductDTO`:
```json
{
  "storePriceId": "string",
  "storeId": "string",
  "productId": "string",
  "productName": "string",
  "category": "string",
  "description": "string",
  "isActive": "boolean",
  "price": "double",
  "barcode": "string"
}
```
`AddProductDTO`:
```json
{
  "storePriceId": "uuid",
  "storeId": "uuid",
  "productId": "uuid",
  "productName": "string",
  "category": "string",
  "description": "string",
  "isActive": "boolean",
  "price": "BigDecimal",
  "barcode": "string"
}
```
`BulkResultDTO`:
```json
{
  "success": "boolean",
  "errors": "List<string>",
  "count": "integer"
}
```
`PopularShopDTO`:
```json
{
  "storeId": "uuid",
  "storeName": "string",
  "usageCount": "long"
}
```
`DailySearchDTO`:
```json
{
  "date": "string",
  "searches": "long"
}
```
`MonthlyProductAddDTO`:
```json
{
  "month": "string",
  "products": "long"
}
```
`TopProductDTO`:
```json
{
  "productName": "string",
  "usageCount": "long"
}
```

## Local Development Setup

### Prerequisites
- **Node.js 18+** or higher
- **npm 8+** or higher
- **Angular CLI 19+**
- **Git**

### Environment Configuration
The application uses environment files for different deployment configurations:
- `src/environments/environment.ts` - Development environment
- `src/environments/environment.prod.ts` - Production environment

### Setup Steps
1. **Clone the Repository**
   ```bash
   git clone https://github.com/Fruerdd/smart-shopping-list-expense-manager-fe.git
   cd smart-shopping-list-expense-manager-fe
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Install Angular CLI (if not already installed)**
   ```bash
   npm install -g @angular/cli
   ```

4. **Configure Backend Connection**
   - For development: Backend runs on `http://localhost:8080`
   - For production: Backend runs on `https://smart-shopping-list-api.onrender.com`
   - Proxy configuration in `src/proxy.conf.json` handles API calls during development

5. **Run the Development Server**
   ```bash
   npm start
   # or
   ng serve
   ```

6. **Run with Proxy (Recommended for API calls)**
   ```bash
   ng serve --proxy-config src/proxy.conf.json
   ```

7. **Verify Setup**
   - Application runs on `http://localhost:4200`
   - API calls are proxied to backend server
   - Hot reload is enabled for development

### Available Scripts
```bash
npm start          # Start development server
npm run build      # Build for production
npm run build:prod # Build for production (optimized)
npm run watch      # Build and watch for changes
```

### Key Dependencies
- **Angular 19.2.3** - Main framework
- **Angular Material 19.2.6** - UI components
- **Bootstrap 5.3.3** - CSS framework
- **Chart.js 4.4.9** - Data visualization
- **Ignite UI Angular 19.2.8** - Advanced UI components
- **QR Code Generator** - For loyalty program QR codes

## Deployment Setup

### Frontend Deployment (Netlify)

**Platform:** Netlify  
**Frontend URL:** `https://grocerymate.netlify.app`  
**Backend API:** `https://smart-shopping-list-api.onrender.com`

#### Deployment Configuration
The project is configured for automatic deployment to Netlify:

**netlify.toml Configuration:**
```toml
[build]
  command = "ng build --configuration=production"
  publish = "dist/browser"

  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
```

#### Setup Steps:
1. **Connect Repository to Netlify**
   - Link your GitHub repository to Netlify
   - Set build command: `ng build --configuration=production`
   - Set publish directory: `dist/browser`

2. **Environment Configuration**
   - Production environment automatically uses backend API
   - No additional environment variables needed for basic setup

3. **Automatic Deployment**
   - Pushes to main branch automatically trigger deployment
   - Build process runs Angular production build
   - SPA routing handled by redirect rules

#### Build Process
```bash
# Local production build
npm run build:prod

# Files generated in dist/browser/
# - index.html
# - main.js (bundled and minified)
# - styles.css (optimized)
# - assets/ (images, fonts, etc.)
```

### Backend Connection
- **Development:** `http://localhost:8080` (via proxy)
- **Production:** `https://smart-shopping-list-api.onrender.com`
- **Authentication:** JWT tokens stored in localStorage
- **API Calls:** All `/api/*` routes proxied in development

### Development vs Production
| Environment | Frontend URL                      | Backend API                                    | Configuration            |
|-------------|-----------------------------------|------------------------------------------------|--------------------------|
| Development | `http://localhost:4200`           | `http://localhost:8080`                        | `environment.ts` + proxy |
| Production  | `https://grocerymate.netlify.app` | `https://smart-shopping-list-api.onrender.com` | `environment.prod.ts`    |

## Troubleshooting

### Common Development Issues

**CORS Errors:**
- Ensure the backend server is running on `http://localhost:8080`
- Use the proxy configuration: `ng serve --proxy-config src/proxy.conf.json`

**API Connection Issues:**
- Check that backend API is accessible
- Verify environment configuration in `src/environments/`
- Check browser network tab for failed requests

**Build Issues:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Angular cache: `ng cache clean`
- Check TypeScript compatibility with Angular version

**Authentication Issues:**
- Check that JWT tokens are being stored in localStorage
- Verify token expiration (tokens expire after 10 hours)
- Ensure backend API is returning valid authentication responses

## Out of Scope

- **AI-based purchase predictions:** Not included in the initial version.
- **Real-time Store Inventory:** Live stock updates not implemented initially.
- **Mobile App Version:** Initially, the application is web-based.
- **Barcode Scanning:** Mobile barcode scanning for quick product lookup.
- **Recipe Integration:** Meal planning and automatic shopping list generation from recipes.
- **Nutritional Analysis:** Tracking nutritional content of purchased items.
- **Price History Tracking:** Historical price trends and predictions.
- **Budget Planning:** Advanced budget forecasting and planning tools.
- **Multi-Language Support:** Localization for multiple languages.
- **OCR Receipt Scanning:** Automatic receipt processing and expense tracking.
- **Personalized Recommendations:** AI-powered product suggestions.
