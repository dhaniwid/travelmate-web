# TravelMate: Project Architecture & Context Sync

This document serves as the **Source of Truth** for the TravelMate project. It is designed to be shared with AI architects (like Gemini or Atlas) to ensure deep technical alignment and surgical precision in future developments.

---

## 🏗️ 1. Project Architecture
TravelMate is built using a modern **decoupled architecture**:

*   **Frontend**: Next.js 15+ (App Router) / React 19 / TypeScript / Tailwind CSS.
*   **Backend**: High-performance API written in **Go (Golang)**.
*   **AI Orchestration**: Heavy processing (parallel task execution, data mining) happens in Go; UI-centric adjustments occur in Next.js Server Actions.
*   **Data Persistence**: PostgreSQL with `JSONB` for flexible trip storage.

---

## 🛠️ 2. Tech Stack & Integrations
*   **Auth**: Clerk (Next.js & Go Middleware).
*   **AI Models**: OpenAI GPT-4o-mini (Primary) / GPT-4o.
*   **Media**: Unsplash API (Automated destination imagery).
*   **Maps**: Google Maps JS API (Interactive activity visualization).
*   **Database**: Postgres (Raw SQL via `postgres.js` & `pgx`).

---

## 📊 3. Data Schema (Core: `trips` table)

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key (used in dynamic routing: `/trips/[id]`). |
| `user_id` | `VARCHAR` | Clerk User Identifier. |
| `plan_data` | `JSONB` | **The Master Plan**. Contains Itinerary, Logistics, & Discovery content. |
| `status` | `VARCHAR` | `DRAFT`, `UPCOMING`, or `COMPLETED`. |
| `user_preferences`| `JSONB` | Persistent Vibe, Budget, and Dietary settings. |

---

## 🧬 4. Core Domain Definitions

### **A. The Master Plan (`TripPlan`)**
The master JSON object created by the Go backend and consumed by the `/trips/[id]` route:
*   `itinerary`: Array of Days, each containing `MorningBriefing` and `Activities`.
*   `logistics_context`: Distance, route warnings, and transport strategy.
*   `strategic_accommodation`: Array of area-based recommendations with vibes and reasons.
*   `packing_list`: Categorized items (Clothing, Tech, etc.).
*   `morning_briefing`: A story-driven summary for the entire trip.
*   `discovery`: Tagline, Vibes, Culinary Signatures, Hidden Gems, and History Snippets.

### **B. Activity Signature**
*   `time`: (HH:MM format).
*   `activity`: Clear title.
*   `place_name`: Specific venue or POI name.
*   `location_type`: `specific` (landmark) or `generic` (neighborhood).

---

## 🎨 5. UI/UX Philosophy
*   **Aesthetic**: "Premium Travel Magazine."
*   **Palette**: Teal (`#0D9488`), Slate (`#0F172A`), White.
*   **Interactions**: Ken Burns parallax headers, glassmorphism, staggered animations.
*   **Logic**: No data loss on refresh (Persistence via Dynamic Route).

---

## 🚀 6. Capability Profile
1.  **Parallel AI Streaming**: Streams metadata → itinerary → logistics → packing list concurrently.
2.  **Surgical Swapping**: Can replace single activities without breaking the rest of the plan.
3.  **Autonomous Data Mining**: Background Go workers transform AI results into static database attractions.
4.  **Flexible Budgeting**: Updates transport and stay tiers dynamically based on user slider adjustments.

---

## 📝 How to use this as an AI Prompt
*Copy and Paste the following to start a session with a new AI instance:*

> "I'm working on TravelMate, an AI Travel platform. I've attached or pasted the **PROJECT_SYNC.md** content. Use this to ensure all your code suggestions for my **Go backend** or **Next.js 15 frontend** follow the existing architecture and data types exactly. Avoid creating type mismatches or redundant entry points. We use a Teal/Slate magazine style. Let's start."
