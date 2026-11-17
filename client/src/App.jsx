import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ResumeScorerPage from './pages/ResumeScorerPage';
import StartInterviewPage from './pages/StartInterviewPage';
import LiveInterviewPage from './pages/LiveInterviewPage';
import InterviewReportPage from './pages/InterviewReportPage';
import RoadmapPage from './pages/RoadmapPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<LandingPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/scorer"
        element={
          <ProtectedRoute>
            <ResumeScorerPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/interview/new"
        element={
          <ProtectedRoute>
            <StartInterviewPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/interview/:id"
        element={
          <ProtectedRoute>
            <LiveInterviewPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/interview/:id/report"
        element={
          <ProtectedRoute>
            <InterviewReportPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/roadmap"
        element={
          <ProtectedRoute>
            <RoadmapPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resume-builder"
        element={
          <ProtectedRoute>
            <ResumeBuilderPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

