import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';

const StatCard = ({ title, value, icon: Icon, color = 'primary', bgColor }) => {
    const theme = useTheme();
    const colorCode = theme.palette[color]?.main || color;

    return (
        <Card
            sx={{
                height: '100%',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 2px 8px rgb(0 0 0 / 0.05)',
                transition: 'box-shadow 0.2s',
                '&:hover': {
                    boxShadow: '0 4px 16px rgb(0 0 0 / 0.08)',
                },
            }}
        >
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box
                        sx={{
                            width: 46,
                            height: 46,
                            borderRadius: '12px',
                            backgroundColor: bgColor || colorCode,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {Icon && <Icon sx={{ fontSize: 22, color: '#fff' }} />}
                    </Box>
                </Box>
                <Typography variant="h5" fontWeight="700" sx={{ color: theme.palette.text.primary, mb: 0.5 }}>
                    {value}
                </Typography>
                <Typography variant="body2" fontWeight="500" sx={{ color: theme.palette.text.secondary }}>
                    {title}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default StatCard;
