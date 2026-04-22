import { AppBar, Toolbar, Typography, IconButton, Box, Avatar, Menu, MenuItem, Badge, Tooltip, Divider, CircularProgress } from '@mui/material';
import { Menu as MenuIcon, AccountCircle, ExitToApp, Notifications, CheckCircle, Error, Help } from '@mui/icons-material';
import ContactSupportModal from './ContactSupportModal';
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
    const [supportOpen, setSupportOpen] = useState(false);
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
                background: '#ffffff',
                color: '#0F172A',
                boxShadow: 'none',
                borderBottom: '1px solid #E2E8F0',
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
                    <Tooltip title="Contactar Suporte">
                        <IconButton color="inherit" onClick={() => setSupportOpen(true)}>
                            <Help />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Notificações">
                        <IconButton color="inherit" onClick={handleNotifMenu}>
                            <Badge badgeContent={unreadCount} color="error">
                                <Notifications />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    <ContactSupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />

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
                    </Menu>

                    <Box display="flex" alignItems="center" ml={1}>
                        <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' }, color: '#475569' }}>{user?.name}</Typography>
                        <IconButton onClick={handleMenu} size="small">
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#2563EB', fontSize: '0.85rem', fontWeight: 700 }}>
                                {user?.name?.charAt(0)?.toUpperCase() || <AccountCircle />}
                            </Avatar>
                        </IconButton>
                    </Box>

                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}
                        PaperProps={{ sx: { minWidth: 160 } }}
                    >
                        <MenuItem onClick={handleLogout} sx={{ gap: 1.5 }}>
                            <ExitToApp fontSize="small" sx={{ color: '#64748B' }} /> Sair
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
