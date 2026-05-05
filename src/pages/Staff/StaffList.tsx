import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton,
  TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Alert,
  Pagination, Skeleton, Tooltip, Avatar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { staffApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const DEPARTMENTS = ["IOT", "IT"];
const ROLES = ['Associate Software Engineer', 'Software Engineer', 'Associate IOT Engineer'];

const emptyForm = {
  fullName: '', email: '', phone: '', role: '', department: '',
  dateOfJoining: '', status: 'active', password: '', userRole: 'staff',
};

const StaffList: React.FC = () => {
  const { isAdmin } = useAuth();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await staffApi.getAll({ page, limit: 10, search: search || undefined, department: department || undefined, status: status || undefined });
      setStaff(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch { setStaff([]); }
    finally { setLoading(false); }
  }, [page, search, department, status]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const openAdd = () => { setForm({ ...emptyForm }); setEditingId(null); setFormError(''); setDialogOpen(true); };
  const openEdit = (s: any) => {
    setForm({ fullName: s.fullName, email: s.email, phone: s.phone || '', role: s.role || '', department: s.department || '', dateOfJoining: s.dateOfJoining || '', status: s.status, password: '', userRole: s.userRole || 'staff' });
    setEditingId(s.id); setFormError(''); setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.fullName || !form.email) { setFormError('Full name and email are required'); return; }
    setSaving(true); setFormError('');
    try {
      const payload: any = { ...form };
      if (!payload.password) delete payload.password;
      if (editingId) await staffApi.update(editingId, payload);
      else await staffApi.create(payload);
      setDialogOpen(false); fetchStaff();
    } catch (e: any) {
      setFormError(e.response?.data?.message || 'Failed to save staff');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try { await staffApi.delete(deletingId); setDeleteDialogOpen(false); fetchStaff(); }
    catch { setDeleteDialogOpen(false); }
  };

  const statusColor = (s: string) => s === 'active' ? 'success' : 'default';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5">Staff Management</Typography>
          <Typography sx={{ color: '#64748b', fontSize: 14 }}>Manage your organisation's staff members</Typography>
        </Box>
        {isAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Staff</Button>
        )}
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 5 }}>
              <TextField fullWidth size="small" placeholder="Search name or email…" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94a3b8' }} /></InputAdornment> } }} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select value={department} label="Department" onChange={(e) => { setDepartment(e.target.value); setPage(1); }}>
                  <MenuItem value="">All</MenuItem>
                  {DEPARTMENTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={status} label="Status" onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
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
                <TableCell>Department / Role</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Status</TableCell>
                {isAdmin && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? [...Array(6)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(isAdmin ? 6 : 5)].map((__, j) => (
                    <TableCell key={j}><Skeleton /></TableCell>
                  ))}
                </TableRow>
              )) : staff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                    <PersonIcon sx={{ fontSize: 48, mb: 1, display: 'block', mx: 'auto', opacity: 0.3 }} />
                    No staff found
                  </TableCell>
                </TableRow>
              ) : staff.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: '#2563eb', fontSize: 14 }}>{s.fullName?.[0]}</Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{s.fullName}</Typography>
                        <Typography sx={{ color: '#64748b', fontSize: 12 }}>{s.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 14 }}>{s.department || '—'}</Typography>
                    <Typography sx={{ color: '#64748b', fontSize: 12 }}>{s.role || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13 }}>{s.phone || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13 }}>{s.dateOfJoining ? new Date(s.dateOfJoining).toLocaleDateString() : '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={s.status} color={statusColor(s.status) as any} size="small" />
                  </TableCell>
                  {isAdmin && (
                    <TableCell align="right">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(s)} sx={{ color: '#2563eb' }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" onClick={() => { setDeletingId(s.id); setDeleteDialogOpen(true); }} sx={{ color: '#dc2626' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
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
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingId ? 'Edit Staff' : 'Add New Staff'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField fullWidth label="Full Name *" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select value={form.department} label="Department" onChange={e => setForm({ ...form, department: e.target.value })}>
                  {DEPARTMENTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Role/Designation</InputLabel>
                <Select value={form.role} label="Role/Designation" onChange={e => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Date of Joining" type="date" value={form.dateOfJoining}
                onChange={e => setForm({ ...form, dateOfJoining: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={form.status} label="Status" onChange={e => setForm({ ...form, status: e.target.value })}>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>User Role</InputLabel>
                <Select value={form.userRole} label="User Role" onChange={e => setForm({ ...form, userRole: e.target.value })}>
                  <MenuItem value="staff">Staff</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label={editingId ? 'New Password (leave blank to keep)' : 'Password'} type="password"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update' : 'Add Staff'}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Staff?</DialogTitle>
        <DialogContent><Typography>This will permanently delete the staff member and all their records.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffList;
