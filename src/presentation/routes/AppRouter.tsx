import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { PrivateRoute } from './PrivateRoute';
import { PageLoader } from '../components/feedback/PageLoader';

const LoginPage = lazy(() => import('../pages/login/LoginPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const LevelsPage = lazy(() => import('../pages/levels/LevelsPage'));
const CategoriesPage = lazy(() => import('../pages/categories/CategoriesPage'));
const SubcategoriesPage = lazy(() => import('../pages/subcategories/SubcategoriesPage'));
const QuizzesPage = lazy(() => import('../pages/quizzes/QuizzesPage'));
const QuizDetailPage = lazy(() => import('../pages/quizzes/QuizDetailPage'));
const ChallengesPage = lazy(() => import('../pages/challenges/ChallengesPage'));
const CompetitionsPage = lazy(() => import('../pages/competitions/CompetitionsPage'));
const ProfilesPage = lazy(() => import('../pages/profiles/ProfilesPage'));
const ProfileDetailPage = lazy(() => import('../pages/profiles/ProfileDetailPage'));
const NotificationsPage = lazy(() => import('../pages/notifications/NotificationsPage'));
const MediaPage = lazy(() => import('../pages/media/MediaPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    element: (
      <PrivateRoute>
        <AppShell />
      </PrivateRoute>
    ),
    children: [
      { path: '/', element: <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense> },
      { path: '/levels', element: <Suspense fallback={<PageLoader />}><LevelsPage /></Suspense> },
      { path: '/categories', element: <Suspense fallback={<PageLoader />}><CategoriesPage /></Suspense> },
      { path: '/subcategories', element: <Suspense fallback={<PageLoader />}><SubcategoriesPage /></Suspense> },
      { path: '/quizzes', element: <Suspense fallback={<PageLoader />}><QuizzesPage /></Suspense> },
      { path: '/quizzes/:quizId', element: <Suspense fallback={<PageLoader />}><QuizDetailPage /></Suspense> },
      { path: '/challenges', element: <Suspense fallback={<PageLoader />}><ChallengesPage /></Suspense> },
      { path: '/competitions', element: <Suspense fallback={<PageLoader />}><CompetitionsPage /></Suspense> },
      { path: '/profiles', element: <Suspense fallback={<PageLoader />}><ProfilesPage /></Suspense> },
      { path: '/profiles/:profileId', element: <Suspense fallback={<PageLoader />}><ProfileDetailPage /></Suspense> },
      { path: '/notifications', element: <Suspense fallback={<PageLoader />}><NotificationsPage /></Suspense> },
      { path: '/media', element: <Suspense fallback={<PageLoader />}><MediaPage /></Suspense> },
      { path: '*', element: <Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
