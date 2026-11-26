import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { getEmployeeById } from '../api/employees.api';
import { extractApiError } from '../api/client';
import { MAX_ACTIVE_TASKS_PER_EMPLOYEE } from '../utils/constants';
import { formatFullDate, formatShortDate } from '../utils/dateUtils';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBanner from '../components/common/ErrorBanner';

export default function EmployeeViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await getEmployeeById(id);
        if (!active) return;
        setEmployee(res.data || res);
        setTasks(res.tasks || []);
      } catch (err) {
        if (active) setError(extractApiError(err, 'Failed to load employee profile.'));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading employee profile..." />;
  if (error) return <ErrorBanner message={error} />;
  if (!employee) return <ErrorBanner message="Employee not found." />;

  const activeCount =
    employee.activeTaskCount ??
    tasks.filter((t) => t.status === 'Todo' || t.status === 'In Progress').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/employees')}
          style={{ color: 'var(--text-secondary)' }}
          className="text-sm hover:opacity-80 inline-flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employees
        </button>

        <button
          type="button"
          onClick={() => navigate(`/employees/${employee._id}/edit`)}
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-sm font-medium hover:opacity-80 transition cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit Profile
        </button>
      </div>

      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
        className="border rounded-xl p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div
          style={{ borderColor: 'var(--border-subtle)' }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5"
        >
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                style={{ backgroundColor: 'var(--bg-muted)' }}
                className="font-mono text-xs px-2.5 py-0.5 rounded font-semibold"
              >
                {employee.employeeId}
              </span>
              <StatusBadge status={employee.status} />
            </div>
            <h1 className="text-2xl font-bold">{employee.fullName}</h1>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
              {employee.role} • {employee.department}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div style={{ color: 'var(--text-secondary)' }} className="text-xs">
              Active Workload
            </div>
            <div
              className={`text-2xl font-bold ${
                activeCount >= MAX_ACTIVE_TASKS_PER_EMPLOYEE
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {activeCount} / {MAX_ACTIVE_TASKS_PER_EMPLOYEE} Tasks
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span style={{ color: 'var(--text-secondary)' }} className="text-xs block">
              Email
            </span>
            <span className="font-medium">{employee.email}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }} className="text-xs block">
              Phone
            </span>
            <span className="font-medium">{employee.phone || '—'}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }} className="text-xs block">
              Joining Date
            </span>
            <span className="font-medium">{formatFullDate(employee.joiningDate)}</span>
          </div>

          {employee.status === 'On Leave' && (
            <div className="sm:col-span-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs">
              <strong>Scheduled Leave Period:</strong> {formatFullDate(employee.leaveStart)} to{' '}
              {formatFullDate(employee.leaveEnd)}
            </div>
          )}
        </div>

        <div>
          <span style={{ color: 'var(--text-secondary)' }} className="text-xs block mb-2">
            Skills
          </span>
          <div className="flex flex-wrap gap-2">
            {employee.skills?.length ? (
              employee.skills.map((skill) => (
                <span
                  key={skill}
                  style={{ backgroundColor: 'var(--bg-muted)' }}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--text-secondary)' }} className="text-xs">
                No skills listed
              </span>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-3">Assigned Tasks ({tasks.length})</h2>
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
          className="border rounded-xl overflow-hidden shadow-xs"
        >
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--table-header-bg)' }} className="text-white">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ color: 'var(--text-secondary)' }}
                    className="py-6 text-center"
                  >
                    No tasks assigned to this employee.
                  </td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr
                    key={t._id}
                    onClick={() => navigate(`/tasks/${t._id}`)}
                    className="hover:bg-black/[0.03] dark:hover:bg-white/[0.04] cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono text-xs">{t.taskId}</td>
                    <td className="py-3 px-4 font-medium">{t.title}</td>
                    <td className="py-3 px-4">{t.priority}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td
                      className={`py-3 px-4 ${
                        t.isOverdue ? 'text-red-600 dark:text-red-400 font-semibold' : ''
                      }`}
                    >
                      {formatShortDate(t.dueDate)} {t.isOverdue ? '(Overdue)' : ''}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

