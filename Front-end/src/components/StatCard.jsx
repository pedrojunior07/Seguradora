import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';

const StatCard = ({ title, value, icon: Icon, color = 'primary', bgColor }) => {
    const theme = useTheme();
    const colorCode = theme.palette[color]?.main || color;

    return (
        <Card
            sx={{
                height: '100%',
                background: '#ffffff',
                color: theme.palette.text.primary,
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgb(0 0 0 / 0.06)',
                transition: 'box-shadow 0.2s',
                '&:hover': {
                    boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)',
                },
            }}
        >
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="body2" fontWeight="500" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                            {title}
                        </Typography>
                        <Typography variant="h5" fontWeight="700" sx={{ color: theme.palette.text.primary }}>
                            {value}
                        </Typography>
                    </Box>
                    {Icon && (
                        <Box
                            sx={{
                                backgroundColor: `${bgColor || colorCode}12`,
                                borderRadius: '10px',
                                p: 1.25,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: bgColor || colorCode
                            }}
                        >
                            <Icon sx={{ fontSize: 24 }} />
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default StatCard;
