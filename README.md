# Tender 🤍

> A private social network for your closest circle. Post without performing.

No followers. No algorithm. No public likes. Just a small group of people who actually know each other, sharing real moments.

**Live:** https://tender-connection.netlify.app

---

## What it is

Tender is built around one idea: social media is exhausting because everything is performed for an audience. Tender removes the audience. You pick up to 10 people — your circle — and everything stays inside that group.

### Features

| Feature | Description |
|---|---|
| **Circles** | Create or join a private group (max 10 people) with a shareable invite code |
| **Feed** | Text posts, photos, and mood posts from everyone in your circle |
| **Reactions** | Six honest reactions — hug, tea, chaos, proud, screaming, soup |
| **Mood Ring** | Share how you're actually feeling today (thriving → feral) |
| **Disappear Mode** | Go quiet with context — "overwhelmed", "recharging", etc. — so friends know you're okay |
| **Circle Status Bar** | See everyone's mood and disappear status at a glance |
| **Soft Alerts** | Gentle nudges when someone has been silent for a week or their mood has been declining |

---

## Tech stack

- **React 18** + **Vite 4**
- **TailwindCSS v3** — custom scrapbook design tokens (Caveat font, cream/blush/lavender palette)
- **Framer Motion** — animations, card transitions, floating stickers
- **Supabase** — auth, PostgreSQL database, file storage
- **React Router v6** — client-side routing with protected routes
- **Netlify** — hosting with auto-deploy from GitHub

---

## Local setup

### 1. Clone and install

```bash
git clone git@github.com:Wahid-ul/tender-app.git
cd tender-app
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, then run the following SQL in the **SQL Editor**:

```sql
-- Profiles (auto-created on signup via trigger)
create table public.profiles (
  id uuid references auth.users(id) primary key,
  name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Circles
create table public.circles (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_by uuid references public.profiles(id),
  invite_code text unique default substr(md5(random()::text), 1, 8),
  created_at timestamptz default now()
);

-- Circle members
create table public.circle_members (
  id uuid default gen_random_uuid() primary key,
  circle_id uuid references public.circles(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(circle_id, user_id)
);

-- Posts
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  circle_id uuid references public.circles(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete cascade,
  type text check (type in ('text','photo','mood')),
  content text,
  photo_url text,
  mood text,
  created_at timestamptz default now()
);

-- Reactions
create table public.reactions (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  type text,
  created_at timestamptz default now(),
  unique(post_id, user_id, type)
);

-- Daily moods
create table public.moods (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  circle_id uuid references public.circles(id) on delete cascade,
  mood text,
  date date default current_date,
  created_at timestamptz default now(),
  unique(user_id, circle_id, date)
);

-- Disappear status
create table public.disappear_status (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique,
  status text,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email))
  on conflict (id) do nothing;
  return new;
exception when others then
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

Also create a **Storage bucket** named `post-media` (public bucket) for photo uploads.

### 3. Add environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find both values in your Supabase project under **Settings → API**.

### 4. Run locally

```bash
npm run dev
```

---

## Deploying to Netlify

1. Push to GitHub
2. Connect the repo in [Netlify](https://netlify.com) → **Add new site → Import from Git**
3. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables in **Site configuration → Environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Trigger a deploy

The `public/_redirects` file handles SPA routing so direct URLs and refreshes work correctly.

---

## Project structure

```
src/
├── hooks/
│   ├── useAuth.js          # Auth state + session management
│   ├── useCircle.js        # Circle CRUD + member management
│   ├── usePosts.js         # Posts, reactions, photo uploads
│   ├── useDisappear.js     # Disappear mode status
│   └── useSoftAlerts.js    # Silence + mood decline detection
├── pages/
│   ├── Auth.jsx            # Sign in / sign up
│   ├── CircleSetup.jsx     # Create or join a circle
│   ├── Feed.jsx            # Main feed
│   ├── NewPost.jsx         # Post composer
│   ├── Mood.jsx            # Daily mood check-in
│   ├── Profile.jsx         # Profile + disappear mode + invite code
│   └── Archive.jsx         # Post archive
├── components/
│   ├── layout/AppShell.jsx # Bottom nav shell
│   └── ui/
│       ├── PostCard.jsx        # Polaroid post card with reactions
│       ├── CircleStatusBar.jsx # Horizontal member mood bubbles
│       ├── DisappearMode.jsx   # Disappear status picker
│       └── SoftAlertCard.jsx   # Gentle nudge cards
└── lib/
    └── supabase.js         # Supabase client
```

---

## Design philosophy

The visual aesthetic is a handwritten scrapbook — Caveat font, polaroid cards, film grain, muted warm tones. Nothing feels corporate or optimised for engagement. It's supposed to feel like passing notes.
