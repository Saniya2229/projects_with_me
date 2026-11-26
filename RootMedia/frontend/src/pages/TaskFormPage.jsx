import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getEmployees } from '../api/employees.api';
import { createTask, getTaskById, updateTask } from '../api/tasks.api';
import { extractApiError } from '../api/client';
import { useToast } from '../context/ToastContext';
import { DEPARTMENTS, MAX_ACTIVE_TASKS_PER_EMPLOYEE, PRIORITIES } from '../utils/constants';
import { getTodayInputValue, toDateInputValue } from '../utils/dateUtils';
import { validateTaskForm } from '../utils/validators';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBanner from '../components/common/ErrorBanner';

export default function TaskFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [employees, setEmployees] = useState([]);
  const [taskMeta, setTaskMeta] = useState(null);
  const [form, setForm] = useState({
    title: '',
    assignedEmployee: '',
    priority: '',
    department: '',
    startDate: getTodayInputValue(),
    dueDate: getTodayInputValue(),
    description: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const empRes = await getEmployees({ limit: 100 });
        if (!active) return;
        setEmployees(empRes.data || []);

        if (isEdit) {
          const taskRes = await getTaskById(id);
          const task = taskRes.data || taskRes;
          if (!active) return;
          setTaskMeta(task);
          setForm({
            title: task.title || '',
            assignedEmployee: task.assignedEmployee?._id || task.assignedEmployee || '',
            priority: task.priority || '',
            department: task.department || '',
            startDate: toDateInputValue(task.startDate),
            dueDate: toDateInputValue(task.dueDate),
            description: task.description || '',
          });
          if (task.status === 'Completed' || task.status === 'Cancelled') {
            setServerError(`${task.status} tasks cannot be edited.`);
          }
        }
      } catch (err) {
        if (active) setServerError(extractApiError(err, 'Failed to load task form data.'));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  const isLocked =
    isEdit && (taskMeta?.status === 'Completed' || taskMeta?.status === 'Cancelled');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    const errors = validateTaskForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setServerError(Object.values(errors)[0]);
      return;
    }

    const payload = {
      title: form.title.trim(),
      assignedEmployee: form.assignedEmployee,
      priority: form.priority,
      department: form.department,
      startDate: form.startDate,
      dueDate: form.dueDate,
      description: form.description.trim(),
    };

    setSubmitting(true);
    setServerError('');
    try {
      if (isEdit) {
        await updateTask(id, payload);
        showToast('Task updated successfully.', 'success');
      } else {
        await createTask(payload);
        showToast('Task created successfully.', 'success');
      }
      navigate('/tasks');
    } catch (err) {
      const msg = extractApiError(err, 'Failed to save task.');
      setServerError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading task form..." />;

  const inputCls =
    'w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const inputStyle = {
    backgroundColor: 'var(--bg-app)',
    borderColor: 'var(--border-subtle)',
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => navigate('/tasks')}
          style={{ color: 'var(--text-secondary)' }}
          className="text-sm hover:opacity-80 inline-flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </button>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
        {isEdit ? `Edit Task (${taskMeta?.taskId || ''})` : 'Add Task'}
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
        className="border rounded-xl p-6 sm:p-8 shadow-xs space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Title</label>
            <input
              type="text"
              disabled={isLocked}
              value={form.title}
              onChange={handleChange('title')}
              placeholder="Enter Title"
              style={inputStyle}
              className={inputCls}
            />
            {fieldErrors.title && <p className="text-xs text-red-500 mt-1">{fieldErrors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Assigned Employee</label>
            <select
              disabled={isLocked}
              value={form.assignedEmployee}
              onChange={handleChange('assignedEmployee')}
              style={inputStyle}
              className={inputCls}
            >
              <option value="">Select...</option>
              {employees.map((emp) => {
                const count = emp.activeTaskCount ?? 0;
                const tag =
                  emp.status !== 'Active'
                    ? ` [${emp.status}]`
                    : ` (${count}/${MAX_ACTIVE_TASKS_PER_EMPLOYEE} active)`;
                return (
                  <option key={emp._id} value={emp._id}>
                    {emp.fullName}
                    {tag}
                  </option>
                );
              })}
            </select>
            {fieldErrors.assignedEmployee && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.assignedEmployee}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Priority</label>
            <select
              disabled={isLocked}
              value={form.priority}
              onChange={handleChange('priority')}
              style={inputStyle}
              className={inputCls}
            >
              <option value="">Select...</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {fieldErrors.priority && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.priority}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Department</label>
            <select
              disabled={isLocked}
              value={form.department}
              onChange={handleChange('department')}
              style={inputStyle}
              className={inputCls}
            >
              <option value="">Select...</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {fieldErrors.department && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.department}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Start Date</label>
            <input
              type="date"
              disabled={isLocked}
              value={form.startDate}
              onChange={handleChange('startDate')}
              style={inputStyle}
              className={inputCls}
            />
            {fieldErrors.startDate && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.startDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Due Date</label>
            <input
              type="date"
              disabled={isLocked}
              value={form.dueDate}
              onChange={handleChange('dueDate')}
              style={inputStyle}
              className={inputCls}
            />
            {fieldErrors.dueDate && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.dueDate}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            rows={3}
            disabled={isLocked}
            value={form.description}
            onChange={handleChange('description')}
            placeholder="Enter Description"
            style={inputStyle}
            className={inputCls}
          />
        </div>

        <ErrorBanner message={serverError} />

        <button
          type="submit"
          disabled={submitting || isLocked}
          style={{ backgroundColor: 'var(--accent-primary)' }}
          className="w-full py-2.5 px-4 rounded-lg text-white font-semibold text-sm hover:opacity-90 transition cursor-pointer disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

