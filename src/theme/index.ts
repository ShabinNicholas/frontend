import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0f172a', light: '#334155', dark: '#020617' }, // Slate dark for primary
    secondary: { main: '#ea580c', light: '#f97316', dark: '#c2410c' }, // Safety orange for accents
    success: { main: '#059669' },
    warning: { main: '#d97706' },
    error: { main: '#dc2626' },
    background: { default: '#ffffff', paper: '#ffffff' }, // Stark white background
    text: { primary: '#0f172a', secondary: '#475569' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase' },
    h5: { fontWeight: 700, letterSpacing: '0.02em' },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 4 }, // Sharper, industrial corners
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'uppercase', fontWeight: 700, borderRadius: 4, letterSpacing: '0.05em' },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 2px 4px rgba(0,0,0,0.2)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          boxShadow: 'none',
          border: '2px solid #e2e8f0', // Thicker, sturdy borders
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 4 },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em' } },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            backgroundColor: '#f1f5f9',
            fontWeight: 700,
            color: '#334155',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: '2px solid #cbd5e1',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: '#f8fafc' },
          '&:last-child td': { borderBottom: 0 },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
          },
        },
      },
    },
  },
});

export default theme;
