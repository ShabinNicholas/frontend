import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Typography, Avatar, IconButton,
  Divider, Tooltip, useMediaQuery, useTheme, Menu, MenuItem, Chip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 260;

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/', adminOnly: false },
  { label: 'Staff', icon: <PeopleIcon />, path: '/staff', adminOnly: false },
  { label: 'Leave Management', icon: <EventNoteIcon />, path: '/leave', adminOnly: false },
  { label: 'Permissions', icon: <AccessTimeIcon />, path: '/permission', adminOnly: false },
  { label: 'Reports', icon: <AssessmentIcon />, path: '/reports', adminOnly: true },
];

const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#ffffff' }}>
      {/* Logo */}
      <Box sx={{ px: 3, py: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>F</Typography>
        </Box>
        <Box>
          <Typography sx={{ color: '#000000', fontWeight: 700, fontSize: 16, lineHeight: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Foxtech</Typography>
          <Typography sx={{ color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Staff Portal</Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#e2e8f0' }} />

      {/* Nav */}
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {navItems.filter(item => !item.adminOnly || isAdmin).map((item) => {
          const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                sx={{
                  borderRadius: 1,
                  px: 2, py: 1.2,
                  bgcolor: active ? '#f1f5f9' : 'transparent',
                  '&:hover': { bgcolor: active ? '#e2e8f0' : '#f8fafc' },
                  transition: 'all 0.2s',
                  borderLeft: active ? '3px solid #ea580c' : '3px solid transparent',
                }}
              >
                <ListItemIcon sx={{ color: active ? '#ea580c' : '#475569', minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 500, color: active ? '#000000' : '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: '#e2e8f0' }} />

      {/* User info */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 1, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#0f172a', fontSize: 14 }}>
            {user?.fullName?.[0] || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography sx={{ color: '#000000', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textTransform: 'uppercase' }}>{user?.fullName}</Typography>
            <Chip label={user?.userRole} size="small" sx={{ height: 16, fontSize: 10, bgcolor: '#e2e8f0', color: '#475569', mt: 0.3, fontWeight: 700, borderRadius: 1 }} />
          </Box>
          <Tooltip title="Logout">
            <IconButton size="small" onClick={logout} sx={{ color: '#475569' }}><LogoutIcon fontSize="small" /></IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none', borderRight: '1px solid #e2e8f0' } }}>
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer variant="permanent" sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none', borderRight: '1px solid #e2e8f0', boxSizing: 'border-box' } }}>
            {drawerContent}
          </Drawer>
        )}
      </Box>

      {/* Main */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {isMobile && (
          <AppBar position="static" elevation={0} sx={{ bgcolor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
            <Toolbar>
              <IconButton edge="start" onClick={handleDrawerToggle} sx={{ color: '#0f172a', mr: 1 }}><MenuIcon /></IconButton>
              <Typography variant="h6" sx={{ color: '#0f172a', flex: 1 }}>Foxtech Staff</Typography>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: '#0f172a' }}><AccountCircleIcon /></IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => { logout(); setAnchorEl(null); }}><LogoutIcon fontSize="small" sx={{ mr: 1 }} />Logout</MenuItem>
              </Menu>
            </Toolbar>
          </AppBar>
        )}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
