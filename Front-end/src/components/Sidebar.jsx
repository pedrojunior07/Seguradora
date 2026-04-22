import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Box,
    Typography,
    Divider,
    Avatar,
} from '@mui/material';
import { useAuth } from '@context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

const Sidebar = ({ items, mobileOpen, onDrawerToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const { entidade } = useAuth();
    const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '');
    const getLogoUrl = (logoPath) => (logoPath ? `${apiBase}/storage/${logoPath}` : null);

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#ffffff' }}>
            <Toolbar
                sx={{
                    background: '#ffffff',
                    color: '#0F172A',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    borderBottom: '1px solid #E2E8F0',
                }}
            >
                <Avatar src={entidade?.logo ? getLogoUrl(entidade.logo) : undefined} sx={{ bgcolor: 'transparent', width: 36, height: 36 }} />
                <Box>
                    <Typography variant="h6" fontWeight="800" sx={{ color: '#0F172A', fontSize: '1.1rem' }}>
                        {entidade?.nome || 'Menu'}
                    </Typography>
                </Box>
            </Toolbar>
            <List sx={{ pt: 3, px: 2, flexGrow: 1 }}>
                {items.map((item) => (
                    <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            onClick={() => {
                                navigate(item.route);
                                if (onDrawerToggle) onDrawerToggle();
                            }}
                            selected={location.pathname === item.route}
                            sx={{
                                borderRadius: '12px',
                                py: 1.2,
                                '&.Mui-selected': {
                                    background: '#EFF6FF',
                                    color: '#2563EB',
                                    '& .MuiListItemIcon-root': {
                                        color: '#2563EB',
                                    },
                                    '&:hover': {
                                        background: '#DBEAFE',
                                    },
                                },
                                '&:hover:not(.Mui-selected)': {
                                    background: '#F8FAFC',
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: location.pathname === item.route ? '#2563EB' : '#64748B', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText 
                                primary={item.name} 
                                primaryTypographyProps={{ 
                                    variant: 'body2', 
                                    fontWeight: location.pathname === item.route ? '700' : '600',
                                    color: location.pathname === item.route ? '#2563EB' : '#475569'
                                }} 
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <>
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onDrawerToggle}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawer}
            </Drawer>
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                open
            >
                {drawer}
            </Drawer>
        </>
    );
};

export default Sidebar;
export { drawerWidth };
