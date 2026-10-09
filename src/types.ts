export type Cliente = {
  idCliente?: number;
  nome: string;
  cpf: string;
};

export type Produto = {
  idProduto: number;
  descricao: string;
  validade: string | null;
  preco: number;
  qtdEstoque: number;
  qtdMinEstoque: number;
  emAlerta: boolean;
};

export type PedidoResumo = {
  idVenda: number;
  idCliente: number;
  dataVenda: string;
  nomeCliente: string;
};

export type ItemPedido = {
  idProduto: number;
  descricao: string;
  qtdProduto: number;
  precoUnit: number;
};

export type PedidoDetalhado = {
  pedido: PedidoResumo;
  itens: ItemPedido[];
};

export type ItemPedidoForm = {
  idProduto: string;
  qtdProduto: string;
  precoUnit: string;
};
