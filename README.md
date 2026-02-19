# 🎵 Aura Music

**A Modern, Ad-Free Music Streaming Experience**

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![Supabase](https://img.shields.io/badge/Supabase-Backend-green) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC) ![License](https://img.shields.io/badge/License-MIT-blue)

Aura Music is a sleek, responsive web application built to mimic the premium feel of top-tier streaming services. It features a robust backend for playlist management and a modern frontend for seamless playback.

Explore The Music From Here! : https://music-app-kappa-lac.vercel.app/



---

## ✨ Key Features

### 🎧 Immersive Player

- **Global Mini-Player**: Persistent playback control across all pages.
- **Full-Screen Mode**: Beautiful "Now Playing" interface with lyrics and up-next queue.
- **Responsive Layout**: Currently optimized for **Desktop** usage (Mobile view is in development).

### 📂 Smart Library Management

- **Supabase Backend**: Secure and scalable database for user playlists and liked songs.
- **Dynamic Playlists**: Create, edit, and delete playlists instantly with optimistic UI updates.
- **Favorites System**: "Like" songs to add them to your personal collection.

### 🎨 Modern UI/UX

- **Glassmorphism**: Trendy, translucent design elements using Tailwind CSS.
- **Smooth Transitions**: Framer Motion animations for page navigation and player expansion.
- **Dark Mode**: Optimized for low-light environments.

---

## 🛠️ Technology Stack

| Component     | Technology              | Description                                         |
| :------------ | :---------------------- | :-------------------------------------------------- |
| **Framework** | Next.js 15 (App Router) | Server-side rendering and rigorous routing.         |
| **Styling**   | Tailwind CSS v4         | High-performance, utility-first styling.            |
| **Database**  | Supabase (PostgreSQL)   | Real-time database and authentication.              |
| **Language**  | TypeScript              | Type-safe code for reliability and maintainability. |
| **Icons**     | Lucide React            | Consistent and lightweight icon set.                |

---

## 🚧 Project Status & Context

> **Note**: This project was built as a **learning initiative to master TypeScript** and Next.js App Router.

- **Current State**: The application is fully functional on Desktop.
- **Future Plans**:
  - Complete mobile-first responsive redesign.
  - Add user authentication flow.
  - Integrate third-party music APIs.

---

---

## 🧗‍♂️ Development Journey

> **Naming Note**: While the project is documented here as **Aura Music**, the deployed application currently displays as just **"Music"**. This placeholder name will be updated in the next UI refresh.

### Key Challenges & Learnings

- **API Integration**: Integrating the **YouTube Data API** presented interesting challenges in handling rate limits and normalizing the data structure for the frontend.
- **Deployment Configuration**: Moving from a local environment to Vercel required troubleshooting "Root Directory" settings and environment variable management, which was a valuable lesson in CI/CD pipelines.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Supabase Account

### Installation

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/rah-gif/MusicApp.git
    cd MusicApp
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env.local` file in the root directory:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Setup**
    - Go to your Supabase Dashboard -> **SQL Editor**.
    - Copy the contents of `schema.sql` from this repository.
    - Run the script to generate the required Tables (Playlists, Liked Songs, etc.) and RLS Policies.

5.  **Run Development Server**

    ```bash
    npm run dev
    ```

6.  **Open in Browser**
    Navigate to `http://localhost:3000` to see the app in action.

---

## 📂 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
│   ├── Player/          # Music player logic and UI
│   ├── Sidebar/         # Navigation and playlists
│   └── ui/              # Shadcn/UI primitives
├── lib/                 # Utility functions and Supabase client
└── types/               # TypeScript interfaces
```

---

## 🤝 Contributing

We welcome contributions! Please fork the repository and submit a pull request for any features or bug fixes.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Developed with ❤️ by **Chethana Rahul**
