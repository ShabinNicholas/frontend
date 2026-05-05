import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, TextField,
  FormControl, InputLabel, Select, MenuItem, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Skeleton,
  Divider, Chip, Alert, Stack,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FilterListIcon from '@mui/icons-material/FilterList';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { reportsApi, staffApi } from '../../api';

const Reports: React.FC = () => {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ fromDate: '', toDate: '', month: '', staffId: '', department: '' });
  const [applied, setApplied] = useState<any>({});
  const [error, setError] = useState('');

  const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales', 'Support', 'Legal'];

  useEffect(() => {
    staffApi.getAll({ limit: 100 }).then(r => setStaffList(r.data.data)).catch(() => {});
    fetchReport({});
  }, []);

  const fetchReport = useCallback(async (f: any) => {
    setLoading(true); setError('');
    try {
      const res = await reportsApi.getSummary(f);
      setSummary(res.data);
    } catch { setError('Failed to load report data'); }
    finally { setLoading(false); }
  }, []);

  const handleApply = () => {
    const f: any = {};
    if (filters.fromDate) f.fromDate = filters.fromDate;
    if (filters.toDate) f.toDate = filters.toDate;
    if (filters.month) f.month = filters.month;
    if (filters.staffId) f.staffId = filters.staffId;
    if (filters.department) f.department = filters.department;
    setApplied(f);
    fetchReport(f);
  };

  const handleExport = async (type: 'csv' | 'pdf') => {
    try {
      const res = type === 'csv' ? await reportsApi.exportCsv(applied) : await reportsApi.exportPdf(applied);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = type === 'csv' ? 'leave_report.csv' : 'staff_report.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch { setError('Export failed. Please try again.'); }
  };

  const SkeletonRow = ({ cols }: { cols: number }) => (
    <TableRow>{[...Array(cols)].map((_, i) => <TableCell key={i}><Skeleton /></TableCell>)}</TableRow>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5">Reports & Analytics</Typography>
          <Typography sx={{ color: '#64748b', fontSize: 14 }}>View aggregated leave and permission reports</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => handleExport('csv')} size="small">Export CSV</Button>
          <Button variant="outlined" color="error" startIcon={<PictureAsPdfIcon />} onClick={() => handleExport('pdf')} size="small">Export PDF</Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterListIcon sx={{ color: '#2563eb' }} />
            <Typography sx={{ fontWeight: 600 }}>Filter Reports</Typography>
          </Box>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField fullWidth size="small" label="From Date" type="date"
                value={filters.fromDate} onChange={e => setFilters({ ...filters, fromDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField fullWidth size="small" label="To Date" type="date"
                value={filters.toDate} onChange={e => setFilters({ ...filters, toDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField fullWidth size="small" label="Month" type="month"
                value={filters.month} onChange={e => setFilters({ ...filters, month: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Staff</InputLabel>
                <Select value={filters.staffId} label="Staff" onChange={e => setFilters({ ...filters, staffId: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  {staffList.map(s => <MenuItem key={s.id} value={s.id}>{s.fullName}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select value={filters.department} label="Department" onChange={e => setFilters({ ...filters, department: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  {DEPARTMENTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button fullWidth variant="contained" onClick={handleApply}>Apply Filters</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Leave Summary Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon sx={{ color: '#2563eb' }} />
            <Typography variant="h6">Leave Summary per Staff</Typography>
          </Box>
          <Divider />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Staff Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell align="center">Total</TableCell>
                  <TableCell align="center">Sick</TableCell>
                  <TableCell align="center">Casual</TableCell>
                  <TableCell align="center">Paid</TableCell>
                  <TableCell align="center">Unpaid</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? [...Array(4)].map((_, i) => <SkeletonRow key={i} cols={7} />) :
                  !summary?.leaveSummary?.length ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#94a3b8' }}>No data for selected filters</TableCell>
                    </TableRow>
                  ) : summary.leaveSummary.map((row: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell sx={{ fontWeight: 600 }}>{row.fullName || '—'}</TableCell>
                      <TableCell>{row.department || '—'}</TableCell>
                      <TableCell align="center"><Chip label={parseFloat(row.totalLeaves || 0) % 1 === 0 ? parseInt(row.totalLeaves || 0) : parseFloat(row.totalLeaves || 0).toFixed(1)} size="small" color="primary" /></TableCell>
                      <TableCell align="center"><Typography sx={{ fontSize: 13 }}>{parseFloat(row.sickLeaves || 0) % 1 === 0 ? parseInt(row.sickLeaves || 0) : parseFloat(row.sickLeaves || 0).toFixed(1)}</Typography></TableCell>
                      <TableCell align="center"><Typography sx={{ fontSize: 13 }}>{parseFloat(row.casualLeaves || 0) % 1 === 0 ? parseInt(row.casualLeaves || 0) : parseFloat(row.casualLeaves || 0).toFixed(1)}</Typography></TableCell>
                      <TableCell align="center"><Typography sx={{ fontSize: 13 }}>{parseFloat(row.paidLeaves || 0) % 1 === 0 ? parseInt(row.paidLeaves || 0) : parseFloat(row.paidLeaves || 0).toFixed(1)}</Typography></TableCell>
                      <TableCell align="center"><Typography sx={{ fontSize: 13 }}>{parseFloat(row.unpaidLeaves || 0) % 1 === 0 ? parseInt(row.unpaidLeaves || 0) : parseFloat(row.unpaidLeaves || 0).toFixed(1)}</Typography></TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Permission Hours Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon sx={{ color: '#7c3aed' }} />
            <Typography variant="h6">Permission Hours per Staff</Typography>
          </Box>
          <Divider />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Staff Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell align="right">Total Permission Hours</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? [...Array(4)].map((_, i) => <SkeletonRow key={i} cols={3} />) :
                  !summary?.permSummary?.length ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4, color: '#94a3b8' }}>No data</TableCell>
                    </TableRow>
                  ) : summary.permSummary.map((row: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell sx={{ fontWeight: 600 }}>{row.fullName || '—'}</TableCell>
                      <TableCell>{row.department || '—'}</TableCell>
                      <TableCell align="right">
                        <Chip label={`${parseFloat(row.totalHours || 0).toFixed(1)} hrs`} size="small"
                          sx={{ bgcolor: '#f5f3ff', color: '#7c3aed', fontWeight: 700 }} />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Monthly Summary */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon sx={{ color: '#059669' }} />
            <Typography variant="h6">Monthly Summary</Typography>
          </Box>
          <Divider />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell align="center">Total Leaves</TableCell>
                  <TableCell align="center">Total Permission Hours</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? [...Array(4)].map((_, i) => <SkeletonRow key={i} cols={3} />) :
                  !summary?.monthlySummary?.length ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4, color: '#94a3b8' }}>No data</TableCell>
                    </TableRow>
                  ) : summary.monthlySummary.map((row: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell sx={{ fontWeight: 600 }}>{row.month}</TableCell>
                      <TableCell align="center"><Chip label={row.totalLeaves % 1 === 0 ? row.totalLeaves : row.totalLeaves.toFixed(1)} size="small" color="primary" /></TableCell>
                      <TableCell align="center">
                        <Chip label={`${row.totalPermissionHours.toFixed(1)} hrs`} size="small"
                          sx={{ bgcolor: '#ecfdf5', color: '#059669', fontWeight: 700 }} />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;
