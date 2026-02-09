import { useMemo, useState } from 'react';
import EntryMenu from './pages/EntryMenu.jsx';
import UniversalMorph from './features/universal-morph/UniversalMorph.jsx';
import InfographicMorph from './features/infographic-morph/InfographicMorph.jsx';

const VIEW_COMPONENTS = {
  'universal-morph': UniversalMorph,
  'infographic-morph': InfographicMorph
};

export default function App() {
  const [activeView, setActiveView] = useState('menu');

  const ActiveComponent = useMemo(() => VIEW_COMPONENTS[activeView], [activeView]);

  if (activeView === 'menu') {
    return <EntryMenu onSelect={(item) => setActiveView(item.id)} />;
  }

  if (!ActiveComponent) {
    return <EntryMenu onSelect={(item) => setActiveView(item.id)} />;
  }

  return <ActiveComponent onBack={() => setActiveView('menu')} />;
}
