import { useEffect, useMemo, useState } from 'react';
import type { Cliente, PedidoResumo, PedidoDetalhado, Produto } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

const currency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—';
  const date = value.includes('T') ? value.split('T')[0] : value;
  return new Date(date).toLocaleDateString('pt-BR');
};

export default function DashboardPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pedidos, setPedidos] = useState<PedidoResumo[]>([]);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoDetalhado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const totalItensEstoque = useMemo(
    () => produtos.reduce((acc, item) => acc + item.qtdEstoque, 0),
    [produtos],
  );

  const produtosEmAlerta = useMemo(
    () => produtos.filter((produto) => produto.emAlerta).length,
    [produtos],
  );

  const totalPedido = pedidoSelecionado
    ? pedidoSelecionado.itens.reduce(
        (acc, item) => acc + item.qtdProduto * item.precoUnit,
        0,
      )
    : 0;

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [clientesResponse, produtosResponse, pedidosResponse] = await Promise.all([
        fetch(`${API_URL}/clientes`),
        fetch(`${API_URL}/produtos`),
        fetch(`${API_URL}/pedidos`),
      ]);

      if (!clientesResponse.ok || !produtosResponse.ok || !pedidosResponse.ok) {
        throw new Error('Não foi possível carregar os dados do sistema.');
      }

      setClientes(await clientesResponse.json());
      setProdutos(await produtosResponse.json());
      setPedidos(await pedidosResponse.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const openPedido = async (idVenda: number) => {
    try {
      const response = await fetch(`${API_URL}/pedidos/${idVenda}`);
      if (!response.ok) {
        throw new Error('Não foi possível carregar o pedido.');
      }
      const dados = await response.json();
      setPedidoSelecionado(dados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao abrir detalhes do pedido.');
    }
  };

  return (
    <div className="page-block">
      <div className="page-header">
        <div>
          <p className="section-kicker">Visão geral</p>
          <h1>Dashboard</h1>
        </div>
      </div>

      {error ? <div className="alert-box">{error}</div> : null}

      <div className="summary-grid">
        <article className="summary-card accent">
          <span>Produtos</span>
          <strong>{produtos.length}</strong>
          <small>{totalItensEstoque} unidades em estoque</small>
        </article>
        <article className="summary-card">
          <span>Clientes</span>
          <strong>{clientes.length}</strong>
          <small>{pedidos.length} pedidos cadastrados</small>
        </article>
        <article className="summary-card warning">
          <span>Alertas</span>
          <strong>{produtosEmAlerta}</strong>
          <small>Produtos abaixo do mínimo</small>
        </article>
      </div>

      <div className="panel-grid dashboard-grid">
        <div className="panel-card">
          <div className="panel-header">
            <h2>Produtos em estoque</h2>
          </div>
          {loading ? (
            <p className="loading-text">Carregando...</p>
          ) : (
            <table className="data-table compact">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Estoque</th>
                  <th>Preço</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((produto) => (
                  <tr key={produto.idProduto} className={produto.emAlerta ? 'danger-row' : ''}>
                    <td>{produto.descricao}</td>
                    <td>{produto.qtdEstoque}</td>
                    <td>{currency(produto.preco)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h2>Últimos pedidos</h2>
          </div>
          <div className="list-stack">
            {pedidos.slice(0, 5).map((pedido) => (
              <button
                type="button"
                key={pedido.idVenda}
                className="mini-card"
                onClick={() => openPedido(pedido.idVenda)}
              >
                <div>
                  <strong>#{pedido.idVenda}</strong>
                  <span>{pedido.nomeCliente}</span>
                </div>
                <small>{formatDate(pedido.dataVenda)}</small>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="panel-card detail-panel">
        <div className="panel-header">
          <h2>Detalhes do pedido</h2>
        </div>
        {pedidoSelecionado ? (
          <>
            <div className="detail-header">
              <div>
                <p className="section-kicker">Pedido #{pedidoSelecionado.pedido.idVenda}</p>
                <h3>{pedidoSelecionado.pedido.nomeCliente}</h3>
              </div>
              <span className="total-pill">{currency(totalPedido)}</span>
            </div>
            <ul className="detail-list">
              {pedidoSelecionado.itens.map((item) => (
                <li key={`${item.idProduto}-${item.descricao}`}>
                  <div>
                    <strong>{item.descricao}</strong>
                    <span>
                      {item.qtdProduto} x {currency(item.precoUnit)}
                    </span>
                  </div>
                  <b>{currency(item.qtdProduto * item.precoUnit)}</b>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="empty-state">Selecione um pedido para ver os itens.</p>
        )}
      </div>
    </div>
  );
}
