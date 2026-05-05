import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, InputAdornment, IconButton, CircularProgress,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      p: 2,
    }}>
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(6)].map((_, i) => (
          <Box key={i} sx={{
            position: 'absolute',
            borderRadius: '50%',
            background: i % 2 === 0 ? 'rgba(37,99,235,0.08)' : 'rgba(124,58,237,0.08)',
            width: `${200 + i * 80}px`, height: `${200 + i * 80}px`,
            top: `${10 + i * 12}%`, left: `${5 + i * 14}%`,
            filter: 'blur(60px)',
          }} />
        ))}
      </Box>

      <Card sx={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1, border: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(20px)' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: '#2563eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2, boxShadow: '0 8px 24px rgba(37,99,235,0.4)' }}>
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 26 }}>F</Typography>
            </Box>
            <Typography variant="h5" sx={{ color: '#f1f5f9', fontWeight: 700 }}>Welcome Back</Typography>
            <Typography sx={{ color: '#64748b', fontSize: 14, mt: 0.5 }}>Sign in to Foxtech Staff Portal</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#f1f5f9', '& fieldset': { borderColor: '#334155' }, '&:hover fieldset': { borderColor: '#2563eb' } }, '& .MuiInputLabel-root': { color: '#64748b' } }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#64748b' }} /></InputAdornment> } }}
            />
            <TextField
              fullWidth label="Password" type={showPassword ? 'text' : 'password'}
              value={password} onChange={(e) => setPassword(e.target.value)} required
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { color: '#f1f5f9', '& fieldset': { borderColor: '#334155' }, '&:hover fieldset': { borderColor: '#2563eb' } }, '& .MuiInputLabel-root': { color: '#64748b' } }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#64748b' }} /></InputAdornment>,
                  endAdornment: <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: '#64748b' }}>
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>,
                }
              }}
            />
            <Button fullWidth type="submit" variant="contained" size="large" disabled={loading}
              sx={{ py: 1.5, fontSize: 16, fontWeight: 700, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', '&:hover': { background: 'linear-gradient(135deg, #1d4ed8, #6d28d9)' } }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>


        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
