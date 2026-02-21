import { HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ComparisonProvider } from './context/ComparisonContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Compare } from './pages/Compare';

/**
 * Root application component.
 * Uses HashRouter for GitHub Pages compatibility.
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ComparisonProvider>
        <HashRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/compare" element={<Compare />} />
          </Routes>
        </HashRouter>
      </ComparisonProvider>
    </QueryClientProvider>
  );
}
