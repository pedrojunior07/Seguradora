import { Box, Card, CardContent, Typography } from '@mui/material';

const StatCard = ({ title, value, icon: Icon, color = 'primary', bgColor }) => {
    return (
        <Card
            sx={{
                height: '100%',
                background: bgColor || `linear-gradient(135deg, ${color}.light, ${color}.main)`,
                color: 'white',
                borderRadius: 3,
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'translateY(-5px)',
                },
            }}
        >
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h6" fontWeight="300" sx={{ opacity: 0.9 }}>
                            {title}
                        </Typography>
                        <Typography variant="h3" fontWeight="bold" mt={1}>
                            {value}
                        </Typography>
                    </Box>
                    {Icon && (
                        <Box
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                borderRadius: '50%',
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Icon sx={{ fontSize: 40 }} />
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default StatCard;
