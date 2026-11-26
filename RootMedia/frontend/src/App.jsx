import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import EmployeesListPage from './pages/EmployeesListPage';
import EmployeeFormPage from './pages/EmployeeFormPage';
import EmployeeViewPage from './pages/EmployeeViewPage';
import TasksListPage from './pages/TasksListPage';
import TaskFormPage from './pages/TaskFormPage';
import TaskViewPage from './pages/TaskViewPage';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />

              <Route path="/employees" element={<EmployeesListPage />} />
              <Route path="/employees/new" element={<EmployeeFormPage />} />
              <Route path="/employees/:id" element={<EmployeeViewPage />} />
              <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />

              <Route path="/tasks" element={<TasksListPage />} />
              <Route path="/tasks/new" element={<TaskFormPage />} />
              <Route path="/tasks/:id" element={<TaskViewPage />} />
              <Route path="/tasks/:id/edit" element={<TaskFormPage />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

