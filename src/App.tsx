import React from 'react';
import { PharmacyProvider, usePharmacy } from './context/PharmacyContext';
import { Layout } from './components/Layout';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { Inventory } from './pages/Inventory';
import { SalesHistory } from './pages/SalesHistory';
import { Prescriptions } from './pages/Prescriptions';
import { Purchases } from './pages/Purchases';
import { Suppliers } from './pages/Suppliers';
import { Customers } from './pages/Customers';
import { Reports } from './pages/Reports';
import { AIAssistant } from './pages/AIAssistant';
import { UsersPage } from './pages/UsersPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';

const MainContent: React.FC = () => {
  const { activeTab } = usePharmacy();

  switch (activeTab) {
    case 'dashboard':
      return <Dashboard />;
    case 'pos':
      return <POS />;
    case 'inventory':
      return <Inventory />;
    case 'sales':
      return <SalesHistory />;
    case 'prescriptions':
      return <Prescriptions />;
    case 'purchases':
      return <Purchases />;
    case 'suppliers':
      return <Suppliers />;
    case 'customers':
      return <Customers />;
    case 'reports':
      return <Reports />;
    case 'ai-assistant':
      return <AIAssistant />;
    case 'users':
      return <UsersPage />;
    case 'audit-logs':
      return <AuditLogsPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <Dashboard />;
  }
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = usePharmacy();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <Layout>
      <MainContent />
    </Layout>
  );
};

export default function App() {
  return (
    <PharmacyProvider>
      <AppContent />
    </PharmacyProvider>
  );
}

