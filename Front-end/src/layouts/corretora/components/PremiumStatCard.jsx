import { Box, Typography, Paper } from '@mui/material';
import { PropTypes } from 'prop-types';

const PremiumStatCard = ({ title, value, icon: Icon, color = '#2563EB', percentage, trend }) => {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                height: '100%',
                borderRadius: '24px',
                background: '#FFFFFF',
                border: '1px solid rgba(0, 0, 0, 0.04)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.06)',
                    borderColor: 'rgba(0, 0, 0, 0.08)',
                },
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            color: '#64748b',
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                            mb: 1,
                            textTransform: 'uppercase',
                            fontSize: '0.75rem'
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 800,
                            color: '#1e293b',
                            mb: 1,
                            fontFamily: '"Inter", sans-serif'
                        }}
                    >
                        {value}
                    </Typography>

                    {percentage && (
                        <Box display="flex" alignItems="center">
                            <Typography
                                variant="caption"
                                sx={{
                                    color: trend === 'up' ? '#10b981' : '#f43f5e',
                                    fontWeight: 700,
                                    bgcolor: trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: '6px',
                                    mr: 1
                                }}
                            >
                                {trend === 'up' ? '+' : '-'}{percentage}%
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                que no mês passado
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Box
                    sx={{
                        background: `linear-gradient(135deg, ${color}12 0%, ${color}24 100%)`,
                        p: 1.5,
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: color,
                    }}
                >
                    <Icon sx={{ fontSize: 28 }} />
                </Box>
            </Box>

            {/* Subtle decorative element */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    background: `radial-gradient(circle, ${color}08 0%, transparent 70%)`,
                    borderRadius: '50%',
                }}
            />
        </Paper>
    );
};

PremiumStatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.elementType.isRequired,
    color: PropTypes.string,
    percentage: PropTypes.string,
    trend: PropTypes.oneOf(['up', 'down'])
};

export default PremiumStatCard;
