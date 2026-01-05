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
        <Box>
            <Toolbar
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Avatar src={entidade?.logo ? getLogoUrl(entidade.logo) : undefined} sx={{ bgcolor: 'transparent', width: 40, height: 40 }} />
                <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
                        {entidade?.nome || 'Menu'}
                    </Typography>
                </Box>
            </Toolbar>
            <Divider />
            <List sx={{ pt: 2 }}>
                {items.map((item) => (
                    <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            onClick={() => {
                                navigate(item.route);
                                if (onDrawerToggle) onDrawerToggle();
                            }}
                            selected={location.pathname === item.route}
                            sx={{
                                mx: 1,
                                borderRadius: 2,
                                '&.Mui-selected': {
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    '& .MuiListItemIcon-root': {
                                        color: 'white',
                                    },
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #5568d3 0%, #6a4293 100%)',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: location.pathname === item.route ? 'white' : 'inherit' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.name} />
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
