import { AppBar, Toolbar, Typography, IconButton, Box, Avatar, Menu, MenuItem, Badge, Tooltip, Divider, CircularProgress } from '@mui/material';
import { Menu as MenuIcon, AccountCircle, ExitToApp, Notifications, CheckCircle, Error } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@services/api';
import notificationService from '@services/notification.service';
import moment from 'moment';
import 'moment/locale/pt';

const Navbar = ({ title, onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifAnchorEl, setNotifAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleNotifMenu = (event) => {
        setNotifAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setNotifAnchorEl(null);
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await notificationService.getNotifications({ unread: true });
            setNotifications(data.data || []);

            // Assuming unreadCount is also available or calculate from notifications if not using separate call
            const countData = await notificationService.getUnreadCount();
            setUnreadCount(countData.count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleNotificationClick = async (notif) => {
        try {
            if (!notif.read_at) {
                await notificationService.markAsRead(notif.id);
                fetchNotifications();
            }
            if (notif.data?.url_acao) {
                navigate(notif.data.url_acao.replace('/cliente/', '/corretora/')); // Adapt URL if necessary
            }
            handleClose();
        } catch (error) {
            console.error('Error processing notification:', error);
        }
    };
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2, display: { sm: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                    {title}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Notificações">
                        <IconButton color="inherit" onClick={handleNotifMenu}>
                            <Badge badgeContent={unreadCount} color="error">
                                <Notifications />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    <Menu
                        anchorEl={notifAnchorEl}
                        open={Boolean(notifAnchorEl)}
                        onClose={handleClose}
                        PaperProps={{
                            sx: { width: 320, maxHeight: 400 }
                        }}
                    >
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight="bold">Notificações</Typography>
                        </Box>
                        <Divider />
                        {notifications.length === 0 ? (
                            <MenuItem sx={{ py: 3, justifyContent: 'center' }}>
                                <Typography variant="body2" color="text.secondary">Sem novas notificações</Typography>
                            </MenuItem>
                        ) : (
                            notifications.map((notif) => (
                                <MenuItem
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    sx={{
                                        py: 1.5,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        backgroundColor: notif.read_at ? 'transparent' : 'rgba(25, 118, 210, 0.04)'
                                    }}
                                >
                                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                        {notif.data?.tipo === 'success' ? <CheckCircle color="success" fontSize="small" /> : <Error color="error" fontSize="small" />}
                                        <Typography variant="body2" fontWeight="bold">
                                            {notif.data?.titulo}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        {notif.data?.mensagem}
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
                                        {moment(notif.created_at).fromNow()}
                                    </Typography>
                                </MenuItem>
                            ))
                        )}
                        <Divider />
                        <MenuItem onClick={() => { navigate('/corretora/proposals'); handleClose(); }} sx={{ justifyContent: 'center' }}>
                            <Typography variant="caption" color="primary" fontWeight="bold">Ver todas as propostas</Typography>
                        </MenuItem>
                    </Menu>

                    <Box display="flex" alignItems="center" ml={1}>
                        <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>{user?.name}</Typography>
                        <IconButton color="inherit" onClick={handleMenu}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
                                <AccountCircle />
                            </Avatar>
                        </IconButton>
                    </Box>

                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                        <MenuItem onClick={handleLogout}>
                            <ExitToApp sx={{ mr: 1 }} /> Sair
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
