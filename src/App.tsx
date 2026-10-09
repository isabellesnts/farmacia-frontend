import { NavLink, Route, Routes } from 'react-router-dom';
import './App.css';
import ClientesPage from './pages/ClientesPage';
import DashboardPage from './pages/DashboardPage';
import PedidosPage from './pages/PedidosPage';
import ProdutosPage from './pages/ProdutosPage';

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-box">
          <div className="brand-mark">+</div>
          <div>
            <span>Farmácia</span>
            <strong>Mais Saúde</strong>
          </div>
        </div>

        <nav className="nav-menu">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/clientes">Clientes</NavLink>
          <NavLink to="/produtos">Produtos</NavLink>
          <NavLink to="/pedidos">Pedidos</NavLink>
        </nav>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/produtos" element={<ProdutosPage />} />
          <Route path="/pedidos" element={<PedidosPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
