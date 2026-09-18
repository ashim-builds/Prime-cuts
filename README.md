# Crispy Chips 🍟 — Online Store & Admin Panel

Crispy Chips is a modern, responsive web application for ordering and managing crispy Nepalese snacks. Built on Next.js, it features real-time order tracking, live admin updates, and integrated PWA Push Notifications.

---

## Features 🚀

### 🛒 Customer Storefront
* **Dynamic Menu & Shopping Cart**: Supports ordering by variant (e.g. Chatpat variant sizing) or custom weight packaging (e.g. per 250g, 500g, 1kg).
* **Live Order Tracker**: Customers can monitor their order status in real time (Pending, Preparing, Ready, Delivered).
* **PWA Capability**: Can be installed on mobile/desktop screens as a standalone application.
* **Web Push Notifications**: Real-time push alerts on order progress even when the tab is closed.

### 💼 Admin protected Dashboard
* **Real-time Live Analytics**: Interactive counts of total products, stock levels, and pending order triggers (via Server Actions & API polling).
* **Order Fulfilment Panel**: Live order streams where admins can modify status (e.g., mark as preparing, ready, delivered) or update payment records (COD / Paid).
* **Push Broadcast Alert**: Subscribed admin browsers receive native desktop alerts the second a checkout is placed.

---

## Technology Stack 🛠️

* **Framework**: Next.js 16 (App Router)
* **Styling**: Vanilla CSS + TailwindCSS (for utility layout components)
* **Database**: MongoDB (Mongoose Schema modeling)
* **File Uploads**: Cloudinary API (for product listing cover and gallery images)
* **Authentication**: Next.js JWT Sessions + Google OAuth login
* **Push Provider**: Web Push Protocol (using VAPID public/private key-pairs)

---

## Getting Started ⚙️

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **MongoDB** (running locally or cloud cluster) installed.

### 2. Configure Environment Variables
Create a `.env.local` file at the project root matching the template below (refer to `.env.example` for details):

```env
MONGODB_URI=mongodb://localhost:27017/crispychips
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_signing_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:admin@yourdomain.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Running the App

#### Development Mode (Fast Refresh)
*Note: Service workers and PWA push notifications are deactivated by design in dev mode.*
```bash
npm run dev
# Server runs on http://localhost:3000
```

#### Production Build & Local Test (With PWA & Push Notifications)
To test service workers and real push updates locally, build the project and launch on a custom port:
```bash
# 1. Compile optimized build
npm run build

# 2. Start the production preview server
npm start -- -p 3001
# Server runs on http://localhost:3001
```

---

## Push Notifications setup 🛎️

1. **VAPID Key Generation**: If you need new push keys, run:
   ```bash
   npx web-push generate-vapid-keys
   ```
2. **Accepting Browser Permissions**:
   * Open `http://localhost:3001` or `http://localhost:3001/admin`.
   * Click the **Bell Icon** (navbar for customer, sidebar for admin).
   * Click **Subscribe Now** and tap **Allow** on the browser security pop-up.
3. **PWA Emulator Testing Tip**: 
   Chrome's simulated mobile view (DevTools emulator) blocks system alert dialog prompts. Toggle off emulator mode, accept the permission prompt, and then toggle emulator mode back on.

---

## Deployment 🌐

### Hosting on Vercel + MongoDB Atlas
1. Create a cloud database cluster at **MongoDB Atlas** (Free tier). Enable network access from all IPs (`0.0.0.0/32`).
2. Push your project code to **GitHub**.
3. Link your GitHub repo to **Vercel** and import the project.
4. Add all environment variables (from `.env.local`) to Vercel's Dashboard Settings:
   * Point `MONGODB_URI` to your cloud Atlas connection string.
   * Point `NEXT_PUBLIC_SITE_URL` to your live Vercel domain.
5. Click **Deploy**. Update your Google Developer Console's Redirect URI with your new live URL.
