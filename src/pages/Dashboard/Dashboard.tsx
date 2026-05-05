import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress,
  Avatar, Skeleton,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { reportsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bg: string;
  subtitle?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, bg, subtitle, loading }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ color: '#64748b', fontSize: 13, fontWeight: 500, mb: 1 }}>{title}</Typography>
          {loading ? <Skeleton width={60} height={40} /> : (
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</Typography>
          )}
          {subtitle && <Typography sx={{ color: '#94a3b8', fontSize: 12, mt: 1 }}>{subtitle}</Typography>}
        </Box>
        <Avatar sx={{ bgcolor: bg, width: 52, height: 52, borderRadius: 3 }}>
          <Box sx={{ color }}>{icon}</Box>
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi.getDashboard()
      .then((res) => setStats(res.data))
      .catch(() => setStats({ totalStaff: 0, leavesThisMonth: 0, permHoursThisMonth: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#0f172a', mb: 0.5 }}>
          Good {now.getHours() < 12 ? 'Morning' : now.getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.fullName?.split(' ')[0]} 👋
        </Typography>
        <Typography sx={{ color: '#64748b' }}>Here's what's happening at Foxtech this {monthName}.</Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="Total Staff" value={stats?.totalStaff ?? 0} icon={<PeopleIcon />}
            color="#2563eb" bg="#eff6ff" subtitle="Active employees" loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="Leaves This Month" value={stats?.leavesThisMonth ?? 0} icon={<EventNoteIcon />}
            color="#7c3aed" bg="#f5f3ff" subtitle={`In ${monthName}`} loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="Permission Hours" value={`${(stats?.permHoursThisMonth ?? 0).toFixed(1)}h`} icon={<AccessTimeIcon />}
            color="#059669" bg="#ecfdf5" subtitle={`In ${monthName}`} loading={loading} />
        </Grid>
      </Grid>

      {/* Quick summary card */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <TrendingUpIcon sx={{ color: '#2563eb' }} />
            <Typography variant="h6">Monthly Overview</Typography>
          </Box>
          <Grid container spacing={2}>
            {[
              { label: 'Total Staff', val: stats?.totalStaff ?? 0, color: '#2563eb' },
              { label: 'Leaves Taken', val: stats?.leavesThisMonth ?? 0, color: '#7c3aed' },
              { label: 'Permission Hours', val: `${(stats?.permHoursThisMonth ?? 0).toFixed(1)} hrs`, color: '#059669' },
            ].map((item) => (
              <Grid size={{ xs: 12, sm: 4 }} key={item.label}>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  {loading ? <Skeleton width="60%" sx={{ mx: 'auto' }} /> : (
                    <Typography variant="h5" sx={{ fontWeight: 700, color: item.color }}>{item.val}</Typography>
                  )}
                  <Typography sx={{ color: '#64748b', fontSize: 13, mt: 0.5 }}>{item.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
