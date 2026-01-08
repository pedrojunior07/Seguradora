import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Button, Space, message, Spin, Table, Modal, Form, InputNumber, Input, DatePicker, Switch, Divider } from 'antd';
import { ArrowLeftOutlined, EditOutlined, PlusOutlined, DollarOutlined, SafetyOutlined, PoweroffOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import seguroService from '../../../services/seguroService';
import dayjs from 'dayjs';

const { TextArea } = Input;

const DetalhesSeguro = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [seguro, setSeguro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalPreco, setModalPreco] = useState(false);
  const [modalCobertura, setModalCobertura] = useState(false);
  const [formPreco] = Form.useForm();
  const [formCobertura] = Form.useForm();
  const [usaValor, setUsaValor] = useState(false);

  useEffect(() => {
    carregarSeguro();
  }, [id]);

  const handleToggleAutoAprovacao = async (checked) => {
    try {
      await seguroService.atualizarSeguro(id, { auto_aprovacao: checked });
      message.success(`Auto-aprovação ${checked ? 'ativada' : 'desativada'}`);
      carregarSeguro();
    } catch (error) {
      console.error(error);
      message.error('Erro ao atualizar configuração');
    }
  };

  const carregarSeguro = async () => {
    setLoading(true);
    try {
      const response = await seguroService.obterSeguro(id);
      setSeguro(response.data);
    } catch (error) {
      message.error('Erro ao carregar detalhes do seguro');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAtivarDesativar = async () => {
    try {
      if (seguro.status) {
        await seguroService.desativarSeguro(id);
        message.success('Seguro desativado com sucesso');
      } else {
        await seguroService.ativarSeguro(id);
        message.success('Seguro ativado com sucesso');
      }
      carregarSeguro();
    } catch (error) {
      message.error('Erro ao alterar status do seguro');
    }
  };

  const handleAdicionarPreco = async (values) => {
    try {
      // Formatar datas
      if (values.data_inicio) {
        values.data_inicio = values.data_inicio.format('YYYY-MM-DD');
      }
      if (values.data_fim) {
        values.data_fim = values.data_fim.format('YYYY-MM-DD');
      }

      await seguroService.adicionarPreco(id, values);
      message.success('Preço adicionado com sucesso!');
      setModalPreco(false);
      formPreco.resetFields();
      carregarSeguro();
    } catch (error) {
      message.error('Erro ao adicionar preço');
      console.error(error);
    }
  };

  const handleAdicionarCobertura = async (values) => {
    try {
      await seguroService.adicionarCobertura(id, values);
      message.success('Cobertura adicionada com sucesso!');
      setModalCobertura(false);
      formCobertura.resetFields();
      carregarSeguro();
    } catch (error) {
      message.error('Erro ao adicionar cobertura');
      console.error(error);
    }
  };

  const columnsPrecos = [
    {
      title: 'Valor Base',
      dataIndex: 'valor',
      key: 'valor',
      render: (valor) => valor ? `${parseFloat(valor).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}` : '-'
    },
    {
      title: 'Prêmio',
      key: 'premio',
      render: (_, record) => {
        if (record.usaValor) {
          return `${parseFloat(record.premio_valor).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })} (Fixo)`;
        }
        return `${record.premio_percentagem}%`;
      }
    },
    {
      title: 'Data Início',
      dataIndex: 'data_inicio',
      key: 'data_inicio',
      render: (data) => dayjs(data).format('DD/MM/YYYY')
    },
    {
      title: 'Data Fim',
      dataIndex: 'data_fim',
      key: 'data_fim',
      render: (data) => data ? dayjs(data).format('DD/MM/YYYY') : <Tag color="green">Atual</Tag>
    }
    ,
    {
      title: 'Ações',
      key: 'acoes',
      render: (_, record) => {
        const precoId = record.id_preco ?? record.id ?? record.idPreco;
        return (
          <Space>
            {record.data_fim ? (
              <Button size="small" onClick={async () => {
                try {
                  await seguroService.ativarPreco(precoId);
                  message.success('Preço ativado');
                  carregarSeguro();
                } catch (e) {
                  message.error('Erro ao ativar preço');
                }
              }}>
                Ativar
              </Button>
            ) : (
              <Button danger size="small" onClick={() => {
                Modal.confirm({
                  title: 'Confirmar desativação',
                  content: 'Deseja desativar este preço? Isso encerrará sua vigência.',
                  okText: 'Sim',
                  cancelText: 'Cancelar',
                  onOk: async () => {
                    try {
                      await seguroService.desativarPreco(precoId);
                      message.success('Preço desativado');
                      carregarSeguro();
                    } catch (e) {
                      message.error('Erro ao desativar preço');
                    }
                  }
                });
              }}>
                Desativar
              </Button>
            )}
          </Space>
        );
      }
    }
  ];

  const columnsCoberturas = [
    {
      title: 'Descrição',
      dataIndex: 'descricao',
      key: 'descricao'
    },
    {
      title: 'Franquia',
      dataIndex: 'franquia',
      key: 'franquia',
      render: (valor) => valor ? `${parseFloat(valor).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}` : '-'
    },
    {
      title: 'Valor Mínimo',
      dataIndex: 'valor_minimo',
      key: 'valor_minimo',
      render: (valor) => valor ? `${parseFloat(valor).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}` : '-'
    }
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!seguro) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <p>Seguro não encontrado</p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/seguradora/seguros')}
            style={{ marginBottom: '16px' }}
          >
            Voltar
          </Button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Detalhes do Seguro</h2>
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/seguradora/seguros/${id}/editar`)}
              >
                Editar
              </Button>
              <Button
                danger={seguro.status}
                icon={seguro.status ? <PoweroffOutlined /> : <CheckCircleOutlined />}
                onClick={handleAtivarDesativar}
              >
                {seguro.status ? 'Desativar' : 'Ativar'}
              </Button>
            </Space>
          </div>
        </div>

        {/* Informações Gerais */}
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Nome">
            {seguro.seguro?.nome}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={seguro.status ? 'green' : 'red'}>
              {seguro.status ? 'ATIVO' : 'INATIVO'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Auto-Aprovação">
            <Space>
              <Switch
                checked={seguro.auto_aprovacao}
                onChange={handleToggleAutoAprovacao}
                checkedChildren="ON"
                unCheckedChildren="OFF"
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {seguro.auto_aprovacao ? 'Ativação Instantânea' : 'Requer Análise'}
              </Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Categoria">
            {seguro.seguro?.categoria?.descricao}
          </Descriptions.Item>
          <Descriptions.Item label="Tipo">
            <Tag color="cyan">{seguro.seguro?.tipo?.descricao?.toUpperCase() || 'N/A'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Prêmio Mínimo">
            {parseFloat(seguro.premio_minimo).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
          </Descriptions.Item>
          <Descriptions.Item label="Valor Mínimo Dano">
            {seguro.valor_minimo_dano
              ? parseFloat(seguro.valor_minimo_dano).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })
              : '-'
            }
          </Descriptions.Item>
          <Descriptions.Item label="Descrição" span={2}>
            {seguro.seguro?.descricao || 'Sem descrição'}
          </Descriptions.Item>
        </Descriptions>

        {/* Preço Atual */}
        {seguro.preco_atual && (
          <>
            <Divider orientation="left">Preço Atual</Divider>
            <Descriptions bordered column={2}>
              {seguro.preco_atual.valor && (
                <Descriptions.Item label="Valor Base">
                  {parseFloat(seguro.preco_atual.valor).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Prêmio">
                {seguro.preco_atual.usaValor
                  ? `${parseFloat(seguro.preco_atual.premio_valor).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })} (Fixo)`
                  : `${seguro.preco_atual.premio_percentagem}%`
                }
              </Descriptions.Item>
              <Descriptions.Item label="Vigência">
                {dayjs(seguro.preco_atual.data_inicio).format('DD/MM/YYYY')}
                {' → '}
                {seguro.preco_atual.data_fim
                  ? dayjs(seguro.preco_atual.data_fim).format('DD/MM/YYYY')
                  : 'Atual'
                }
              </Descriptions.Item>
            </Descriptions>
          </>
        )}

        {/* Histórico de Preços */}
        <Divider orientation="left">
          <Space>
            Histórico de Preços
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setModalPreco(true)}
              style={{ background: '#1e40af' }}
            >
              Adicionar Preço
            </Button>
          </Space>
        </Divider>
        <Table
          columns={columnsPrecos}
          dataSource={seguro.precos || []}
          rowKey={(record) => record.id_preco ?? record.id ?? record.idPreco}
          pagination={false}
          size="small"
        />

        {/* Coberturas */}
        <Divider orientation="left">
          <Space>
            Coberturas
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setModalCobertura(true)}
              style={{ background: '#1e40af' }}
            >
              Adicionar Cobertura
            </Button>
          </Space>
        </Divider>
        <Table
          columns={columnsCoberturas}
          dataSource={seguro.coberturas || []}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* Modal Adicionar Preço */}
      <Modal
        title="Adicionar Novo Preço"
        open={modalPreco}
        onCancel={() => {
          setModalPreco(false);
          formPreco.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={formPreco}
          layout="vertical"
          onFinish={handleAdicionarPreco}
          initialValues={{ usaValor: false }}
        >

          <Form.Item
            label="Usar Valor Fixo?"
            name="usaValor"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Sim"
              unCheckedChildren="Não"
              onChange={setUsaValor}
            />
          </Form.Item>

          <Form.Item
            label="Prêmio Percentagem (%)"
            name="premio_percentagem"
            hidden={usaValor}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={100}
              step={0.5}
              placeholder="0.00"
            />
          </Form.Item>

          <Form.Item
            label="Prêmio Valor Fixo (MZN)"
            name="premio_valor"
            hidden={!usaValor}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={100}
              placeholder="0.00"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label="Data Início"
            name="data_inicio"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            label="Data Fim"
            name="data_fim"
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" style={{ background: '#1e40af' }}>
                Adicionar
              </Button>
              <Button onClick={() => {
                setModalPreco(false);
                formPreco.resetFields();
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Adicionar Cobertura */}
      <Modal
        title="Adicionar Nova Cobertura"
        open={modalCobertura}
        onCancel={() => {
          setModalCobertura(false);
          formCobertura.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={formCobertura}
          layout="vertical"
          onFinish={handleAdicionarCobertura}
        >
          <Form.Item
            label="Descrição da Cobertura"
            name="descricao"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <TextArea rows={3} placeholder="Ex: Cobertura contra roubo e furto" />
          </Form.Item>

          <Form.Item
            label="Franquia (MZN)"
            name="franquia"
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={100}
              placeholder="0.00"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label="Valor Mínimo (MZN)"
            name="valor_minimo"
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={100}
              placeholder="0.00"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" style={{ background: '#1e40af' }}>
                Adicionar
              </Button>
              <Button onClick={() => {
                setModalCobertura(false);
                formCobertura.resetFields();
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DetalhesSeguro;
