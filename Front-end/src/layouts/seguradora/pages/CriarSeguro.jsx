import React, { useState, useEffect } from 'react';
import {
  Form, Input, InputNumber, Select, Button, Card,
  message, Switch, DatePicker, Tooltip
} from 'antd';
import {
  PlusOutlined, MinusCircleOutlined, ArrowLeftOutlined,
  FileProtectOutlined, DollarOutlined, TagOutlined,
  SafetyCertificateOutlined, InfoCircleOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
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

const CriarSeguro = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [tiposDisponiveis, setTiposDisponiveis] = useState([]);
  const [usaValor, setUsaValor] = useState(false);

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      const response = await seguroService.listarCategorias();
      setCategorias(response || []);
    } catch {
      message.error('Erro ao carregar categorias');
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
      if (values.preco) {
        if (values.preco.data_inicio) values.preco.data_inicio = values.preco.data_inicio.format('YYYY-MM-DD');
        if (values.preco.data_fim) values.preco.data_fim = values.preco.data_fim.format('YYYY-MM-DD');
        if (values.preco.usaValor) {
          delete values.preco.premio_percentagem;
          if (values.preco.premio_valor == null) {
            message.error('Informe o Prêmio Valor Fixo!');
            setLoading(false);
            return;
          }
        } else {
          delete values.preco.premio_valor;
          if (values.preco.premio_percentagem == null) {
            message.error('Informe o Prêmio Percentagem!');
            setLoading(false);
            return;
          }
        }
      }
      await seguroService.criarSeguro(values);
      message.success('Seguro criado com sucesso!');
      navigate('/seguradora/seguros');
    } catch (error) {
      message.error(error.message || 'Erro ao criar seguro');
    } finally {
      setLoading(false);
    }
  };

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
          onClick={() => navigate('/seguradora/seguros')}
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
              Criar Novo Seguro
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
          initialValues={{ status: true, auto_aprovacao: false, preco: { usaValor: false } }}
          requiredMark={false}
        >

          {/* Seção 1 — Informações Básicas */}
          <Card style={formCard} styles={{ body: { padding: '28px 32px' } }}>
            <SectionHeader
              icon={<FileProtectOutlined />}
              title="Informações Básicas"
              description="Defina a categoria, tipo e identidade do seguro"
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
              description="Defina prémios, limites e comportamento do seguro"
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

          {/* Seção 3 — Preço Inicial */}
          <Card style={formCard} styles={{ body: { padding: '28px 32px' } }}>
            <SectionHeader
              icon={<TagOutlined />}
              title="Preço Inicial"
              description="Configure a tabela de preços base (opcional)"
              color="#7c3aed"
            />

            <div style={{
              padding: '16px 20px', background: '#faf5ff', borderRadius: '12px',
              border: '1px solid #e9d5ff', marginBottom: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>Modo de cálculo do prémio</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                  {usaValor ? 'Valor fixo em MZN por apólice' : 'Percentagem sobre o valor seguro'}
                </div>
              </div>
              <Form.Item name={['preco', 'usaValor']} valuePropName="checked" style={{ margin: 0 }}>
                <Switch
                  checkedChildren="Valor Fixo"
                  unCheckedChildren="Percentagem"
                  onChange={setUsaValor}
                  style={{ minWidth: '110px' }}
                />
              </Form.Item>
            </div>

            <div className="resp-grid-2">
              {!usaValor ? (
                <Form.Item
                  label={<span style={{ fontWeight: 600, color: '#374151' }}>Prémio (%)</span>}
                  name={['preco', 'premio_percentagem']}
                >
                  <InputNumber
                    style={{ width: '100%', borderRadius: '10px' }}
                    size="large" min={0} max={100} step={0.5} placeholder="0.00" suffix="%"
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  label={<span style={{ fontWeight: 600, color: '#374151' }}>Prémio Fixo (MZN)</span>}
                  name={['preco', 'premio_valor']}
                >
                  <InputNumber
                    style={{ width: '100%', borderRadius: '10px' }}
                    size="large" min={0} step={100} placeholder="0.00"
                    formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={v => v.replace(/\$\s?|(,*)/g, '')}
                    prefix="MZN"
                  />
                </Form.Item>
              )}

              <div />

              <Form.Item
                label={<span style={{ fontWeight: 600, color: '#374151' }}>Data de Início</span>}
                name={['preco', 'data_inicio']}
              >
                <DatePicker style={{ width: '100%', borderRadius: '10px' }} size="large" format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: 600, color: '#374151' }}>Data de Fim</span>}
                name={['preco', 'data_fim']}
              >
                <DatePicker style={{ width: '100%', borderRadius: '10px' }} size="large" format="DD/MM/YYYY" />
              </Form.Item>
            </div>
          </Card>

          {/* Seção 4 — Coberturas */}
          <Card style={formCard} styles={{ body: { padding: '28px 32px' } }}>
            <SectionHeader
              icon={<SafetyCertificateOutlined />}
              title="Coberturas"
              description="Adicione as coberturas incluídas neste seguro"
              color="#dc2626"
            />

            <Form.List
              name="coberturas"
              rules={[{
                validator: async (_, coberturas) => {
                  if (!coberturas || coberturas.length < 1)
                    return Promise.reject(new Error('Adicione pelo menos uma cobertura.'));
                }
              }]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <div
                      key={key}
                      style={{
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '20px 24px',
                        marginBottom: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '8px',
                            background: '#dc262615', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '13px', color: '#dc2626'
                          }}>
                            {index + 1}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                            Cobertura {index + 1}
                          </span>
                        </div>
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)}
                          style={{ borderRadius: '8px' }}
                        >
                          Remover
                        </Button>
                      </div>

                      <Form.Item
                        {...restField}
                        label={<span style={{ fontWeight: 600, color: '#374151' }}>Descrição <span style={{ color: '#ef4444' }}>*</span></span>}
                        name={[name, 'descricao']}
                        rules={[{ required: true, message: 'Descreva a cobertura' }]}
                        style={{ marginBottom: '14px' }}
                      >
                        <TextArea rows={2} placeholder="Ex: Cobertura contra roubo, furto e danos por colisão" style={{ borderRadius: '10px', resize: 'none' }} />
                      </Form.Item>

                      <div className="resp-grid-2">
                        <Form.Item
                          {...restField}
                          label={<span style={{ fontWeight: 600, color: '#374151' }}>Franquia (%)</span>}
                          name={[name, 'franquia']}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber style={{ width: '100%', borderRadius: '10px' }} min={0} max={100} step={0.1} placeholder="0.00" suffix="%" />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          label={<span style={{ fontWeight: 600, color: '#374151' }}>Valor Mínimo (MZN)</span>}
                          name={[name, 'valor_minimo']}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber
                            style={{ width: '100%', borderRadius: '10px' }}
                            min={0} step={100} placeholder="0.00"
                            formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={v => v.replace(/\$\s?|(,*)/g, '')}
                            prefix="MZN"
                          />
                        </Form.Item>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    size="large"
                    style={{
                      borderRadius: '12px', height: '48px',
                      borderColor: '#dc2626', color: '#dc2626',
                      fontWeight: 600, marginBottom: '8px'
                    }}
                  >
                    Adicionar Cobertura
                  </Button>

                  {errors.length > 0 && (
                    <div style={{ color: '#dc2626', fontSize: '13px', marginTop: '6px' }}>
                      {errors}
                    </div>
                  )}
                </>
              )}
            </Form.List>
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
              onClick={() => navigate('/seguradora/seguros')}
              style={{ borderRadius: '12px', height: '48px', paddingInline: '28px', fontWeight: 600 }}
            >
              Cancelar
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              icon={<CheckCircleOutlined />}
              style={{
                borderRadius: '12px', height: '48px', paddingInline: '32px',
                background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                border: 'none', fontWeight: 700, fontSize: '15px',
                boxShadow: '0 4px 14px rgba(37,99,235,0.35)'
              }}
            >
              Criar Seguro
            </Button>
          </div>

        </Form>
      </div>
    </div>
  );
};

export default CriarSeguro;
