import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton,
  Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid, Alert, Pagination, Skeleton,
  Tooltip, TextField, Avatar, Switch, FormControlLabel, RadioGroup,
  Radio, FormLabel, Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventNoteIcon from '@mui/icons-material/EventNote';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import { leaveApi, staffApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const LEAVE_TYPES = ['sick', 'casual', 'paid', 'unpaid'];

const emptyForm = {
  staffId: '', leaveType: 'casual', startDate: '', endDate: '',
  reason: '', status: 'approved', isHalfDay: false, halfDayPeriod: 'first_half',
};

const statusColors: Record<string, 'warning' | 'success' | 'error'> = {
  pending: 'warning', approved: 'success', rejected: 'error',
};

const leaveTypeColors: Record<string, string> = {
  sick: '#ef4444', casual: '#3b82f6', paid: '#10b981', unpaid: '#f59e0b',
};

const LeaveManagement: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStaff, setFilterStaff] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await leaveApi.getAll({
        page, limit: 10,
        staffId: isAdmin ? (filterStaff || undefined) : (user?.id || undefined),
        status: filterStatus || undefined,
        month: filterMonth || undefined,
      });
      setLeaves(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch { setLeaves([]); }
    finally { setLoading(false); }
  }, [page, filterStaff, filterStatus, filterMonth, isAdmin, user]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  useEffect(() => {
    staffApi.getAll({ limit: 100 }).then(r => setStaffList(r.data.data)).catch(() => {});
  }, []);

  /* Stats derived from current page data */
  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    halfDay: leaves.filter(l => l.isHalfDay).length,
  };

  const handleSave = async () => {
    if (!form.staffId || !form.startDate) {
      setFormError('Staff and start date are required'); return;
    }
    if (!form.isHalfDay && !form.endDate) {
      setFormError('End date is required for full-day leaves'); return;
    }
    setSaving(true); setFormError('');
    try {
      const payload = {
        ...form,
        endDate: form.isHalfDay ? form.startDate : form.endDate,
        halfDayPeriod: form.isHalfDay ? form.halfDayPeriod : undefined,
      };
      if (editingId) {
        await leaveApi.update(editingId, payload);
      } else {
        await leaveApi.create(payload);
      }
      setDialogOpen(false); fetchLeaves();
    } catch (e: any) {
      setFormError(e.response?.data?.message || 'Failed to save leave');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try { await leaveApi.delete(deletingId); setDeleteDialogOpen(false); fetchLeaves(); }
    catch { setDeleteDialogOpen(false); }
  };

  const handleStatus = async (id: string, status: string) => {
    try { await leaveApi.updateStatus(id, status); fetchLeaves(); }
    catch {}
  };

  const openAdd = () => {
    setForm({ ...emptyForm, staffId: !isAdmin ? user?.id || '' : '' });
    setEditingId(null);
    setFormError(''); setDialogOpen(true);
  };

  const openEdit = (l: any) => {
    setForm({
      staffId: l.staffId, leaveType: l.leaveType,
      startDate: l.startDate, endDate: l.endDate,
      reason: l.reason || '', status: l.status,
      isHalfDay: l.isHalfDay || false,
      halfDayPeriod: l.halfDayPeriod || 'first_half',
    });
    setEditingId(l.id); setFormError(''); setDialogOpen(true);
  };

  const getDuration = (l: any) => {
    if (l.isHalfDay) return '½ day';
    const start = new Date(l.startDate);
    const end = new Date(l.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) => (
    <Paper elevation={0} sx={{
      p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', gap: 2,
      transition: 'all 0.2s ease',
      '&:hover': { borderColor: color, boxShadow: `0 4px 12px ${color}18` },
    }}>
      <Box sx={{
        width: 44, height: 44, borderRadius: 2.5, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        bgcolor: `${color}14`, color: color,
      }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, color: '#0f172a' }}>{value}</Typography>
        <Typography sx={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</Typography>
      </Box>
    </Paper>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>Leave Management</Typography>
          <Typography sx={{ color: '#64748b', fontSize: 14, mt: 0.5 }}>Track and manage employee leave requests</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3, py: 1.2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.18)' } }}>
          Apply Leave
        </Button>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<CalendarMonthIcon />} label="Total Leaves" value={stats.total} color="#3b82f6" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<PendingActionsIcon />} label="Pending" value={stats.pending} color="#f59e0b" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<CheckCircleOutlineIcon />} label="Approved" value={stats.approved} color="#10b981" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<WbSunnyIcon />} label="Half Days" value={stats.halfDay} color="#8b5cf6" />
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 2, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2} alignItems="center">
            {isAdmin && (
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Staff</InputLabel>
                  <Select value={filterStaff} label="Staff" onChange={e => { setFilterStaff(e.target.value); setPage(1); }}>
                    <MenuItem value="">All Staff</MenuItem>
                    {staffList.map(s => <MenuItem key={s.id} value={s.id}>{s.fullName}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={6} sm={isAdmin ? 3 : 4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={filterStatus} label="Status" onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={isAdmin ? 3 : 4}>
              <TextField fullWidth size="small" label="Month" type="month"
                value={filterMonth} onChange={e => { setFilterMonth(e.target.value); setPage(1); }}
                slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>Staff</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>Leave Type</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>Status</TableCell>
                {isAdmin && <TableCell align="right" sx={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(isAdmin ? 6 : 5)].map((__, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                </TableRow>
              )) : leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} align="center" sx={{ py: 8, color: '#94a3b8' }}>
                    <EventNoteIcon sx={{ fontSize: 56, mb: 1, display: 'block', mx: 'auto', opacity: 0.2 }} />
                    <Typography sx={{ fontSize: 15, fontWeight: 500 }}>No leave records found</Typography>
                    <Typography sx={{ fontSize: 12, mt: 0.5, color: '#cbd5e1' }}>Try adjusting your filters</Typography>
                  </TableCell>
                </TableRow>
              ) : leaves.map((l) => (
                <TableRow key={l.id} sx={{ '&:hover': { bgcolor: '#f8fafc' }, transition: 'background 0.15s' }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 34, height: 34, fontSize: 13, fontWeight: 600, bgcolor: '#7c3aed' }}>
                        {l.staff?.fullName?.[0] || '?'}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{l.staff?.fullName || '—'}</Typography>
                        <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>{l.staff?.department || ''}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={l.leaveType} size="small"
                      sx={{
                        fontWeight: 600, fontSize: 11, textTransform: 'capitalize',
                        bgcolor: `${leaveTypeColors[l.leaveType] || '#94a3b8'}14`,
                        color: leaveTypeColors[l.leaveType] || '#94a3b8',
                        border: `1px solid ${leaveTypeColors[l.leaveType] || '#94a3b8'}30`,
                      }} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {l.isHalfDay && (
                            <Tooltip title={l.halfDayPeriod === 'first_half' ? 'First Half' : 'Second Half'}>
                              {l.halfDayPeriod === 'first_half'
                                ? <WbSunnyIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                                : <NightsStayIcon sx={{ fontSize: 14, color: '#6366f1' }} />}
                            </Tooltip>
                          )}
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{getDuration(l)}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>
                          {new Date(l.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          {!l.isHalfDay && l.startDate !== l.endDate &&
                            ` — ${new Date(l.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#475569' }}>
                      {l.reason || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={l.status} color={statusColors[l.status] || 'default'} size="small"
                      sx={{ fontWeight: 600, fontSize: 11, textTransform: 'capitalize' }} />
                  </TableCell>
                  {isAdmin && (
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.25 }}>
                        {l.status === 'pending' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton size="small" onClick={() => handleStatus(l.id, 'approved')} sx={{ color: '#059669' }}>
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton size="small" onClick={() => handleStatus(l.id, 'rejected')} sx={{ color: '#dc2626' }}>
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(l)} sx={{ color: '#2563eb' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => { setDeletingId(l.id); setDeleteDialogOpen(true); }} sx={{ color: '#dc2626' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderTop: '1px solid #f1f5f9' }}>
            <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary"
              sx={{ '& .MuiPaginationItem-root': { fontWeight: 500 } }} />
          </Box>
        )}
      </Card>

      {/* Add/Edit Leave Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 18, pb: 1 }}>
          {editingId ? 'Edit Leave' : 'Apply for Leave'}
          <Typography sx={{ fontSize: 13, color: '#94a3b8', fontWeight: 400 }}>
            {editingId ? 'Modify the leave record details' : 'Submit a new leave request'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{formError}</Alert>}
          <Grid container spacing={2.5}>
            {isAdmin && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Staff Member *</InputLabel>
                  <Select value={form.staffId} label="Staff Member *" onChange={e => setForm({ ...form, staffId: e.target.value })}>
                    {staffList.map(s => <MenuItem key={s.id} value={s.id}>{s.fullName} — {s.department}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Leave Type *</InputLabel>
                <Select value={form.leaveType} label="Leave Type *" onChange={e => setForm({ ...form, leaveType: e.target.value })}>
                  {LEAVE_TYPES.map(t => <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            {/* Half Day Toggle */}
            <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch checked={form.isHalfDay} onChange={e => setForm({ ...form, isHalfDay: e.target.checked })}
                    color="primary" />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <WbSunnyIcon sx={{ fontSize: 18, color: form.isHalfDay ? '#f59e0b' : '#cbd5e1' }} />
                    <Typography sx={{ fontSize: 14, fontWeight: 500, color: form.isHalfDay ? '#0f172a' : '#94a3b8' }}>Half Day</Typography>
                  </Box>
                }
              />
            </Grid>

            {/* Half Day Period Selection */}
            {form.isHalfDay && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <FormControl>
                    <FormLabel sx={{ fontSize: 13, fontWeight: 600, mb: 1, color: '#475569' }}>Select Half</FormLabel>
                    <RadioGroup row value={form.halfDayPeriod}
                      onChange={e => setForm({ ...form, halfDayPeriod: e.target.value })}>
                      <FormControlLabel value="first_half"
                        control={<Radio size="small" />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <WbSunnyIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                            <Typography sx={{ fontSize: 13 }}>First Half (Morning)</Typography>
                          </Box>
                        } />
                      <FormControlLabel value="second_half"
                        control={<Radio size="small" />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <NightsStayIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                            <Typography sx={{ fontSize: 13 }}>Second Half (Afternoon)</Typography>
                          </Box>
                        } />
                    </RadioGroup>
                  </FormControl>
                </Paper>
              </Grid>
            )}

            <Grid item xs={12} sm={form.isHalfDay ? 12 : 6}>
              <TextField fullWidth label={form.isHalfDay ? 'Date *' : 'Start Date *'} type="date" value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            {!form.isHalfDay && (
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="End Date *" type="date" value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
            )}
            {isAdmin && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={form.status} label="Status" onChange={e => setForm({ ...form, status: e.target.value })}>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField fullWidth label="Reason" multiline rows={3} value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                placeholder="Brief reason for leave (optional)" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}>
            {saving ? 'Submitting…' : editingId ? 'Update Leave' : 'Submit Leave'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Leave Record?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#475569' }}>This will permanently delete the leave record. This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveManagement;
