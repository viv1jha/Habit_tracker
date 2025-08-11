# Habit Planner

Features:
- Tasks with daily/weekly/monthly periods, overdue indicator
- Habits with streaks and monthly grid
- Progress chart
- Firebase Auth (email/password + Google) and Firestore per-user storage
- Optional Google Calendar sync
- Tailwind CSS, Dark mode

Environment variables in `.env.local`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```
## Deployment

### Environment
variables required for deployment:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### Vercel Deployment

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com) and create a new project
3. Import your repository
4. In the project settings, add the environment variables listed above
5. Deploy the project

### Netlify Deployment

1. Push your code to a GitHub repository
2. Go to [Netlify](https://netlify.com) and create a new site
3. Select your repository
4. In the deploy settings:
   - Set the build command to: `npm run build`
   - Set the publish directory to: `dist`
5. Add the environment variables in the "Environment variables" section
6. Deploy the site

Note: For both platforms, make sure to configure your Firebase project to allow connections from your deployed domain.
