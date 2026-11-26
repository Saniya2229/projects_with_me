import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ban,
  CheckCircle2,
  Clock,
  Play,
  Plus,
  Users,
} from 'lucide-react';
import { getDashboardStats } from '../api/dashboard.api';
import { getTasks } from '../api/tasks.api';
import { extractApiError } from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBanner from '../components/common/ErrorBanner';
import { MAX_ACTIVE_TASKS_PER_EMPLOYEE, getValidNextStatuses } from '../utils/constants';
import { formatShortDate } from '../utils/dateUtils';

const STATUS_META = {
  Todo: {
    label: 'Todo',
    badgeClass: 'bg-sky-500/12 text-sky-600 dark:text-sky-300 border-sky-500/25',
    dotClass: 'bg-sky-500',
    barClass: 'bg-sky-500',
    timelineClass: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm shadow-sky-500/20',
    query: '/tasks?status=Todo',
  },
  'In Progress': {
    label: 'In Progress',
    badgeClass: 'bg-blue-500/12 text-blue-600 dark:text-blue-300 border-blue-500/25',
    dotClass: 'bg-blue-500',
    barClass: 'bg-blue-500',
    timelineClass: 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-sm shadow-blue-500/20',
    query: '/tasks?status=In%20Progress',
  },
  Completed: {
    label: 'Completed',
    badgeClass: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-300 border-emerald-500/25',
    dotClass: 'bg-emerald-500',
    barClass: 'bg-emerald-500',
    timelineClass: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-500/20',
    query: '/tasks?status=Completed',
  },
  Cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-slate-500/12 text-slate-600 dark:text-slate-400 border-slate-500/25',
    dotClass: 'bg-slate-400',
    barClass: 'bg-slate-400',
    timelineClass: 'bg-slate-500/80 text-white',
    query: '/tasks?status=Cancelled',
  },
  Overdue: {
    label: 'Overdue',
    badgeClass: 'bg-rose-500/12 text-rose-600 dark:text-rose-300 border-rose-500/30',
    dotClass: 'bg-rose-500',
    barClass: 'bg-rose-500',
    timelineClass: 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm shadow-rose-500/25',
    query: '/tasks',
  },
};

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '?';
}

function getCurrentWeekDays() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 1 = Mon ...
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + diffToMon);

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayStr = now.toISOString().split('T')[0];

  return labels.map((label, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const iso = d.toISOString().split('T')[0];
    return {
      label,
      dayNum: d.getDate(),
      date: d,
      iso,
      isToday: iso === todayStr,
    };
  });
}

function getTaskTimelineSpan(task, weekDays) {
  const weekStart = weekDays[0].date.getTime();
  const msPerDay = 86400000;

  const startMs = task.startDate ? new Date(task.startDate).setHours(0, 0, 0, 0) : weekStart;
  const dueMs = task.dueDate ? new Date(task.dueDate).setHours(0, 0, 0, 0) : startMs + msPerDay;

  let startCol = Math.round((startMs - weekStart) / msPerDay);
  let endCol = Math.round((dueMs - weekStart) / msPerDay);

  if (endCol < startCol) endCol = startCol;

  // Clamp into 0..6 so tasks outside the exact week still display cleanly on the sprint grid
  const clampedStart = Math.max(0, Math.min(6, startCol));
  const clampedEnd = Math.max(clampedStart, Math.min(6, endCol));
  const spanCols = Math.max(1, clampedEnd - clampedStart + 1);

  return { startCol: clampedStart, spanCols };
}

