<div align="center">

# 📝 Full-Stack Blog Application

### *A Modern React Blog Platform with Complete CRUD Operations*

![React](https://img.shields.io/badge/React-19.x-61dafb?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Redux](https://img.shields.io/badge/Redux_Toolkit-2.x-764abc?style=for-the-badge&logo=redux&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.x-646cff?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)

</div>

---

## 📋 Table of Contents

- [Assessment Requirements](#-assessment-requirements)
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Database Setup](#-database-setup)
- [Project Structure](#-project-structure)
- [Security Implementation](#-security-implementation)

---

## 📋 Assessment Requirements

> **Note:** This project is strictly for a technical assessment demonstration.

This application was built to fullfill the following specific trainee assessment criteria:

**Core Objective:** Build a simple blog web application using ReactJS in 5 days.

**Conditions & Status:**
- [x] **Tech Stack:** Use TypeScript
- [x] **State Management:** Use Redux
- [x] **Backend:** Use Supabase
- [x] **Authentication Pages:**
  - [x] Registration (Email confirmation disabled)
  - [x] Login
  - [x] Logout
- [x] **Blog Operations:**
  - [x] Create a blog
  - [x] Update a blog
  - [x] Delete a blog
  - [x] Listing blogs with pagination
- [x] **Deployment:**
  - [x] Deploy to public host (Vercel/Netlify)
  - [x] Provide GitHub Repository

---

## 🎯 Overview

A production-ready blog application demonstrating modern full-stack development practices. Built as a comprehensive technical assessment showcasing proficiency in **React 19**, **TypeScript**, **Redux state management**, **Supabase backend integration**, and **secure authentication** patterns.

### Core Capabilities
✅ **Complete CRUD Operations** - Create, Read, Update, and Delete blog posts  
✅ **Secure Authentication** - Email/password registration and login system via Supabase Auth  
✅ **Row-Level Security** - Backend-enforced user permissions via Supabase RLS  
✅ **State Management** - Centralized Redux Toolkit store with typed hooks  
✅ **Rich Text Editing** - Markdown support for writing and viewing posts  
✅ **Responsive Design** - Mobile-first Tailwind CSS styling (v4) with dark mode support  
✅ **Real-time Feedback** - Toast notifications for user actions  

---

## 🚀 Key Features

### 🔐 Authentication System
- **User Registration** - Email/password signup with instant access.
- **Secure Login/Logout** - JWT-based session management.
- **Persistent Sessions** - Automatic session restoration on page reload.
- **Author Attribution** - Automatic username resolution via database triggers.

### 📰 Blog Post Management
| Feature | Description | Security |
|---------|-------------|----------|
| **Create** | Authenticated users can publish new posts | User ID automatically attached |
| **Read** | Public access to all published posts | No authentication required |
| **Update** | Edit your own posts only | RLS policy enforced |
| **Delete** | Remove your own posts only | RLS policy enforced |
| **Rich Text** | Markdown editor with preview | Sanitized output |

---

## 🛠 Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### Frontend
- **Framework:** React 19 with Vite 7
- **Language:** TypeScript 5.9
- **State Management:** Redux Toolkit & React-Redux
- **Routing:** React Router DOM v7
- **Styling:** Tailwind CSS 4 & PostCSS
- **Editor:** @uiw/react-md-editor
- **Icons:** Lucide React
- **Notifications:** React Toastify

</td>
<td valign="top" width="50%">

### Backend & Infrastructure
- **BaaS:** Supabase
- **Database:** PostgreSQL
- **Authentication:** Supabase Auth
- **Security:** Row Level Security (RLS)
- **Deployment:** Ready for Vercel/Netlify

</td>
</tr>
</table>

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm/yarn
- **Supabase Account** (free tier available)

### Installation Steps

**1️⃣ Clone the Repository**
```bash
git clone <repository-url>
cd blog-app
```

**2️⃣ Install Dependencies**
```bash
npm install
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

---

## 🗄️ Database Setup

### Supabase Configuration

Navigate to the **SQL Editor** in your Supabase dashboard and run the following script to set up the database, RLS policies, and triggers:

```sql
-- 1. Create the 'posts' table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  content text not null,
  user_id uuid references auth.users not null,
  author_name text
);

-- 2. Enable Row Level Security (RLS)
alter table public.posts enable row level security;

-- 3. Create Security Policies

-- Policy: Public read access
create policy "Public posts are viewable by everyone" 
  on public.posts for select 
  using (true);

-- Policy: Authenticated users can insert their own posts
create policy "Users can insert their own posts" 
  on public.posts for insert 
  with check (auth.uid() = user_id);

-- Policy: Users can update their own posts
create policy "Users can update own posts" 
  on public.posts for update 
  using (auth.uid() = user_id);

-- Policy: Users can delete their own posts
create policy "Users can delete own posts" 
  on public.posts for delete 
  using (auth.uid() = user_id);

-- 4. Create Author Name Trigger
-- This function automatically populates author_name from user metadata
create or replace function public.handle_new_post_author()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_name text;
begin
  select 
    coalesce(
      raw_user_meta_data->>'username',
      split_part(email, '@', 1),
      'Anonymous'
    ) into user_name
  from auth.users
  where id = new.user_id;

  new.author_name := user_name;
  return new;
end;
$$;

-- Attach the trigger
create trigger on_auth_user_created_post
  before insert on public.posts
  for each row execute procedure public.handle_new_post_author();
```

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
│   │   │   └── authSlice.ts      # Authentication state & reducers
│   │   │
│   │   └── blogs/
│   │       └── blogsSlice.ts     # Blog posts state & reducers
│   │
│   ├── components/
│   │   ├── Navbar.tsx            # Navigation bar
│   │   ├── BlogList.tsx          # Component to list blog posts
│   │   └── PostItem.tsx          # Individual post item component
│   │
│   ├── services/
│   │   ├── authService.ts        # Auth API calls
│   │   └── blogService.ts        # Blog CRUD API calls
│   │
│   ├── pages/
│   │   ├── Home.tsx              # Landing page
│   │   ├── Login.tsx             # Sign in page
│   │   ├── Register.tsx          # Sign up page
│   │   ├── CreatePost.tsx        # Post creation page
│   │   ├── EditPost.tsx          # Post editing page
│   │   └── PostDetail.tsx        # Single post view
│   │
│   ├── supabaseClient.ts         # Supabase client initialization
│   ├── App.tsx                   # Main component & routing
│   └── main.tsx                  # Entry point
│
├── public/                       # Static assets
├── supabase_setup.sql            # Database schema reference
└── package.json                  # Dependencies & scripts
```

---

## 🔒 Security Implementation

### Row-Level Security (RLS)
The application relies on Supabase's RLS to ensure data integrity and security directly at the database layer.

| Operation | Enforcement |
|-----------|-------------|
| **View Posts** | Open to public. |
| **Add Post** | Restricted to authenticated users. User ID must match the session. |
| **Edit/Delete** | Restricted to the original author of the post. |

### Frontend Protection
- **Route Guards:** Creation and editing routes are protected; unauthenticated users are redirected to login.
- **UI Logic:** "Edit" and "Delete" buttons are only rendered if the current logged-in user matches the post's author ID.

---
