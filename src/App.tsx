import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ExaminationProvider } from './context/ExaminationContext';
import { AppLayout } from './components/layout/AppLayout';
import { About } from './pages/About';
import { Comparison } from './pages/Comparison';
import { Dashboard } from './pages/Dashboard';
import { Examine } from './pages/Examine';
import { Integrity } from './pages/Integrity';
import { Metadata } from './pages/Metadata';
import { Observations } from './pages/Observations';
import { Report } from './pages/Report';

export default function App() {
  return (
    <ExaminationProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="examine" element={<Examine />} />
            <Route path="metadata" element={<Metadata />} />
            <Route path="integrity" element={<Integrity />} />
            <Route path="observations" element={<Observations />} />
            <Route path="comparison" element={<Comparison />} />
            <Route path="report" element={<Report />} />
            <Route path="about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ExaminationProvider>
  );
}
