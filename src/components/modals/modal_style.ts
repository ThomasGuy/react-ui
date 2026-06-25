import { SxProps, Theme } from '@mui/material';

export const style: SxProps<Theme> = {
  // 🚀 Let Dialog handle positioning. We only style the internal Paper container here:
  '& .MuiDialog-paper': {
    width: { xs: '100%', sm: '400px' },
    maxWidth: { xs: '350px', sm: '400px' },
    minWidth: '320px',

    // Modern MUI v9 theme variables
    bgcolor: 'background.paper',
    borderColor: 'divider',
    border: '1px solid',
    borderRadius: 3, // Gives it a clean modern look (~12px)

    boxShadow: 'var(--mui-shadows-24)',
    color: 'text.primary',
    p: 1, // Base spacing padding inside container bounds
  },
};
