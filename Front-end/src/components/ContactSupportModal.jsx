import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Alert,
    Snackbar
} from '@mui/material';
import { Send, Cancel } from '@mui/icons-material';
import supportService from '@services/support.service';

const ContactSupportModal = ({ open, onClose }) => {
    const [assunto, setAssunto] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleSubmit = async () => {
        if (!assunto.trim() || !mensagem.trim()) {
            setError('Por favor, preencha todos os campos.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await supportService.send({ assunto, mensagem });
            setSnackbar({ open: true, message: 'Mensagem enviada com sucesso!', severity: 'success' });
            setTimeout(() => {
                handleClose();
            }, 1000);
        } catch (err) {
            console.error(err);
            setError('Erro ao enviar mensagem. Tente novamente.');
            setSnackbar({ open: true, message: 'Erro ao enviar mensagem.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setAssunto('');
        setMensagem('');
        setError(null);
        onClose();
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Contactar Suporte (Admin)</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Envie uma mensagem para os administradores do sistema. Responderemos o mais breve possível.
                        </Alert>

                        {error && <Alert severity="error">{error}</Alert>}

                        <TextField
                            label="Assunto"
                            fullWidth
                            value={assunto}
                            onChange={(e) => setAssunto(e.target.value)}
                            required
                            disabled={loading}
                        />

                        <TextField
                            label="Mensagem"
                            fullWidth
                            multiline
                            rows={4}
                            value={mensagem}
                            onChange={(e) => setMensagem(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="Descreva seu problema ou solicitação..."
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={handleClose}
                        color="inherit"
                        startIcon={<Cancel />}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        startIcon={<Send />}
                        disabled={loading}
                    >
                        {loading ? 'Enviando...' : 'Enviar Mensagem'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ContactSupportModal;
