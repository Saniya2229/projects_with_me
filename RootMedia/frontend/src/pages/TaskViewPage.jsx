import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { getTaskById, updateTaskStatus } from '../api/tasks.api';
import { extractApiError } from '../api/client';
import { useToast } from '../context/ToastContext';
import { getValidNextStatuses } from '../utils/constants';
import { formatFullDate } from '../utils/dateUtils';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBanner from '../components/common/ErrorBanner';

export default function TaskViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState('');

  const loadTask = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTaskById(id);
      setTask(res.data || res);
    } catch (err) {
      setError(extractApiError(err, 'Failed to load task details.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const handleStatusTransition = async (nextStatus) => {
    setUpdatingStatus(true);
    try {
      await updateTaskStatus(task._id, nextStatus);
      showToast(`Task ${task.taskId} marked as "${nextStatus}".`, 'success');
      loadTask();
    } catch (err) {
      showToast(extractApiError(err, 'Failed to update status.'), 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading task details..." />;
  if (error) return <ErrorBanner message={error} />;
  if (!task) return <ErrorBanner message="Task not found." />;

  const nextStatuses = getValidNextStatuses(task.status);
  const isTerminal = task.status === 'Completed' || task.status === 'Cancelled';
  const emp = task.assignedEmployee;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/tasks')}
          style={{ color: 'var(--text-secondary)' }}
          className="text-sm hover:opacity-80 inline-flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </button>

        <button
          type="button"
          onClick={() => {
            if (isTerminal) {
              showToast(`${task.status} tasks cannot be edited.`, 'error');
              return;
            }
            navigate(`/tasks/${task._id}/edit`);
          }}
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-sm font-medium hover:opacity-80 transition cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit Task
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
          className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-5"
        >
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span
                style={{ backgroundColor: 'var(--bg-muted)' }}
                className="font-mono text-xs px-2.5 py-1 rounded-md font-semibold"
              >
                {task.taskId}
              </span>
              <span
                style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-secondary)' }}
                className="text-xs px-2.5 py-1 rounded-md"
              >
                {task.department}
              </span>
              {task.isOverdue && (
                <span className="text-xs px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-semibold">
                  Overdue
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold">{task.title}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={task.status} />
            {nextStatuses.map((ns) => (
              <button
                key={ns}
                type="button"
                disabled={updatingStatus}
                onClick={() => handleStatusTransition(ns)}
                style={{ backgroundColor: 'var(--accent-primary)' }}
                className="px-3 py-1 rounded-md text-xs font-medium text-white hover:opacity-90 transition cursor-pointer disabled:opacity-50"
              >
                Mark {ns}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3
            style={{ color: 'var(--text-secondary)' }}
            className="text-xs uppercase tracking-wider font-semibold mb-2"
          >
            Description
          </h3>
          <p className="text-sm leading-relaxed">
            {task.description || 'No description provided.'}
          </p>
        </div>

        <div
          style={{ borderColor: 'var(--border-subtle)' }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t text-sm"
        >
          <div>
            <span style={{ color: 'var(--text-secondary)' }} className="block text-xs">
              Assigned Employee
            </span>
            <span className="font-semibold">
              {emp ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate(`/employees/${emp._id}`)}
                    className="hover:underline text-blue-600 dark:text-blue-400 cursor-pointer"
                  >
                    {emp.fullName}
                  </button>{' '}
                  ({emp.role})
                </>
              ) : (
                `${task.employeeSnapshot?.fullName || 'Unknown'} (Employee Deleted)`
              )}
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--text-secondary)' }} className="block text-xs">
              Priority
            </span>
            <span className="font-semibold">{task.priority}</span>
          </div>

          <div>
            <span style={{ color: 'var(--text-secondary)' }} className="block text-xs">
              Start Date
            </span>
            <span className="font-medium">{formatFullDate(task.startDate)}</span>
          </div>

          <div>
            <span style={{ color: 'var(--text-secondary)' }} className="block text-xs">
              Due Date
            </span>
            <span
              className={`font-medium ${
                task.isOverdue ? 'text-red-600 dark:text-red-400 font-semibold' : ''
              }`}
            >
              {formatFullDate(task.dueDate)} {task.isOverdue ? '(Overdue)' : ''}
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--text-secondary)' }} className="block text-xs">
              Created Date
            </span>
            <span className="font-medium">{formatFullDate(task.createdDate)}</span>
          </div>

          <div>
            <span style={{ color: 'var(--text-secondary)' }} className="block text-xs">
              Completed Date (Server-Generated)
            </span>
            <span className="font-medium">
              {task.completedDate ? formatFullDate(task.completedDate) : 'Not completed yet'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

