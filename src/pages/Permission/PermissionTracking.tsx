import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid, Alert, Pagination, Skeleton,
  TextField, Avatar, Chip, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { permissionApi, staffApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const emptyForm = { staffId: '', date: '', hours: '', reason: '' };

const PermissionTracking: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const [perms, setPerms] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStaff, setFilterStaff] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPerms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await permissionApi.getAll({
        page, limit: 10,
        staffId: isAdmin ? (filterStaff || undefined) : (user?.id || undefined),
        month: filterMonth || undefined,
      });
      setPerms(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch { setPerms([]); }
    finally { setLoading(false); }
  }, [page, filterStaff, filterMonth, isAdmin, user]);

  useEffect(() => { fetchPerms(); }, [fetchPerms]);
  useEffect(() => {
    staffApi.getAll({ limit: 100 }).then(r => setStaffList(r.data.data)).catch(() => {});
  }, []);

  const handleSave = async () => {
    const h = parseFloat(form.hours);
    if (!form.staffId || !form.date || !form.hours || isNaN(h) || h <= 0) {
      setFormError('Staff, date and valid hours are required'); return;
    }
    setSaving(true); setFormError('');
    try {
      if (editingId) {
        await permissionApi.update(editingId, { ...form, hours: h });
      } else {
        await permissionApi.create({ ...form, hours: h });
      }
      setDialogOpen(false); fetchPerms();
    } catch (e: any) {
      setFormError(e.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try { await permissionApi.delete(deletingId); setDeleteDialogOpen(false); fetchPerms(); }
    catch { setDeleteDialogOpen(false); }
  };

  const openAdd = () => {
    setForm({ ...emptyForm, staffId: !isAdmin ? user?.id || '' : '' });
    setEditingId(null);
    setFormError(''); setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setForm({
      staffId: p.staffId,
      date: p.date,
      hours: String(p.hours),
      reason: p.reason || '',
    });
    setEditingId(p.id); setFormError(''); setDialogOpen(true);
  };

  // Compute total hours per staff from current page for summary
  const totalsMap: Record<string, { name: string; hours: number }> = {};
  perms.forEach(p => {
    if (!totalsMap[p.staffId]) totalsMap[p.staffId] = { name: p.staff?.fullName || p.staffId, hours: 0 };
    totalsMap[p.staffId].hours += parseFloat(p.hours || 0);
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5">Permission Tracking</Typography>
          <Typography sx={{ color: '#64748b', fontSize: 14 }}>Track hourly permission entries for staff</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Permission</Button>
      </Box>

      {/* Summary chips */}
      {Object.keys(totalsMap).length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#64748b', mb: 1.5 }}>Hours summary (current view)</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.values(totalsMap).map(t => (
                <Chip key={t.name} label={`${t.name}: ${t.hours.toFixed(1)} hrs`}
                  icon={<AccessTimeIcon />} variant="outlined" color="primary" size="small" />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2}>
            {isAdmin && (
              <Grid item xs={12} sm={5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Staff</InputLabel>
                  <Select value={filterStaff} label="Staff" onChange={e => { setFilterStaff(e.target.value); setPage(1); }}>
                    <MenuItem value="">All Staff</MenuItem>
                    {staffList.map(s => <MenuItem key={s.id} value={s.id}>{s.fullName}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="Month" type="month" value={filterMonth}
                onChange={e => { setFilterMonth(e.target.value); setPage(1); }}
                slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Staff</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Logged At</TableCell>
                {isAdmin && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(isAdmin ? 6 : 5)].map((__, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                </TableRow>
              )) : perms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                    <AccessTimeIcon sx={{ fontSize: 48, mb: 1, display: 'block', mx: 'auto', opacity: 0.3 }} />
                    No permission records found
                  </TableCell>
                </TableRow>
              ) : perms.map((p) => (
                <TableRow key={p.id} sx={{ '&:hover': { bgcolor: '#f8fafc' }, transition: 'background 0.15s' }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 30, height: 30, fontSize: 12, bgcolor: '#059669' }}>
                        {p.staff?.fullName?.[0] || '?'}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{p.staff?.fullName || '—'}</Typography>
                        <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>{p.staff?.department || ''}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><Typography sx={{ fontSize: 13 }}>{new Date(p.date).toLocaleDateString()}</Typography></TableCell>
                  <TableCell>
                    <Chip label={`${parseFloat(p.hours).toFixed(1)} hrs`} size="small"
                      sx={{ bgcolor: '#ecfdf5', color: '#059669', fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.reason || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>{new Date(p.createdAt).toLocaleString()}</Typography>
                  </TableCell>
                  {isAdmin && (
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.25 }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(p)} sx={{ color: '#2563eb' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => { setDeletingId(p.id); setDeleteDialogOpen(true); }} sx={{ color: '#dc2626' }}>
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
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
          </Box>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 18, pb: 1 }}>
          {editingId ? 'Edit Permission Entry' : 'Add Permission Entry'}
          <Typography sx={{ fontSize: 13, color: '#94a3b8', fontWeight: 400 }}>
            {editingId ? 'Modify the permission record details' : 'Log a new permission hours entry'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Grid container spacing={2}>
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
              <TextField fullWidth label="Date *" type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Hours *" type="number" value={form.hours}
                inputProps={{ min: 0.5, max: 12, step: 0.5 }}
                onChange={e => setForm({ ...form, hours: e.target.value })} placeholder="e.g. 1.5" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Reason" multiline rows={2} value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}>
            {saving ? 'Saving…' : editingId ? 'Update Entry' : 'Add Entry'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Permission Record?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#475569' }}>This will permanently delete the permission record. This action cannot be undone.</Typography>
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

export default PermissionTracking;
