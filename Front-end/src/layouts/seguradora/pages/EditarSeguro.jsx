import React, { useState, useEffect } from 'react';
import {
  Form, Input, InputNumber, Select, Button, Card,
  message, Switch, Tooltip, Spin
} from 'antd';
import {
  ArrowLeftOutlined,
  FileProtectOutlined, DollarOutlined,
  SafetyCertificateOutlined, InfoCircleOutlined, CheckCircleOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import seguroService from '../../../services/seguroService';

const { Option } = Select;
const { TextArea } = Input;

const SectionHeader = ({ icon, title, description, color = '#2563eb' }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '24px' }}>
    <div style={{
      width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
      background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {React.cloneElement(icon, { style: { fontSize: '20px', color } })}
    </div>
    <div>
      <div style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a', lineHeight: 1.3 }}>{title}</div>
      {description && <div style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>{description}</div>}
    </div>
  </div>
);

const formCard = {
  borderRadius: '20px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  marginBottom: '20px',
};

const EditarSeguro = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [tiposDisponiveis, setTiposDisponiveis] = useState([]);

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    setLoadingDados(true);
    try {
      // Carregar categorias e seguro em paralelo
      const [categoriasResponse, seguroResponse] = await Promise.all([
        seguroService.listarCategorias(),
        seguroService.obterSeguro(id)
      ]);

      const cats = categoriasResponse || [];
      setCategorias(cats);

      const seguro = seguroResponse.data;
      if (!seguro) {
        message.error('Seguro não encontrado');
        navigate('/seguradora/seguros');
        return;
      }

      // Preencher tipos disponíveis com base na categoria actual
      const idCategoria = seguro.seguro?.id_categoria ?? seguro.seguro?.categoria?.id_categoria;
      const categoriaActual = cats.find(c => c.id_categoria === idCategoria);
      if (categoriaActual) {
        setTiposDisponiveis(categoriaActual.tipos || []);
      }

      // Preencher o formulário
      form.setFieldsValue({
        id_categoria: idCategoria,
        id_tipo_seguro: seguro.seguro?.id_tipo_seguro ?? seguro.seguro?.tipo?.id,
        nome: seguro.seguro?.nome,
        descricao: seguro.seguro?.descricao,
        premio_minimo: parseFloat(seguro.premio_minimo) || 0,
        valor_minimo_dano: seguro.valor_minimo_dano ? parseFloat(seguro.valor_minimo_dano) : undefined,
        status: seguro.status,
        auto_aprovacao: seguro.auto_aprovacao,
      });
    } catch (error) {
      message.error('Erro ao carregar dados do seguro');
      console.error(error);
    } finally {
      setLoadingDados(false);
    }
  };

  const handleCategoriaChange = (idCategoria) => {
    form.setFieldValue('id_tipo_seguro', null);
    const categoria = categorias.find(c => c.id_categoria === idCategoria);
    setTiposDisponiveis(categoria?.tipos || []);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await seguroService.atualizarSeguro(id, values);
      message.success('Seguro atualizado com sucesso!');
      navigate(`/seguradora/seguros/${id}`);
    } catch (error) {
      message.error(error.message || 'Erro ao atualizar seguro');
    } finally {
      setLoading(false);
    }
  };

  if (loadingDados) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        padding: '32px 40px 48px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: 80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/seguradora/seguros/${id}`)}
          style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', marginBottom: '20px', borderRadius: '10px' }}
        >
          Voltar
        </Button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FileProtectOutlined style={{ fontSize: '26px', color: '#fff' }} />
          </div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '4px', fontWeight: 500 }}>
              Gestão de Seguros
            </div>
            <h1 style={{ margin: 0, color: '#fff', fontSize: '26px', fontWeight: 800, lineHeight: 1.2 }}>
              Editar Seguro
            </h1>
          </div>
        </div>
      </div>

      {/* Form Body */}
      <div style={{ margin: '-24px 0 0', padding: '0 28px 60px', position: 'relative', zIndex: 1 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >

          {/* Seção 1 — Informações Básicas */}
          <Card style={formCard} styles={{ body: { padding: '28px 32px' } }}>
            <SectionHeader
              icon={<FileProtectOutlined />}
              title="Informações Básicas"
              description="Edite a categoria, tipo e identidade do seguro"
              color="#2563eb"
            />

            <div className="resp-grid-2">
              <Form.Item
                label={<span style={{ fontWeight: 600, color: '#374151' }}>Categoria <span style={{ color: '#ef4444' }}>*</span></span>}
                name="id_categoria"
                rules={[{ required: true, message: 'Selecione a categoria' }]}
              >
                <Select
                  placeholder="Selecione uma categoria"
                  size="large"
                  onChange={handleCategoriaChange}
                >
                  {categorias.map(cat => (
                    <Option key={cat.id_categoria} value={cat.id_categoria}>{cat.descricao}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: 600, color: '#374151' }}>Tipo de Seguro <span style={{ color: '#ef4444' }}>*</span></span>}
                name="id_tipo_seguro"
                rules={[{ required: true, message: 'Selecione o tipo' }]}
              >
                <Select
                  placeholder={tiposDisponiveis.length ? 'Selecione o tipo' : 'Primeiro escolha a categoria'}
                  disabled={!tiposDisponiveis.length}
                  size="large"
                >
                  {tiposDisponiveis.map(tipo => (
                    <Option key={tipo.id} value={tipo.id}>{tipo.descricao}</Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              label={<span style={{ fontWeight: 600, color: '#374151' }}>Nome do Seguro <span style={{ color: '#ef4444' }}>*</span></span>}
              name="nome"
              rules={[{ required: true, message: 'Insira o nome do seguro' }]}
            >
              <Input size="large" placeholder="Ex: Seguro Auto Premium" style={{ borderRadius: '10px' }} />
            </Form.Item>

            <Form.Item
              label={<span style={{ fontWeight: 600, color: '#374151' }}>Descrição</span>}
              name="descricao"
              style={{ marginBottom: 0 }}
            >
              <TextArea
                rows={3}
                placeholder="Descreva os principais benefícios e condições deste seguro..."
                style={{ borderRadius: '10px', resize: 'none' }}
              />
            </Form.Item>
          </Card>

          {/* Seção 2 — Valores e Configurações */}
          <Card style={formCard} styles={{ body: { padding: '28px 32px' } }}>
            <SectionHeader
              icon={<DollarOutlined />}
              title="Valores e Configurações"
              description="Edite prémios, limites e comportamento do seguro"
              color="#059669"
            />

            <div className="resp-grid-2" style={{ marginBottom: '8px' }}>
              <Form.Item
                label={<span style={{ fontWeight: 600, color: '#374151' }}>Prémio Mínimo (MZN) <span style={{ color: '#ef4444' }}>*</span></span>}
                name="premio_minimo"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <InputNumber
                  style={{ width: '100%', borderRadius: '10px' }}
                  size="large"
                  min={0}
                  step={100}
                  placeholder="0.00"
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={v => v.replace(/\$\s?|(,*)/g, '')}
                  prefix="MZN"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span style={{ fontWeight: 600, color: '#374151' }}>
                    Valor Mínimo de Dano (MZN)
                    <Tooltip title="Valor mínimo do dano para acionar a cobertura">
                      <InfoCircleOutlined style={{ marginLeft: 6, color: '#94a3b8', fontSize: '13px' }} />
                    </Tooltip>
                  </span>
                }
                name="valor_minimo_dano"
              >
                <InputNumber
                  style={{ width: '100%', borderRadius: '10px' }}
                  size="large"
                  min={0}
                  step={100}
                  placeholder="0.00"
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={v => v.replace(/\$\s?|(,*)/g, '')}
                  prefix="MZN"
                />
              </Form.Item>
            </div>

            <div className="resp-grid-2" style={{
              padding: '20px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0'
            }}>
              <div>
                <div style={{ fontWeight: 600, color: '#374151', fontSize: '14px', marginBottom: '6px' }}>
                  Status do Seguro
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Form.Item name="status" valuePropName="checked" style={{ margin: 0 }}>
                    <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" style={{ background: '#059669' }} />
                  </Form.Item>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Visível para corretoras e clientes</span>
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 600, color: '#374151', fontSize: '14px', marginBottom: '6px' }}>
                  Auto-Aprovação
                  <Tooltip title="Propostas de clientes aprovadas automaticamente, sem revisão manual">
                    <InfoCircleOutlined style={{ marginLeft: 6, color: '#94a3b8', fontSize: '13px' }} />
                  </Tooltip>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Form.Item name="auto_aprovacao" valuePropName="checked" style={{ margin: 0 }}>
                    <Switch checkedChildren="Ligado" unCheckedChildren="Desligado" />
                  </Form.Item>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Aprovação automática de propostas</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Nota sobre preços e coberturas */}
          <Card style={{ ...formCard, background: '#fffbeb', borderColor: '#fcd34d' }} styles={{ body: { padding: '20px 28px' } }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <SafetyCertificateOutlined style={{ fontSize: '20px', color: '#d97706', marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, color: '#92400e', fontSize: '14px' }}>Preços e Coberturas</div>
                <div style={{ fontSize: '13px', color: '#78350f', marginTop: '4px' }}>
                  Para gerir preços e coberturas, aceda à página de detalhes do seguro onde pode adicionar, ativar ou desativar individualmente cada item.
                </div>
                <Button
                  type="link"
                  style={{ padding: 0, marginTop: '6px', color: '#d97706', fontWeight: 600 }}
                  onClick={() => navigate(`/seguradora/seguros/${id}`)}
                >
                  Ir para Detalhes →
                </Button>
              </div>
            </div>
          </Card>

          {/* Acções */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: '12px',
            padding: '20px 28px', background: '#fff',
            borderRadius: '20px', border: '1px solid #e2e8f0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
          }}>
            <Button
              size="large"
              onClick={() => navigate(`/seguradora/seguros/${id}`)}
              style={{ borderRadius: '12px', height: '48px', paddingInline: '28px', fontWeight: 600 }}
            >
              Cancelar
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              icon={<SaveOutlined />}
              style={{
                borderRadius: '12px', height: '48px', paddingInline: '32px',
                background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                border: 'none', fontWeight: 700, fontSize: '15px',
                boxShadow: '0 4px 14px rgba(37,99,235,0.35)'
              }}
            >
              Guardar Alterações
            </Button>
          </div>

        </Form>
      </div>
    </div>
  );
};

export default EditarSeguro;
