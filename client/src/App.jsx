import React, { useEffect } from 'react';
import useStore from './utils/store';
import { exportAllRooms, exportSummary } from './utils/exportUtils';

import Sidebar  from './components/Sidebar';
import Toast    from './components/Toast';

import Dashboard     from './pages/Dashboard';
import ImportData    from './pages/ImportData';
import ClassManager  from './pages/ClassManager';
import RoomGroups    from './pages/RoomGroups';
import GeneratePlan  from './pages/GeneratePlan';
import RoomView      from './pages/RoomView';
import RollDirectory from './pages/RollDirectory';
import DateSheet     from './pages/DateSheet';
import SlipPreview   from './pages/SlipPreview';

const PAGES = {
  dashboard: Dashboard,
  import:    ImportData,
  classes:   ClassManager,
  rooms:     RoomGroups,
  generate:  GeneratePlan,
  roomview:  RoomView,
  directory: RollDirectory,
  datesheet: DateSheet,
  slips:     SlipPreview,
};

export default function App() {
  const { page, setPage, showToast } = useStore();
  const Page = PAGES[page] || Dashboard;

  useEffect(() => {
    if (!window.electronAPI) return;

    window.electronAPI.onMenuOpenFile(()      => setPage('import'));
    window.electronAPI.onMenuExportAll(async () => {
      const { classes, result } = useStore.getState();
      if (!result) { showToast('Generate a plan first.', false); return; }
      const ok = await exportAllRooms(classes, result);
      if (ok) showToast('✓ Exported all rooms CSV');
    });
    window.electronAPI.onMenuExportSummary(async () => {
      const { classes, result } = useStore.getState();
      if (!result) { showToast('Generate a plan first.', false); return; }
      const ok = await exportSummary(classes, result);
      if (ok) showToast('✓ Exported summary CSV');
    });

    return () => window.electronAPI.offMenuListeners();
  }, []);

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#0F1016]">
        <div key={page} className="p-5 fade-in">
          <Page />
        </div>
      </main>
      <Toast />
    </div>
  );
}
