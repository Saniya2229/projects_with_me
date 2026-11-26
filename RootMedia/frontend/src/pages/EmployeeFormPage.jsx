import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createEmployee, getEmployeeById, updateEmployee } from '../api/employees.api';
import { extractApiError } from '../api/client';
import { useToast } from '../context/ToastContext';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../utils/constants';
import { getTodayInputValue, toDateInputValue } from '../utils/dateUtils';
import { validateEmployeeForm } from '../utils/validators';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBanner from '../components/common/ErrorBanner';

export default function EmployeeFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    joiningDate: getTodayInputValue(),
    status: 'Active',
    leaveStart: '',
    leaveEnd: '',
    skills: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const res = await getEmployeeById(id);
        const emp = res.data || res;
        if (!active) return;
        setForm({
          employeeId: emp.employeeId || '',
          fullName: emp.fullName || '',
          email: emp.email || '',
          phone: emp.phone || '',
          department: emp.department || '',
          role: emp.role || '',
          joiningDate: toDateInputValue(emp.joiningDate),
          status: emp.status || 'Active',
          leaveStart: toDateInputValue(emp.leaveStart),
          leaveEnd: toDateInputValue(emp.leaveEnd),
          skills: Array.isArray(emp.skills) ? emp.skills.join(', ') : '',
        });
      } catch (err) {
        if (active) setServerError(extractApiError(err, 'Failed to load employee.'));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateEmployeeForm(form, isEdit);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setServerError(Object.values(errors)[0]);
      return;
    }

    const payload = {
      ...(isEdit ? {} : { employeeId: form.employeeId.trim().toUpperCase() }),
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      department: form.department,
      role: form.role.trim(),
      joiningDate: form.joiningDate,
      status: form.status,
      skills: form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      leaveStart: form.status === 'On Leave' ? form.leaveStart : null,
      leaveEnd: form.status === 'On Leave' ? form.leaveEnd : null,
    };

    setSubmitting(true);
    setServerError('');
    try {
      if (isEdit) {
        await updateEmployee(id, payload);
        showToast('Employee updated successfully.', 'success');
      } else {
        await createEmployee(payload);
        showToast('Employee created successfully.', 'success');
      }
      navigate('/employees');
    } catch (err) {
      const msg = extractApiError(err, 'Failed to save employee.');
      setServerError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading employee details..." />;

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
          onClick={() => navigate('/employees')}
          style={{ color: 'var(--text-secondary)' }}
          className="text-sm hover:opacity-80 inline-flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employees
        </button>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
        {isEdit ? `Edit Employee (${form.employeeId})` : 'Add Employee'}
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
            <label className="block text-sm font-medium mb-1.5">Employee ID</label>
            <input
              type="text"
              value={form.employeeId}
              onChange={handleChange('employeeId')}
              readOnly={isEdit}
              placeholder="EMP-001"
              style={inputStyle}
              className={`${inputCls} ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
            {fieldErrors.employeeId && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.employeeId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.fullName}
              onChange={handleChange('fullName')}
              placeholder="Enter Full Name"
              style={inputStyle}
              className={inputCls}
            />
            {fieldErrors.fullName && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="name@rootsmedia.in"
              style={inputStyle}
              className={inputCls}
            />
            {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={handleChange('phone')}
              placeholder="+91 98230 00000"
              style={inputStyle}
              className={inputCls}
            />
            {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Department</label>
            <select
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
            <label className="block text-sm font-medium mb-1.5">Role</label>
            <input
              type="text"
              value={form.role}
              onChange={handleChange('role')}
              placeholder="e.g. Full-Stack Developer"
              style={inputStyle}
              className={inputCls}
            />
            {fieldErrors.role && <p className="text-xs text-red-500 mt-1">{fieldErrors.role}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Joining Date</label>
            <input
              type="date"
              value={form.joiningDate}
              onChange={handleChange('joiningDate')}
              style={inputStyle}
              className={inputCls}
            />
            {fieldErrors.joiningDate && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.joiningDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={handleChange('status')}
              style={inputStyle}
              className={inputCls}
            >
              {EMPLOYEE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {form.status === 'On Leave' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
            <div>
              <label className="block text-sm font-medium text-amber-900 dark:text-amber-300 mb-1.5">
                Leave Start Date
              </label>
              <input
                type="date"
                value={form.leaveStart}
                onChange={handleChange('leaveStart')}
                style={inputStyle}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 dark:text-amber-300 mb-1.5">
                Leave End Date
              </label>
              <input
                type="date"
                value={form.leaveEnd}
                onChange={handleChange('leaveEnd')}
                style={inputStyle}
                className={inputCls}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1.5">Skills (comma separated)</label>
          <input
            type="text"
            value={form.skills}
            onChange={handleChange('skills')}
            placeholder="React, Node.js, MongoDB"
            style={inputStyle}
            className={inputCls}
          />
        </div>

        <ErrorBanner message={serverError} />

        <button
          type="submit"
          disabled={submitting}
          style={{ backgroundColor: 'var(--accent-primary)' }}
          className="w-full py-2.5 px-4 rounded-lg text-white font-semibold text-sm hover:opacity-90 transition cursor-pointer disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

