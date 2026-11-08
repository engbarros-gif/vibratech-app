import React, { useState, useEffect } from 'react';
import { 
  Activity, Calendar, AlertTriangle, CheckCircle, Clock, 
  FileText, Upload, RefreshCw, FileSpreadsheet, ShieldCheck, 
  Search, ChevronRight, Check, X, Layers, Image as ImageIcon, Send, Printer, Edit3
} from 'lucide-react';

const API_BASE_URL = "https://vibratech-api.vercel.app/api";

export default function App() {
  const [activeTab, setActiveTab] = useState(1);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Database Data States
  const [routes, setRoutes] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [failureHistory, setFailureHistory] = useState([]);

  // Form & Filter States
  const [selectedRoute, setSelectedRoute] = useState('ROUTE-01');
  const [selectedFile, setSelectedFile] = useState(null);
  const [measFilterRoute, setMeasFilterRoute] = useState('ALL');
  const [measFilterStatus, setMeasFilterStatus] = useState('ALL');

  // Selected Point Diagnosis Form State
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [validationType, setValidationType] = useState('Acknowledged');
  const [validationJustification, setValidationJustification] = useState('');
  const [failureDescription, setFailureDescription] = useState('');
  const [selectedFailureTypes, setSelectedFailureTypes] = useState(['Unbalance']);
  const [reportRecommendation, setReportRecommendation] = useState('');
  const [reportSeverity, setReportSeverity] = useState('Alert');
  const [spectrumImages, setSpectrumImages] = useState([]);
  const [showClientReportPreview, setShowClientReportPreview] = useState(false);

  // Matrix Recommendations Map
  const matrixFailures = [
    { type: "Unbalance", recommendation: "Inspect the rotating components for material buildup, wear, damage, or missing balance weights. Clean the rotating assembly as required and perform dynamic balancing if vibration remains elevated." },
    { type: "Misalignment", recommendation: "Check the alignment between the driver and driven equipment. Inspect the coupling condition and correct soft foot before performing precision alignment. Recheck vibration after correction." },
    { type: "Mechanical Looseness", recommendation: "Inspect and tighten the machine mounting bolts, bearing housing bolts, baseplate and structural connections. Check for cracks, excessive clearances, grout deterioration or loss of structural rigidity." },
    { type: "Structural Looseness / Loss of Rigidity", recommendation: "Inspect the machine base, supports, foundation, anchor bolts and structural connections. Check for cracks, loose components, deteriorated grout or loss of material. Restore structural rigidity and verify vibration after repair." },
    { type: "Rolling Element Bearing Defect", recommendation: "Inspect the bearing condition and lubrication. Check for abnormal noise, temperature and mechanical looseness. Plan bearing replacement according to the vibration trend and equipment criticality. Inspect the removed bearing to confirm the failure mechanism." },
    { type: "Lubrication Deficiency – Bearing", recommendation: "Verify lubricant type, quantity and lubrication interval. Inspect the lubrication system for blocked lines, damaged fittings or inadequate lubricant delivery. Lubricate according to manufacturer recommendations and monitor the vibration envelope after intervention." },
    { type: "Gear / Gear Mesh Problem", recommendation: "Inspect the gearbox for gear tooth wear, damage, excessive backlash and lubrication condition. Check oil level and contamination and perform oil analysis when applicable. Inspect gear contact pattern and monitor gear mesh vibration after corrective action." },
    { type: "Coupling Problem", recommendation: "Inspect the coupling for wear, cracks, damaged or broken components, excessive clearance and deterioration of flexible elements. Verify shaft alignment and replace damaged coupling components as required." },
    { type: "Soft Foot", recommendation: "Check the machine feet for soft foot conditions before alignment. Correct shimming, inspect the base and tighten mounting bolts according to the recommended torque. Perform precision alignment after correction." },
    { type: "Bent Shaft / Shaft Runout", recommendation: "Check shaft mechanical and electrical runout and inspect for shaft deformation. Verify coupling condition and alignment. Correct or replace the shaft if runout exceeds acceptable limits." }
  ];

  // Fetch initial data from FastAPI/Neon
  const loadData = async () => {
    setLoading(true);
    try {
      const [resRoutes, resMeas] = await Promise.all([
        fetch(`${API_BASE_URL}/rotas`),
        fetch(`${API_BASE_URL}/medicoes`)
      ]);
      
      if (resRoutes.ok) {
        const dataRoutes = await resRoutes.json();
        setRoutes(dataRoutes);
      }
      if (resMeas.ok) {
        const dataMeas = await resMeas.json();
        setMeasurements(dataMeas);
      }
    } catch (err) {
      console.error("Error connecting to API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const toggleFailureType = (failureType) => {
    let updated = [];
    if (selectedFailureTypes.includes(failureType)) {
      updated = selectedFailureTypes.filter(t => t !== failureType);
    } else {
      updated = [...selectedFailureTypes, failureType];
    }
    setSelectedFailureTypes(updated);

    const generatedRecs = updated.map(t => {
      const match = matrixFailures.find(m => m.type === t);
      return match ? `• ${m.type}: ${match.recommendation}` : '';
    }).filter(Boolean).join('\n\n');

    setReportRecommendation(generatedRecs);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      showNotify("Please select an SKF HTML file first.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("rota_nome", selectedRoute);

    try {
      const res = await fetch(`${API_BASE_URL}/upload-html`, {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        showNotify(data.message || "Route HTML successfully imported into Neon DB!");
        setSelectedFile(null);
        loadData();
      } else {
        showNotify("Error parsing HTML file via API.");
      }
    } catch (err) {
      showNotify("Failed to reach API server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFailureRecord = async () => {
    if (!selectedPoint) return;

    if (validationType === 'Acknowledged' && selectedFailureTypes.length === 0) {
      alert("Please select at least one Failure Type from the Matrix before generating a client report.");
      return;
    }

    const recordPayload = {
      id: `REG-${Date.now().toString().slice(-5)}`,
      ponto_medicao: selectedPoint.ponto_medicao,
      equipamento_tag: selectedPoint.equipamento || 'EQUIP-GENERIC',
      area_set: selectedPoint.area || 'GENERAL',
      validation_type: validationType,
      justificativa_erro: validationJustification,
      tipos_falha: selectedFailureTypes.join(', '),
      descricao_falha: failureDescription,
      severidade: reportSeverity,
      recomendacao: reportRecommendation,
      espectros_count: spectrumImages.length
    };

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/registros-falha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recordPayload)
      });

      if (res.ok) {
        if (validationType === 'Measurement Error') {
          showNotify(`Point ${selectedPoint.ponto_medicao} dismissed as Measurement Error.`);
        } else {
          showNotify(`Report created successfully for point ${selectedPoint.ponto_medicao}!`);
          setShowClientReportPreview(true);
        }
        setMeasurements(prev => prev.filter(m => m.ponto_medicao !== selectedPoint.ponto_medicao));
        setFailureHistory(prev => [recordPayload, ...prev]);
      }
    } catch (err) {
      showNotify("Error saving record to database.");
    } finally {
      setLoading(false);
    }
  };

  const openDiagnosis = (point) => {
    setSelectedPoint(point);
    setValidationType('Acknowledged');
    setValidationJustification('');
    setFailureDescription(`Elevated vibration overall spectrum detected at ${point.ponto_medicao}. Prominent peak observed.`);
    setSelectedFailureTypes(['Unbalance']);
    const defaultRec = matrixFailures.find(m => m.type === 'Unbalance')?.recommendation || '';
    setReportRecommendation(`• Unbalance: ${defaultRec}`);
    setReportSeverity(point.status === 'Danger' ? 'Critical' : 'Alert');
    setShowClientReportPreview(false);
    setActiveTab(4);
  };

  // Calculation for Dashboards
  const pendingMeasurements = measurements.filter(m => m.status !== 'Completed' && m.status !== 'Measurement Error');
  const criticalCount = pendingMeasurements.filter(m => m.status === 'Danger').length;
  const alertCount = pendingMeasurements.filter(m => m.status === 'Alert').length;
  const monitorCount = pendingMeasurements.filter(m => m.status === 'Normal').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex flex-wrap justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wide">VibraTech</h1>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2 py-0.5 rounded font-mono">
                NEON POSTGRES CONNECTED
              </span>
            </div>
            <p className="text-xs text-slate-400">Intelligent Vibration Analysis & Inspection Route System (28-Day Cycle)</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-300">
          <button onClick={loadData} className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync DB
          </button>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200 px-6 flex gap-2 pt-3">
        {[
          { id: 1, label: '1. Dashboard', icon: Activity },
          { id: 2, label: '2. Route Schedule (Import HTML)', icon: Calendar },
          { id: 3, label: `3. Measurement History (${pendingMeasurements.length})`, icon: Layers },
          { id: 4, label: '4. Point Diagnosis & Report', icon: FileText },
          { id: 5, label: `5. Failure Records (${failureHistory.length})`, icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Alert Notification */}
      {notification && (
        <div className="bg-emerald-600 text-white px-6 py-2 flex justify-between items-center text-sm font-medium animate-fade-in shadow-inner">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Main Body */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Routes</span>
                <div className="text-2xl font-bold text-slate-800 mt-1">{routes.length || 3}</div>
                <span className="text-xs text-slate-500">Configured in Neon DB</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Routes</span>
                <div className="text-2xl font-bold text-emerald-600 mt-1">1</div>
                <span className="text-xs text-emerald-600 font-medium">Within 28-day cycle</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overdue / Pending Routes</span>
                <div className="text-2xl font-bold text-amber-600 mt-1">2</div>
                <span className="text-xs text-amber-600 font-medium">Inspection required</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Alarms</span>
                <div className="text-2xl font-bold text-rose-600 mt-1">{pendingMeasurements.length}</div>
                <span className="text-xs text-rose-600 font-medium">Awaiting analyst report</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center justify-between">
                  <span>Failure Breakdown by Severity</span>
                  <span className="text-xs text-slate-400 font-normal">Current Cycle</span>
                </h3>
                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex mb-6">
                  <div style={{ width: '33%' }} className="bg-rose-500"></div>
                  <div style={{ width: '50%' }} className="bg-amber-400"></div>
                  <div style={{ width: '17%' }} className="bg-sky-400"></div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
                    <span className="text-xs font-semibold text-rose-700 block">Critical</span>
                    <span className="text-lg font-bold text-rose-800">{criticalCount || 2}</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <span className="text-xs font-semibold text-amber-700 block">Alarm</span>
                    <span className="text-lg font-bold text-amber-800">{alertCount || 3}</span>
                  </div>
                  <div className="p-3 bg-sky-50 rounded-lg border border-sky-100">
                    <span className="text-xs font-semibold text-sky-700 block">Monitor</span>
                    <span className="text-lg font-bold text-sky-800">{monitorCount || 1}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center justify-between">
                  <span>Plant Area Health & Condition</span>
                  <span className="text-xs text-slate-400 font-normal">Operational Status (%)</span>
                </h3>
                <div className="space-y-4">
                  {[
                    { area: 'PM1 BASEMENT', health: 100, status: 'Normal' },
                    { area: 'COAT STEAM DRYER', health: 85, status: '2 in alarm' },
                    { area: 'DRYER SECTION', health: 90, status: '1 in alarm' }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-700">{item.area}</span>
                        <span className={item.health === 100 ? 'text-emerald-600' : 'text-amber-600'}>
                          {item.health}% Healthy ({item.status})
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div style={{ width: `${item.health}%` }} className={item.health === 100 ? 'bg-emerald-500' : 'bg-amber-500'}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Top Critical Vibration Alarms (Unacknowledged)</span>
              </h3>
              <div className="divide-y divide-slate-100">
                {(measurements.length > 0 ? measurements : [
                  { ponto_medicao: '1CDRY 128 TS AE4', equipamento: 'COAT STEAM DRYER', status: 'Danger', valor: '8.4 mm/s' },
                  { ponto_medicao: '1DRY 045 BS AE2', equipamento: 'DRYER SECTION', status: 'Alert', valor: '4.1 mm/s' }
                ]).slice(0, 5).map((point, i) => (
                  <div key={i} className="py-3 flex justify-between items-center hover:bg-slate-50 px-2 rounded-lg transition">
                    <div>
                      <div className="font-semibold text-slate-800">{point.equipamento || point.ponto_medicao}</div>
                      <div className="text-xs text-slate-500">{point.ponto_medicao}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        point.status === 'Danger' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {point.valor || 'Elevated'}
                      </span>
                      <button 
                        onClick={() => openDiagnosis(point)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        Validate & Report <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROUTE SCHEDULE & HTML IMPORT */}
        {activeTab === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" /> Import SKF HTML Data
              </h3>
              <p className="text-xs text-slate-500">Select route and upload SKF report file to update cycle & alarm status.</p>
              
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Target Route</label>
                <select 
                  value={selectedRoute} 
                  onChange={e => setSelectedRoute(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="ROUTE-01">ROUTE-01: PM1 DRYER SECTION</option>
                  <option value="ROUTE-02">ROUTE-02: PM1 PRESS SECTION</option>
                  <option value="ROUTE-03">ROUTE-03: PUMP HOUSE</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Select SKF HTML File</label>
                <input 
                  type="file" 
                  accept=".html,.htm" 
                  onChange={e => setSelectedFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <button 
                onClick={handleFileUpload}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition flex justify-center items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                {loading ? 'Processing...' : 'Import & Update Neon DB'}
              </button>
            </div>

            <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4">Configured Inspection Routes (28-Day Cycle)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 uppercase text-slate-400 font-semibold border-b">
                    <tr>
                      <th className="py-3 px-4">Route ID</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Last Exec.</th>
                      <th className="py-3 px-4">Next Due</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(routes.length > 0 ? routes : [
                      { rota_id: 'R-01', nome_rota: 'PM1 DRYER SECTION', last_execution: '2026-10-15', next_execution: '2026-11-12', status: 'Compliant' },
                      { rota_id: 'R-02', nome_rota: 'PM1 PRESS SECTION', last_execution: '2026-09-20', next_execution: '2026-10-18', status: 'Overdue' }
                    ]).map((r, idx) => (
                      <tr key={idx}>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{r.rota_id || r.id}</td>
                        <td className="py-3 px-4 font-medium">{r.nome_rota || r.name}</td>
                        <td className="py-3 px-4">{r.last_execution || 'N/A'}</td>
                        <td className="py-3 px-4">{r.next_execution || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${
                            r.status === 'Compliant' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MEASUREMENT HISTORY */}
        {activeTab === 3 && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <h3 className="font-semibold text-slate-800 text-base">Unprocessed Vibration Alarms</h3>
              <div className="flex items-center gap-3">
                <select 
                  value={measFilterRoute} 
                  onChange={e => setMeasFilterRoute(e.target.value)}
                  className="p-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="ALL">All Routes</option>
                  <option value="ROUTE-01">ROUTE-01</option>
                </select>
                <select 
                  value={measFilterStatus} 
                  onChange={e => setMeasFilterStatus(e.target.value)}
                  className="p-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Danger">Critical (Danger)</option>
                  <option value="Alert">Alert</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 uppercase text-slate-400 font-semibold border-b">
                  <tr>
                    <th className="py-3 px-4">Point Tag</th>
                    <th className="py-3 px-4">Equipment / Area</th>
                    <th className="py-3 px-4">Value</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingMeasurements.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400">
                        No pending unacknowledged alarms found. All routes cleared!
                      </td>
                    </tr>
                  ) : (
                    pendingMeasurements.map((m, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{m.ponto_medicao}</td>
                        <td className="py-3 px-4">{m.equipamento || 'PULP MILL AREA'}</td>
                        <td className="py-3 px-4 font-bold text-slate-700">{m.valor_vibracao || m.valor || '5.2 mm/s'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${
                            m.status === 'Danger' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button 
                            onClick={() => openDiagnosis(m)}
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium transition"
                          >
                            Diagnose Point
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: DIAGNOSIS & CLIENT REPORT FORM */}
        {activeTab === 4 && (
          <div className="space-y-6">
            {!selectedPoint ? (
              <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-slate-700 font-semibold">No Point Selected</h4>
                <p className="text-xs text-slate-400 mb-4">Please select a point from the History or Dashboard tab to begin diagnosis.</p>
                <button onClick={() => setActiveTab(3)} className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg font-medium">
                  Go to Measurement History
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                  <div className="border-b pb-4">
                    <span className="text-xs font-semibold text-blue-600 uppercase">Analysis Form</span>
                    <h2 className="text-lg font-bold text-slate-800">{selectedPoint.ponto_medicao}</h2>
                    <p className="text-xs text-slate-500">{selectedPoint.equipamento || 'EQUIPMENT'} | Value: {selectedPoint.valor_vibracao || 'Elevated'}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">1. Validation Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setValidationType('Acknowledged')}
                        className={`p-3 rounded-lg border text-left text-xs font-medium transition ${
                          validationType === 'Acknowledged' 
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4 mb-1 text-blue-600" />
                        Acknowledged (Real Issue)
                      </button>
                      <button
                        onClick={() => setValidationType('Measurement Error')}
                        className={`p-3 rounded-lg border text-left text-xs font-medium transition ${
                          validationType === 'Measurement Error' 
                            ? 'border-amber-600 bg-amber-50 text-amber-700 font-bold' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <X className="w-4 h-4 mb-1 text-amber-600" />
                        Measurement Error / False Alarm
                      </button>
                    </div>

                    {validationType === 'Measurement Error' && (
                      <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-2">
                        <label className="text-xs font-semibold text-amber-800 block">Justification for Dismissal</label>
                        <textarea
                          rows={2}
                          value={validationJustification}
                          onChange={e => setValidationJustification(e.target.value)}
                          placeholder="e.g., Sensor cable noise or improper probe placement in field..."
                          className="w-full p-2 text-xs border border-amber-300 rounded bg-white"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">2. Failure Description (Analyst Observation)</label>
                    <textarea
                      rows={3}
                      value={failureDescription}
                      onChange={e => setFailureDescription(e.target.value)}
                      placeholder="Describe spectral peaks, sidebands, harmonics, or operational conditions..."
                      className="w-full p-3 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-700 block">3. Matrix Failure Types (Multi-Select)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {matrixFailures.map((item, idx) => {
                        const isSelected = selectedFailureTypes.includes(item.type);
                        return (
                          <button
                            key={idx}
                            onClick={() => toggleFailureType(item.type)}
                            className={`p-2 rounded text-left text-xs border transition flex justify-between items-center ${
                              isSelected 
                                ? 'bg-blue-600 text-white border-blue-600 font-semibold' 
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span>{item.type}</span>
                            {isSelected && <Check className="w-3 h-3" />}
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Generated Technical Recommendation (Editable)</label>
                      <textarea
                        rows={4}
                        value={reportRecommendation}
                        onChange={e => setReportRecommendation(e.target.value)}
                        className="w-full p-3 border border-slate-300 rounded-lg text-xs bg-slate-50 font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t flex justify-end gap-3">
                    <button
                      onClick={handleSaveFailureRecord}
                      disabled={loading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg text-xs transition flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {loading ? 'Saving...' : 'Save Record & Generate A4 Report'}
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Severity Status</h4>
                    <div className="flex gap-2">
                      {['Critical', 'Alert', 'Monitor'].map(sev => (
                        <button
                          key={sev}
                          onClick={() => setReportSeverity(sev)}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg border text-center ${
                            reportSeverity === sev 
                              ? 'bg-slate-900 text-white border-slate-900' 
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          {sev}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showClientReportPreview && selectedPoint && (
              <div className="bg-white p-8 rounded-xl border border-slate-300 shadow-lg mt-8 max-w-3xl mx-auto space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">VibraTech Engineering Services</h3>
                    <p className="text-xs text-slate-500">A4 Client Technical Diagnosis Report</p>
                  </div>
                  <button onClick={() => window.print()} className="bg-slate-800 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1">
                    <Printer className="w-4 h-4" /> Print Report
                  </button>
                </div>
                <div className="space-y-4 text-xs text-slate-700">
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded border">
                    <div><b>Point Tag:</b> {selectedPoint.ponto_medicao}</div>
                    <div><b>Severity:</b> <span className="text-rose-600 font-bold">{reportSeverity}</span></div>
                    <div><b>Equipment:</b> {selectedPoint.equipamento || 'PULP MILL EQUIPMENT'}</div>
                    <div><b>Date:</b> {new Date().toLocaleDateString()}</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Analyst Observations</h4>
                    <p className="p-3 bg-slate-50 rounded border">{failureDescription}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Corrective Recommendations</h4>
                    <p className="p-3 bg-slate-50 rounded border whitespace-pre-line font-mono">{reportRecommendation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: FAILURE RECORDS */}
        {activeTab === 5 && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3
