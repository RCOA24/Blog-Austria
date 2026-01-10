

<div align="center">

# 📝 Full-Stack Blog Application

### *A Modern React Blog Platform with Complete CRUD Operations*

![React](https://img.shields.io/badge/React-18.x-61dafb?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Redux](https://img.shields.io/badge/Redux_Toolkit-2.x-764abc?style=for-the-badge&logo=redux&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)

**[🌐 Live Demo](INSERT_YOUR_VERCEL/NETLIFY_LINK)** • **[📂 Source Code]https://github.com/RCOA24/Blog-Austria**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Database Setup](#-database-setup)
- [Project Structure](#-project-structure)
- [Security Implementation](#-security-implementation)
- [Assessment Highlights](#-assessment-highlights)

---

## 🎯 Overview

A production-ready blog application demonstrating modern full-stack development practices. Built as a comprehensive technical assessment showcasing proficiency in **React**, **TypeScript**, **Redux state management**, **Supabase backend integration**, and **secure authentication** patterns.

### Core Capabilities
✅ **Complete CRUD Operations** - Create, Read, Update, and Delete blog posts  
✅ **Secure Authentication** - Email/password registration and login system  
✅ **Row-Level Security** - Backend-enforced user permissions via Supabase RLS  
✅ **State Management** - Centralized Redux Toolkit store with typed hooks  
✅ **Pagination** - Efficient data loading (5 posts per page)  
✅ **Protected Routes** - Client-side route guards for authenticated actions  
✅ **Responsive Design** - Mobile-first Tailwind CSS styling  

---

## 🚀 Key Features

### 🔐 Authentication System
- **User Registration** - Email/password signup with instant access
- **Secure Login/Logout** - JWT-based session management via Supabase Auth
- **Protected Routes** - Unauthenticated users redirected from create/edit pages
- **Persistent Sessions** - Automatic session restoration on page reload

### 📰 Blog Post Management
| Feature | Description | Security |
|---------|-------------|----------|
| **Create** | Authenticated users can publish new posts | User ID attached to posts |
| **Read** | Public access to all published posts | No authentication required |
| **Update** | Edit your own posts only | RLS policy enforced |
| **Delete** | Remove your own posts only | RLS policy enforced |
| **Pagination** | Browse posts 5 at a time | Optimized queries |

### ⚡ Performance & UX
- **Optimistic Updates** - Immediate UI feedback with background sync
- **Loading States** - Clear indicators during async operations
- **Error Handling** - User-friendly error messages
- **Type Safety** - Full TypeScript coverage for reliability

---

## 🛠 Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### Frontend
- **Framework:** React 18 with Vite
- **Language:** TypeScript 5
- **State Management:** Redux Toolkit
- **Routing:** React Router DOM v6
- **Styling:** Tailwind CSS 3
- **Build Tool:** Vite (Lightning-fast HMR)

</td>
<td valign="top" width="50%">

### Backend & Infrastructure
- **BaaS:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Database:** PostgreSQL with RLS
- **Real-time:** Supabase Realtime (ready to integrate)
- **Hosting:** Vercel/Netlify (deployment-ready)

</td>
</tr>
</table>

---

## 📸 Screenshots

> *Add screenshots here to showcase your application's UI*

<div align="center">

| Home Page | Post Creation |
|-----------|---------------|
| *List view with pagination* | *Rich text editor* |

| Authentication | Post Management |
|----------------|-----------------|
| *Login/Register forms* | *Edit/Delete controls* |

</div>

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm/yarn
- **Supabase Account** (free tier available)
- **Git** for version control

### Installation Steps

**1️⃣ Clone the Repository**
```bash
git clone [YOUR_GITHUB_REPO_URL]
cd blog-app
```

**2️⃣ Install Dependencies**
```bash
npm install
# or
yarn install
```

**3️⃣ Environment Configuration**

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> 💡 **Tip:** Find your Supabase credentials at: `Project Settings → API`

**4️⃣ Run Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
npm run preview  # Preview production build locally
```

---

## 🗄️ Database Setup

### Supabase Configuration

**Step 1: Create a Supabase Project**
1. Visit [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to initialize

**Step 2: Execute SQL Schema**

Navigate to **SQL Editor** in your Supabase dashboard and run:

```sql
-- ============================================
-- Blog Application Database Schema
-- ============================================

-- 1. Create the 'posts' table
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 3. Create Security Policies

-- Policy 1: Public read access (anyone can view posts)
CREATE POLICY "Public posts are viewable by everyone" 
  ON public.posts 
  FOR SELECT 
  USING (true);

-- Policy 2: Authenticated users can create posts
CREATE POLICY "Users can insert their own posts" 
  ON public.posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own posts only
CREATE POLICY "Users can update own posts" 
  ON public.posts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy 4: Users can delete their own posts only
CREATE POLICY "Users can delete own posts" 
  ON public.posts 
  FOR DELETE 
  USING (auth.uid() = user_id);
```

**Step 3: Disable Email Confirmation (Testing Only)**

For easier testing during development:
1. Go to **Authentication → Providers → Email**
2. Toggle **OFF** "Confirm Email"

> ⚠️ **Production Note:** Re-enable email confirmation for production deployments

---

## 📂 Project Structure

```
blog-app/
├── src/
│   ├── app/
│   │   ├── store.ts              # Redux store configuration
│   │   └── hooks.ts              # Typed useAppDispatch & useAppSelector
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── authSlice.ts      # Authentication state & reducers
│   │   │   └── authThunks.ts     # Async login/register/logout
│   │   │
│   │   └── posts/
│   │       ├── postsSlice.ts     # Blog posts state & reducers
│   │       └── postsThunks.ts    # Async CRUD operations
│   │
│   ├── components/
│   │   ├── Navbar.tsx            # Navigation with auth status
│   │   ├── ProtectedRoute.tsx    # Route guard component
│   │   └── PostCard.tsx          # Reusable blog post display
│   │
│   ├── pages/
│   │   ├── Home.tsx              # Landing page with post list
│   │   ├── Login.tsx             # Authentication page
│   │   ├── Register.tsx          # User signup page
│   │   ├── CreatePost.tsx        # New post creation
│   │   └── EditPost.tsx          # Post editing interface
│   │
│   ├── supabaseClient.ts         # Supabase initialization
│   ├── App.tsx                   # Main app component with routing
│   └── main.tsx                  # Application entry point
│
├── public/                       # Static assets
├── .env                          # Environment variables (git-ignored)
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── package.json                  # Dependencies & scripts
```

---

## 🔒 Security Implementation

### Row-Level Security (RLS)
Supabase RLS policies enforce security at the **database level**, preventing unauthorized access even if frontend validation is bypassed:

| Operation | Policy | Enforcement |
|-----------|--------|-------------|
| **SELECT** | Public read | Anyone can view posts |
| **INSERT** | User validation | `auth.uid() = user_id` check |
| **UPDATE** | Ownership check | Only post author can edit |
| **DELETE** | Ownership check | Only post author can delete |

### Frontend Security
- **Protected Routes:** Unauthenticated users cannot access create/edit pages
- **Conditional Rendering:** Edit/Delete buttons only shown to post owners
- **Type Safety:** TypeScript prevents runtime type errors
- **Input Validation:** Form validation before submission

---

## 🎓 Assessment Highlights

This project demonstrates proficiency in:

### Technical Skills Showcased

✨ **Modern React Patterns**
- Functional components with hooks
- Custom hooks for code reuse
- Component composition and reusability

✨ **State Management Excellence**
- Redux Toolkit for global state
- Normalized state structure
- Async thunk patterns for API calls
- Typed selectors and dispatchers

✨ **TypeScript Mastery**
- Interface definitions for all data models
- Type-safe Redux configuration
- Generic types for reusable components
- Strict mode enabled

✨ **Backend Integration**
- RESTful API consumption
- Real-time database integration
- Secure authentication flows
- Error handling and loading states

✨ **Best Practices**
- Clean, readable code structure
- Separation of concerns (components, features, pages)
- Environment variable management
- Git workflow with meaningful commits

### Key Implementation Details

🔹 **Pagination Logic:** Implemented using Supabase's `range()` query for efficient data loading  
🔹 **Session Persistence:** Redux state hydrated from Supabase session on app load  
🔹 **Optimistic Updates:** UI updates immediately while background sync occurs  
🔹 **Error Boundaries:** Graceful error handling throughout the application  

---

<div align="center">

## 📬 Contact & Feedback

**Questions about implementation?** Feel free to reach out!

---

*for technical assessment demonstration*

**⭐ If you find this project helpful, please consider giving it a star!**

</div>
