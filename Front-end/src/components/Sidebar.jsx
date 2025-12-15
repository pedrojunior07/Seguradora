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
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

const Sidebar = ({ items, mobileOpen, onDrawerToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const drawer = (
        <Box>
            <Toolbar
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                }}
            >
                <Typography variant="h6" fontWeight="bold">
                    Menu
                </Typography>
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
