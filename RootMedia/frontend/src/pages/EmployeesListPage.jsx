import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { deleteEmployee, getEmployees } from '../api/employees.api';
import { extractApiError } from '../api/client';
import { useToast } from '../context/ToastContext';
import { DEPARTMENTS, EMPLOYEE_STATUSES, MAX_ACTIVE_TASKS_PER_EMPLOYEE } from '../utils/constants';
import { formatShortDate } from '../utils/dateUtils';
import Pagination from '../components/common/Pagination';
import StatusBadge from '../components/common/StatusBadge';
import ActionMenu from '../components/common/ActionMenu';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBanner from '../components/common/ErrorBanner';

const PAGE_LIMIT = 5;

export default function EmployeesListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const search = searchParams.get('search') || '';
  const department = searchParams.get('department') || '';
  const status = searchParams.get('status') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const [searchInput, setSearchInput] = useState(search);
  const [employees, setEmployees] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1, limit: PAGE_LIMIT });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getEmployees({
        search: search || undefined,
        department: department || undefined,
        status: status || undefined,
        page,
        limit: PAGE_LIMIT,
      });
      setEmployees(res.data || []);
      setMeta(res.meta || { total: 0, totalPages: 1, page, limit: PAGE_LIMIT });
    } catch (err) {
      setError(extractApiError(err, 'Failed to load employees.'));
    } finally {
      setLoading(false);
    }
  }, [search, department, status, page]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEmployee(deleteTarget._id);
      showToast(`Employee ${deleteTarget.fullName} deleted.`, 'success');
      setDeleteTarget(null);
      fetchList();
    } catch (err) {
      showToast(extractApiError(err, 'Failed to delete employee.'), 'error');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, email, or ID"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }}
            className="w-full sm:w-72 px-3.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            style={{ backgroundColor: 'var(--accent-primary)' }}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition shrink-0 cursor-pointer"
          >
            Search
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate('/employees/new')}
          style={{ backgroundColor: 'var(--accent-primary)' }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        <select
          value={department}
          onChange={(e) => updateParam('department', e.target.value)}
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
          className="px-3 py-2 rounded-lg border text-sm"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => updateParam('status', e.target.value)}
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
          className="px-3 py-2 rounded-lg border text-sm"
        >
          <option value="">All Statuses</option>
          {EMPLOYEE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {(search || department || status) && (
          <button
            type="button"
            onClick={() => setSearchParams({})}
            style={{ color: 'var(--text-secondary)' }}
            className="text-xs underline hover:opacity-80 cursor-pointer ml-1"
          >
            Clear Filters
          </button>
        )}
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <LoadingSpinner label="Loading employees..." />
      ) : (
        <>
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }}
            className="border rounded-xl shadow-xs overflow-visible"
          >
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    style={{ backgroundColor: 'var(--table-header-bg)' }}
                    className="text-white text-sm font-semibold"
                  >
                    <th className="py-3.5 px-4 rounded-tl-xl">Emp ID</th>
                    <th className="py-3.5 px-4">Full Name</th>
                    <th className="py-3.5 px-4">Department & Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Active Tasks</th>
                    <th className="py-3.5 px-4 text-right rounded-tr-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] text-sm">
                  {employees.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{ color: 'var(--text-secondary)' }}
                        className="py-10 text-center"
                      >
                        No employees found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => {
                      const activeCount = emp.activeTaskCount ?? 0;
                      return (
                        <tr
                          key={emp._id}
                          className="hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition"
                        >
                          <td className="py-3.5 px-4 font-mono text-xs font-semibold whitespace-nowrap">
                            {emp.employeeId}
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => navigate(`/employees/${emp._id}`)}
                              className="font-medium hover:underline text-left cursor-pointer"
                            >
                              {emp.fullName}
                            </button>
                            <div style={{ color: 'var(--text-secondary)' }} className="text-xs">
                              {emp.email}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div>{emp.department}</div>
                            <div style={{ color: 'var(--text-secondary)' }} className="text-xs">
                              {emp.role}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <StatusBadge status={emp.status} />
                            {emp.status === 'On Leave' && emp.leaveStart && (
                              <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                                {formatShortDate(emp.leaveStart)} – {formatShortDate(emp.leaveEnd)}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold">
                            <span
                              className={
                                activeCount >= MAX_ACTIVE_TASKS_PER_EMPLOYEE
                                  ? 'text-red-600 dark:text-red-400'
                                  : ''
                              }
                            >
                              {activeCount} / {MAX_ACTIVE_TASKS_PER_EMPLOYEE}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <ActionMenu
                              onView={() => navigate(`/employees/${emp._id}`)}
                              onEdit={() => navigate(`/employees/${emp._id}/edit`)}
                              onDelete={() => setDeleteTarget(emp)}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            totalItems={meta.total}
            limit={meta.limit || PAGE_LIMIT}
            itemLabel="employees"
            onPageChange={(nextPage) => updateParam('page', String(nextPage))}
          />
        </>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Employee"
        message={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.fullName} (${deleteTarget.employeeId})? Historical completed/cancelled tasks will retain their details.`
            : ''
        }
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