function AnimatedNumber({ value, replayKey }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    const duration = 550;
    const start = performance.now();
    let rafId;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setDisplay(target);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, replayKey]);

  return <span>{display}</span>;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timelineFilter, setTimelineFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'OVERDUE'
  const [inspectedTaskId, setInspectedTaskId] = useState(null);
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [dashRes, tasksRes] = await Promise.all([
          getDashboardStats(),
          getTasks({ limit: 15, sortBy: 'dueDate', sortOrder: 'asc' }),
        ]);
        if (active) {
          setData(dashRes);
          const list = tasksRes?.data || [];
          setRecentTasks(list);
          if (list.length > 0) setInspectedTaskId(list[0]._id);
        }
      } catch (err) {
        if (active) setError(extractApiError(err, 'Failed to load dashboard metrics.'));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const weekDays = useMemo(() => getCurrentWeekDays(), []);
  const weekRangeLabel = `${formatShortDate(weekDays[0].date)} – ${formatShortDate(weekDays[6].date)}`;

  const filteredTimelineTasks = useMemo(() => {
    let list = recentTasks;
    if (timelineFilter === 'ACTIVE') {
      list = list.filter((t) => t.status === 'Todo' || t.status === 'In Progress');
    } else if (timelineFilter === 'OVERDUE') {
      list = list.filter((t) => t.isOverdue);
    }
    return list.slice(0, 7);
  }, [recentTasks, timelineFilter]);

  const inspectedTask = useMemo(() => {
    return (
      recentTasks.find((t) => t._id === inspectedTaskId) ||
      filteredTimelineTasks[0] ||
      null
    );
  }, [recentTasks, filteredTimelineTasks, inspectedTaskId]);

  if (loading) return <LoadingSpinner label="Loading dashboard metrics..." />;

  const emp = data?.employees || { total: 0, active: 0, inactive: 0, onLeave: 0 };
  const tasks = data?.tasks || {
    total: 0,
    todo: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    overdue: 0,
  };
  const workload = data?.workload || [];

  const statusCounts = {
    Todo: tasks.todo,
    'In Progress': tasks.inProgress,
    Completed: tasks.completed,
    Cancelled: tasks.cancelled,
    Overdue: tasks.overdue,
  };
  const totalForBar = tasks.total || 1;
  const completedPct = Math.round(((tasks.completed || 0) / totalForBar) * 100);

  return (
    <div key={replayKey} className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Operations Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }} className="text-xs sm:text-sm mt-0.5">
            Sprint timeline, live team capacity (0–{MAX_ACTIVE_TASKS_PER_EMPLOYEE} active cap), and task workflow health.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sprint Week: {weekRangeLabel}</span>
          </div>


          <button
            type="button"
            onClick={() => navigate('/tasks/new')}
            style={{ backgroundColor: 'var(--accent-primary)' }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white shadow-sm hover:opacity-90 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      <ErrorBanner message={error} />

      {/* Top Row: 4 Employee Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Employees"
          value={emp.total}
          replayKey={replayKey}
          hint="Roster →"
          hintClass="text-blue-600 dark:text-blue-400"
          subtitle="All registered team members"
          icon={<Users className="w-4 h-4" />}
          iconWrap="bg-blue-500/12 text-blue-600 dark:text-blue-400"
          valueClass=""
          delay={40}
          onClick={() => navigate('/employees')}
        />
        <KpiCard
          title="Active"
          value={emp.active}
          replayKey={replayKey}
          hint="Assignable →"
          hintClass="text-emerald-600 dark:text-emerald-400"
          subtitle={`Eligible for tasks up to ${MAX_ACTIVE_TASKS_PER_EMPLOYEE}/${MAX_ACTIVE_TASKS_PER_EMPLOYEE}`}
          icon={<CheckCircle2 className="w-4 h-4" />}
          iconWrap="bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
          valueClass="text-emerald-600 dark:text-emerald-400"
          delay={100}
          onClick={() => navigate('/employees?status=Active')}
        />
        <KpiCard
          title="On Leave"
          value={emp.onLeave}
          replayKey={replayKey}
          hint="Leave Window →"
          hintClass="text-amber-600 dark:text-amber-400"
          subtitle="New assignment blocked during leave"
          icon={<Clock className="w-4 h-4" />}
          iconWrap="bg-amber-500/12 text-amber-600 dark:text-amber-400"
          valueClass="text-amber-600 dark:text-amber-400"
          delay={160}
          onClick={() => navigate('/employees?status=On%20Leave')}
        />
        <KpiCard
          title="Inactive"
          value={emp.inactive}
          replayKey={replayKey}
          hint="Archived →"
          hintClass="text-rose-600 dark:text-rose-400"
          subtitle="Cannot be selected as task assignee"
          icon={<Ban className="w-4 h-4" />}
          iconWrap="bg-rose-500/12 text-rose-600 dark:text-rose-400"
          valueClass="text-rose-600 dark:text-rose-400"
          delay={220}
          onClick={() => navigate('/employees?status=Inactive')}
        />
      </div>

      {/* Middle Bento Grid: Left 7 Cols (Status Breakdown + Weekly Timeline) | Right 5 Cols (Workload & Capacity) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left 7 Columns */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          {/* Task Status Breakdown */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              animationDelay: '120ms',
            }}
            className="bento-card animate-stagger-in rounded-2xl p-5 sm:p-6 border shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-bold">Task Status Breakdown</h2>
                <p style={{ color: 'var(--text-secondary)' }} className="text-xs">
                  Click any status pill to inspect matching tasks in the Tasks view
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/tasks')}
                style={{
                  backgroundColor: 'var(--bg-muted)',
                  color: 'var(--text-secondary)',
                }}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg self-start sm:self-auto hover:opacity-85 cursor-pointer"
              >
                {tasks.total} Total Tasks
              </button>
            </div>

            {/* 5 Status Pills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {Object.entries(STATUS_META).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => navigate(meta.query)}
                  className={`text-left p-3 rounded-xl border ${meta.badgeClass} hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`w-2 h-2 rounded-full ${meta.dotClass}`} />
                    <span className="text-lg font-extrabold tracking-tight">
                      {statusCounts[key]}
                    </span>
                  </div>
                  <div className="mt-1.5 text-[11px] font-bold truncate">{meta.label}</div>
                </button>
              ))}
            </div>

            {/* Stacked Proportional Progress Bar */}
            <div className="mt-5">
              <div
                style={{ color: 'var(--text-secondary)' }}
                className="flex items-center justify-between text-[11px] font-medium mb-1.5"
              >
                <span>Pipeline Distribution</span>
                <span>{completedPct}% Completed</span>
              </div>
              <div
                style={{ backgroundColor: 'var(--bg-muted)' }}
                className="h-3 w-full rounded-full overflow-hidden flex"
              >
                {['Todo', 'In Progress', 'Completed', 'Cancelled'].map((st) => {
                  const pct = (statusCounts[st] / totalForBar) * 100;
                  if (pct <= 0) return null;
                  return (
                    <div
                      key={st}
                      style={{ width: `${pct}%` }}
                      className={`${STATUS_META[st].barClass} h-full transition-all duration-500`}
                      title={`${st}: ${statusCounts[st]} (${Math.round(pct)}%)`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Weekly Task Timeline */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              animationDelay: '180ms',
            }}
            className="bento-card animate-stagger-in rounded-2xl p-5 sm:p-6 border shadow-xs flex-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold">Weekly Task Timeline</h2>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/12 text-blue-600 dark:text-blue-300">
                      {weekRangeLabel}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-xs mt-0.5">
                    Hover or tap a timeline block to preview task details & status rules
                  </p>
                </div>

                {/* Quick Timeline Filter */}
                <div
                  style={{ backgroundColor: 'var(--bg-muted)' }}
                  className="flex items-center gap-1 p-1 rounded-xl self-start sm:self-auto"
                >
                  {[
                    { id: 'ALL', label: 'All' },
                    { id: 'ACTIVE', label: 'Active' },
                    { id: 'OVERDUE', label: 'Overdue' },
                  ].map((opt) => {
                    const active = timelineFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTimelineFilter(opt.id)}
                        style={
                          active
                            ? {
                              backgroundColor: 'var(--bg-surface)',
                              color: 'var(--accent-primary)',
                            }
                            : { color: 'var(--text-secondary)' }
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${active ? 'shadow-xs' : 'hover:opacity-80'
                          }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Columns Header */}
              <div
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                className="grid grid-cols-7 text-center text-[11px] font-semibold pb-2 border-b"
              >
                {weekDays.map((d) => (
                  <div
                    key={d.iso}
                    className={d.isToday ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}
                  >
                    {d.label} <span className="hidden sm:inline">{d.dayNum}</span>
                  </div>
                ))}
              </div>

              {/* Timeline Track Rows */}
              <div className="relative mt-3 space-y-2.5 py-2 timeline-grid rounded-xl min-h-[160px]">
                {filteredTimelineTasks.length === 0 ? (
                  <div
                    style={{ color: 'var(--text-secondary)' }}
                    className="py-10 text-center text-xs"
                  >
                    No tasks match the &ldquo;{timelineFilter}&rdquo; timeline filter.
                  </div>
                ) : (
                  filteredTimelineTasks.map((task) => {
                    const { startCol, spanCols } = getTaskTimelineSpan(task, weekDays);
                    const leftPct = (startCol / 7) * 100;
                    const widthPct = Math.min((spanCols / 7) * 100, 100 - leftPct);
                    const visualStatus = task.isOverdue ? 'Overdue' : task.status;
                    const meta = STATUS_META[visualStatus] || STATUS_META.Todo;
                    const empName =
                      task.assignedEmployee?.fullName ||
                      task.employeeSnapshot?.fullName ||
                      'Unassigned';

                    return (
                      <div key={task._id} className="relative h-9 flex items-center">
                        <button
                          type="button"
                          onMouseEnter={() => setInspectedTaskId(task._id)}
                          onClick={() => setInspectedTaskId(task._id)}
                          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                          className={`timeline-pill cursor-pointer absolute h-8 px-3 rounded-xl ${meta.timelineClass} flex items-center justify-between gap-2 overflow-hidden text-left`}
                        >
                          <span className="text-[11px] font-bold truncate">{task.title}</span>
                          <span className="hidden sm:inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-black/20 shrink-0">
                            {getInitials(empName)}
                          </span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Selected / Hovered Timeline Inspector Strip */}
            <div
              style={{
                backgroundColor: 'var(--bg-muted)',
                borderColor: 'var(--border-subtle)',
              }}
              className="mt-4 p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs"
            >
              {inspectedTask ? (
                <>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      style={{ backgroundColor: 'var(--accent-primary)' }}
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                    />
                    <div className="truncate">
                      <strong className="font-semibold">{inspectedTask.title}</strong>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {' '}
                        •{' '}
                        {inspectedTask.assignedEmployee?.fullName ||
                          inspectedTask.employeeSnapshot?.fullName ||
                          'Unassigned'}{' '}
                        • {inspectedTask.status}
                        {inspectedTask.isOverdue ? ' (Overdue)' : ''} • Due{' '}
                        {formatShortDate(inspectedTask.dueDate)}
                        {getValidNextStatuses(inspectedTask.status).length > 0
                          ? ` • Next: ${getValidNextStatuses(inspectedTask.status).join(', ')}`
                          : ''}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/tasks/${inspectedTask._id}`)}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline shrink-0 cursor-pointer self-start sm:self-auto"
                  >
                    Open Task →
                  </button>
                </>
              ) : (
                <span style={{ color: 'var(--text-secondary)' }}>
                  Create tasks to visualize their schedule across the sprint week.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Employee Workload & Capacity */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            animationDelay: '150ms',
          }}
          className="xl:col-span-5 bento-card animate-stagger-in rounded-2xl p-5 sm:p-6 border shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-bold">Employee Workload & Capacity</h2>
                <p style={{ color: 'var(--text-secondary)' }} className="text-xs mt-0.5">
                  Active task cap is{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {MAX_ACTIVE_TASKS_PER_EMPLOYEE} / {MAX_ACTIVE_TASKS_PER_EMPLOYEE}
                  </strong>
                  . Click a row to view details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/employees')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0 cursor-pointer"
              >
                Full Roster →
              </button>
            </div>

            {/* Capacity Legend */}
            <div
              style={{
                color: 'var(--text-secondary)',
                borderColor: 'var(--border-subtle)',
              }}
              className="flex items-center flex-wrap gap-3 text-[11px] mb-4 pb-3 border-b"
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                Available (0–2/3)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                Full Cap (3/3)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                On Leave
              </span>
            </div>

            {/* Capacity Rows List */}
            <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
              {workload.length === 0 ? (
                <div
                  style={{ color: 'var(--text-secondary)' }}
                  className="py-8 text-center text-xs"
                >
                  No active employee workload data available.
                </div>
              ) : (
                workload.map((row) => {
                  const activeCount = row.activeTasks || 0;
                  const pct = Math.min((activeCount / MAX_ACTIVE_TASKS_PER_EMPLOYEE) * 100, 100);
                  const isFull = activeCount >= MAX_ACTIVE_TASKS_PER_EMPLOYEE;
                  const isLeave = row.status === 'On Leave';

                  let barColor = 'bg-emerald-500';
                  let capBadge = (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-300">
                      {activeCount}/{MAX_ACTIVE_TASKS_PER_EMPLOYEE} Active
                    </span>
                  );

                  if (isLeave) {
                    barColor = 'bg-amber-500';
                    capBadge = (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/12 text-amber-600 dark:text-amber-300">
                        On Leave ({activeCount}/{MAX_ACTIVE_TASKS_PER_EMPLOYEE})
                      </span>
                    );
                  } else if (isFull) {
                    barColor = 'bg-rose-500';
                    capBadge = (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/12 text-rose-600 dark:text-rose-300">
                        Full Cap {activeCount}/{MAX_ACTIVE_TASKS_PER_EMPLOYEE}
                      </span>
                    );
                  }

                  return (
                    <button
                      key={row._id}
                      type="button"
                      onClick={() => navigate(`/employees/${row._id}`)}
                      style={{
                        backgroundColor: 'var(--bg-muted)',
                        borderColor: 'var(--border-subtle)',
                      }}
                      className="w-full text-left group cursor-pointer p-3 rounded-xl border hover:border-blue-500/40 transition"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            style={{ backgroundColor: 'var(--accent-primary)' }}
                            className="w-8 h-8 rounded-xl text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs"
                          >
                            {getInitials(row.fullName)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate group-hover:text-blue-500 transition">
                              {row.fullName}
                            </div>
                            <div
                              style={{ color: 'var(--text-secondary)' }}
                              className="text-[11px] truncate"
                            >
                              {row.department} • {row.employeeId}
                            </div>
                          </div>
                        </div>
                        {capBadge}
                      </div>

                      <div className="h-2 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`capacity-bar-fill h-full rounded-full ${barColor}`}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Bottom Rule Tip Box */}
          <div
            style={{
              backgroundColor: 'var(--bg-muted)',
              borderColor: 'var(--border-subtle)',
            }}
            className="mt-5 p-3.5 rounded-xl border flex items-center justify-between gap-3"
          >
            <div style={{ color: 'var(--text-secondary)' }} className="text-xs">
              <span className="font-bold text-blue-600 dark:text-blue-400">Capacity Rule:</span>{' '}
              Only <strong>Active</strong> members with &lt; {MAX_ACTIVE_TASKS_PER_EMPLOYEE}{' '}
              active tasks can receive new tasks.
            </div>
            <button
              type="button"
              onClick={() => navigate('/tasks/new')}
              style={{ backgroundColor: 'var(--accent-primary)' }}
              className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold shrink-0 hover:opacity-90 transition cursor-pointer"
            >
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  replayKey,
  hint,
  hintClass,
  subtitle,
  icon,
  iconWrap,
  valueClass,
  delay,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        animationDelay: `${delay}ms`,
      }}
      className="bento-card animate-stagger-in text-left cursor-pointer rounded-2xl p-5 border shadow-xs hover:border-blue-500/45 transition"
    >
      <div className="flex items-center justify-between">
        <span
          style={{ color: 'var(--text-secondary)' }}
          className="text-xs font-semibold uppercase tracking-wider"
        >
          {title}
        </span>
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconWrap}`}>
          {icon}
        </span>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className={`text-3xl font-extrabold tracking-tight ${valueClass}`}>
          <AnimatedNumber value={value} replayKey={replayKey} />
        </span>
        <span className={`text-xs font-medium ${hintClass}`}>{hint}</span>
      </div>
      <div style={{ color: 'var(--text-secondary)' }} className="mt-2 text-xs">
        {subtitle}
      </div>
    </button>
  );
}
