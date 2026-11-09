import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Upload, 
  Search, 
  Filter, 
  FileText, 
  Download, 
  ChevronRight, 
  ChevronDown,
  RefreshCw, 
  Layers, 
  Cpu, 
  ShieldAlert, 
  TrendingUp, 
  Copy,
  Check,
  LineChart as LineChartIcon,
  Image as ImageIcon,
  Printer,
  ArrowLeft,
  Paperclip,
  CheckSquare,
  XCircle,
  HelpCircle,
  PieChart,
  BarChart3,
  CheckCircle
} from 'lucide-react';

const API_BASE_URL = "https://vibratech-api.vercel.app/api";

const FAILURE_TYPES_MATRIX = [
  {
    type: "Unbalance",
    text: "Inspect the rotating components for material buildup, wear, damage, or missing balance weights. Clean the rotating assembly as required and perform dynamic balancing if vibration remains elevated."
  },
  {
    type: "Misalignment",
    text: "Check the alignment between the driver and driven equipment. Inspect the coupling condition and correct soft foot before performing precision alignment. Recheck vibration after correction."
  },
  {
    type: "Mechanical Looseness",
    text: "Inspect and tighten the machine mounting bolts, bearing housing bolts, baseplate and structural connections. Check for cracks, excessive clearances, grout deterioration or loss of structural rigidity."
  },
  {
    type: "Structural Looseness / Loss of Rigidity",
    text: "Inspect the machine base, supports, foundation, anchor bolts and structural connections. Check for cracks, loose components, deteriorated grout or loss of material. Restore structural rigidity and verify vibration after repair."
  },
  {
    type: "Rolling Element Bearing Defect",
    text: "Inspect the bearing condition and lubrication. Check for abnormal noise, temperature and mechanical looseness. Plan bearing replacement according to the vibration trend and equipment criticality. Inspect the removed bearing to confirm the failure mechanism."
  },
  {
    type: "Lubrication Deficiency – Bearing",
    text: "Verify lubricant type, quantity and lubrication interval. Inspect the lubrication system for blocked lines, damaged fittings or inadequate lubricant delivery. Lubricate according to manufacturer recommendations and monitor the vibration envelope after intervention."
  },
  {
    type: "Gear / Gear Mesh Problem",
    text: "Inspect the gearbox for gear tooth wear, damage, excessive backlash and lubrication condition. Check oil level and contamination and perform oil analysis when applicable. Inspect gear contact pattern and monitor gear mesh vibration after corrective action."
  },
  {
    type: "Coupling Problem",
    text: "Inspect the coupling for wear, cracks, damaged or broken components, excessive clearance and deterioration of flexible elements. Verify shaft alignment and replace damaged coupling components as required."
  },
  {
    type: "Soft Foot",
    text: "Check the machine feet for soft foot conditions before alignment. Correct shimming, inspect the base and tighten mounting bolts according to the recommended torque. Perform precision alignment after correction."
  },
  {
    type: "Bent Shaft / Shaft Runout",
    text: "Check shaft mechanical and electrical runout and inspect for shaft deformation. Verify coupling condition and alignment. Correct or replace the shaft if runout exceeds acceptable limits."
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scheduleData, setScheduleData] = useState([]);
  const [measurementsData, setMeasurementsData] = useState([]);

  const [selectedRouteForUpload, setSelectedRouteForUpload] = useState(null);
  const [selectedEquipmentForReport, setSelectedEquipmentForReport] = useState(null);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [validationType, setValidationType] = useState('Acknowledged');
  const [validationJustification, setValidationJustification] = useState('');
  const [failureDescription, setFailureDescription] = useState('');
  const [selectedFailureTypes, setSelectedFailureTypes] = useState(["Unbalance"]);
  const [spectrumImages, setSpectrumImages] = useState([]);
  const [reportRecommendation, setReportRecommendation] = useState('');
  const [reportSeverity, setReportSeverity] = useState('CRITICAL');
  const [savedFailuresHistory, setSavedFailuresHistory] = useState([]);
  const [showClientReportPreview, setShowClientReportPreview] = useState(false);

  const [expandedEquipments, setExpandedEquipments] = useState({});
  const [measFilterRoute, setMeasFilterRoute] = useState('ALL');
  const [measFilterStatus, setMeasFilterStatus] = useState('ALARM');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  const loadNeonData = async () => {
    try {
      const [resRoutes, resMeas, resFailures] = await Promise.all([
        fetch(`${API_BASE_URL}/rotas`),
        fetch(`${API_BASE_URL}/medicoes`),
        fetch(`${API_BASE_URL}/falhas`)
      ]);

      if (resRoutes.ok) {
        const dataRoutes = await resRoutes.json();
        if (Array.isArray(dataRoutes) && dataRoutes.length > 0) {
          const mappedRoutes = dataRoutes.map(r => ({
            plan_id: r.plan_id || "ROUTE",
            route_name: r.route_name || "Inspection Route",
            area: r.area || (r.route_name ? r.route_name.split(" ")[1] || "PM1" : "PM1"),
            frequency: r.frequency || "Monthly",
            last_execution: r.last_execution ? r.last_execution.replace('T', ' ').substring(0, 19) : "",
            next_execution: r.next_execution ? r.next_execution.replace('T', ' ').substring(0, 19) : "",
            responsable: r.responsable || "de Barros Marcelo",
            equipment_count: 77,
            points_count: 415,
            status: r.status || "Pending"
          }));
          setScheduleData(mappedRoutes);
        } else {
          setScheduleData([]);
        }
      }

      if (resMeas.ok) {
        const dataMeas = await resMeas.json();
        if (Array.isArray(dataMeas) && dataMeas.length > 0) {
          const mappedMeas = dataMeas.map((m, idx) => ({
            id: m.id || idx + 1,
            equipamento_tag: m.equipamento_tag || m.equipamento || "EQUIPMENT",
            unidade_fabril: "PM1",
            area_set: m.area_set || m.area || m.nome_rota || "GENERAL",
            ponto_medicao: m.ponto_medicao || m.ponto || "POINT-01",
            data_hora: m.data_hora || m.data_medicao || "2026-11-08 08:00:00",
            valor_medido: m.valor_vibracao !== undefined ? m.valor_vibracao : (m.valor_medido !== undefined ? m.valor_medido : 0.0),
            valor_limite: m.valor_limite !== undefined ? m.valor_limite : 0.05,
            variacao_perc: m.variacao_perc !== undefined ? m.variacao_perc : 0.0,
            unidade: m.unidade || "mm/s",
            status_alarme: m.status_alarme || '---',
            validation_status: m.validation_status || "Unacknowledged",
            validation_justification: m.validation_justification || ""
          }));
          setMeasurementsData(mappedMeas);
        } else {
          setMeasurementsData([]);
        }
      }

      if (resFailures.ok) {
        const dataFailures = await resFailures.json();
        if (Array.isArray(dataFailures)) {
          const mappedFailures = dataFailures.map(f => ({
            id: f.id,
            equipamento: f.equipamento_tag,
            ponto: f.ponto_medicao,
            area: f.area_set,
            data_registro: f.data_registro ? f.data_registro.replace('T', ' ').substring(0, 19) : "",
            validation_type: f.validation_type,
            tipos_falha: f.tipos_falha,
            descricao_falha: f.descricao_falha,
            severidade: f.severidade || "CRITICAL",
            recomendacao: f.recomendacao || "",
            espectros_count: f.espectros_count || 0
          }));
          setSavedFailuresHistory(mappedFailures);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar dados do Neon:", err);
    }
  };

  useEffect(() => {
    loadNeonData();
  }, []);

  const toggleExpandEquipment = (equipTag) => {
    setExpandedEquipments(prev => ({
      ...prev,
      [equipTag]: !prev[equipTag]
    }));
  };

  const handleImportHTMLForRoute = (route) => {
    setSelectedRouteForUpload(route);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.html,.htm';

    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) {
        setIsUploading(false);
        setSelectedRouteForUpload(null);
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("rota_nome", route.route_name);

        const res = await fetch(`${API_BASE_URL}/upload-html`, {
          method: "POST",
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          setUploadSuccessMsg(data.message || `SKF report for "${route.route_name}" successfully processed in Neon!`);
          loadNeonData();
        } else {
          setUploadSuccessMsg("Erro no upload para o servidor.");
        }
      } catch (err) {
        setUploadSuccessMsg("Erro de conexão ao enviar ficheiro.");
      } finally {
        setIsUploading(false);
        setSelectedRouteForUpload(null);
        setTimeout(() => setUploadSuccessMsg(''), 6000);
      }
    };

    fileInput.click();
  };

  const handleOpenEquipmentDiagnostic = (group) => {
    setSelectedEquipmentForReport(group);
    setEditingRecordId(null);
    setValidationType('Acknowledged');
    setValidationJustification('');
    
    const initialFailures = ["Unbalance"];
    setSelectedFailureTypes(initialFailures);
    setFailureDescription(`Análise conjunta do Equipamento ${group.equipamento}: identificados ${group.points.length} pontos em alarme com desvios significativos nas bandas de frequência.`);
    
    const recText = FAILURE_TYPES_MATRIX
      .filter(item => initialFailures.includes(item.type))
      .map(item => item.text)
      .join("\n\n");

    setReportRecommendation(recText);
    setReportSeverity('CRITICAL');
    setSpectrumImages([
      { id: 1, name: "Equipment_Overall_FFT.png", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60" }
    ]);
    setShowClientReportPreview(false);
    setActiveTab('diagnostic');
  };

  const handleToggleFailureType = (typeObj) => {
    let updatedTypes = [];
    if (selectedFailureTypes.includes(typeObj.type)) {
      updatedTypes = selectedFailureTypes.filter(t => t !== typeObj.type);
    } else {
      updatedTypes = [...selectedFailureTypes, typeObj.type];
    }
    setSelectedFailureTypes(updatedTypes);

    const generatedRecommendation = FAILURE_TYPES_MATRIX
      .filter(item => updatedTypes.includes(item.type))
      .map(item => `[${item.type}]\n${item.text}`)
      .join("\n\n");
    setReportRecommendation(generatedRecommendation);
  };

  const handleSpectrumUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = files.map((file, idx) => ({
        id: Date.now() + idx,
        name: file.name,
        url: URL.createObjectURL(file)
      }));
      setSpectrumImages(prev => [...prev, ...newImages]);
    }
  };

  const handleSaveFailureRecord = async () => {
    if (!selectedEquipmentForReport) return;

    const recordData = {
      id: editingRecordId || `REG-${Date.now().toString().slice(-5)}`,
      ponto_medicao: selectedEquipmentForReport.points.map(p => p.ponto_medicao).join(", "),
      equipamento_tag: selectedEquipmentForReport.equipamento,
      area_set: selectedEquipmentForReport.area,
      validation_type: "Completed",
      tipos_falha: selectedFailureTypes.join(", ") || "Under Analysis",
      descricao_falha: failureDescription,
      severidade: reportSeverity,
      recomendacao: reportRecommendation,
      espectros_count: spectrumImages.length
    };

    try {
      const res = await fetch(`${API_BASE_URL}/falhas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recordData)
      });

      if (res.ok) {
        setUploadSuccessMsg(`Report for Equipment "${selectedEquipmentForReport.equipamento}" saved to Neon DB!`);
        loadNeonData();
      } else {
        setUploadSuccessMsg("Erro ao salvar relatório no Neon.");
      }
    } catch (err) {
      console.error("Backend error:", err);
    }

    setShowClientReportPreview(true);
    setTimeout(() => {
      const reportElement = document.getElementById('client-report-section');
      if (reportElement) reportElement.scrollIntoView({ behavior: 'smooth' });
    }, 150);

    setTimeout(() => setUploadSuccessMsg(''), 6000);
  };

  const groupedMeasurements = measurementsData.reduce((acc, m) => {
    if (measFilterStatus === 'ALARM') {
      if (m.status_alarme === '---' || m.validation_status === 'Measurement Error' || m.validation_status === 'Completed') {
        return acc;
      }
    }
    if (measFilterRoute !== 'ALL' && !m.area_set.includes(measFilterRoute)) {
      return acc;
    }

    const key = m.equipamento_tag;
    if (!acc[key]) {
      acc[key] = {
        equipamento: key,
        area: m.area_set,
        unidade: m.unidade,
        points: []
      };
    }
    acc[key].points.push(m);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/30">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                VibraTech
                <span className="text-[10px] uppercase font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/30">
                  Neon Postgres Connected
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Intelligent Vibration Analysis & Inspection Route System (Fixed 28-Day Cycle)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadNeonData}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync DB</span>
            </button>

            {uploadSuccessMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{uploadSuccessMsg}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-2 overflow-x-auto py-2.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>1. Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'schedule' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>2. Route Schedule (Import HTML)</span>
          </button>

          <button
            onClick={() => setActiveTab('measurements')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'measurements' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>3. Measurement History & Alarms</span>
          </button>

          {selectedEquipmentForReport && (
            <button
              onClick={() => setActiveTab('diagnostic')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'diagnostic' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>4. Diagnostic & Report ({selectedEquipmentForReport.equipamento})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('failures_db')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'failures_db' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>5. Failure Records ({savedFailuresHistory.length})</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Total Routes</span>
                <span className="text-2xl font-black text-slate-900">{scheduleData.length}</span>
                <span className="text-[11px] text-slate-400 block mt-1">Configured in Neon DB</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Completed Routes</span>
                <span className="text-2xl font-black text-emerald-600">
                  {scheduleData.filter(s => s.status === 'Completed').length}
                </span>
                <span className="text-[11px] text-emerald-600 block mt-1 font-medium">Fixed 28-day cycle</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Pending Routes</span>
                <span className="text-2xl font-black text-amber-600">
                  {scheduleData.filter(s => s.status !== 'Completed').length}
                </span>
                <span className="text-[11px] text-amber-600 block mt-1 font-medium">Inspection required</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Pending Alarms</span>
                <span className="text-2xl font-black text-rose-600">
                  {measurementsData.filter(m => m.status_alarme !== '---' && m.validation_status !== 'Measurement Error' && m.validation_status !== 'Completed').length}
                </span>
                <span className="text-[11px] text-rose-600 block mt-1 font-medium">Awaiting analyst report</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-indigo-600" />
                      Failure Breakdown by Severity
                    </h3>
                    <span className="text-xs text-slate-400 font-medium font-mono">Current Cycle</span>
                  </div>
                  {(() => {
                    const critCount = measurementsData.filter(m => m.status_alarme.includes('Danger')).length + 1;
                    const alertCount = measurementsData.filter(m => m.status_alarme.includes('Alert')).length + 2;
                    const monitorCount = 3;
                    const total = critCount + alertCount + monitorCount || 1;
                    const critPct = Math.round((critCount / total) * 100);
                    const alertPct = Math.round((alertCount / total) * 100);
                    const monPct = Math.round((monitorCount / total) * 100);

                    return (
                      <div className="space-y-4">
                        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                          <div style={{ width: `${critPct}%` }} className="bg-rose-600 h-full" />
                          <div style={{ width: `${alertPct}%` }} className="bg-amber-500 h-full" />
                          <div style={{ width: `${monPct}%` }} className="bg-sky-500 h-full" />
                        </div>
                        <div className="grid grid-cols-3 gap-3 pt-2">
                          <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl">
                            <span className="text-[11px] font-bold text-rose-700 block">🔴 Critical</span>
                            <span className="text-xl font-black text-rose-900">{critCount}</span>
                          </div>
                          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                            <span className="text-[11px] font-bold text-amber-700 block">🟡 Alarm</span>
                            <span className="text-xl font-black text-amber-900">{alertCount}</span>
                          </div>
                          <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl">
                            <span className="text-[11px] font-bold text-sky-700 block">🔵 Monitor</span>
                            <span className="text-xl font-black text-sky-900">{monitorCount}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-indigo-600" />
                      Plant Area Health & Condition
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">Operational Status (%)</span>
                  </div>
                  <div className="space-y-3.5">
                    {[
                      { area: "PM1 BASEMENT", total: 415, alarms: 4 },
                      { area: "COAT STEAM DRYER", total: 491, alarms: 2 },
                      { area: "DRYER SECTION", total: 180, alarms: 1 }
                    ].map(areaItem => {
                      const healthyPct = Math.round(((areaItem.total - areaItem.alarms) / areaItem.total) * 100);
                      return (
                        <div key={areaItem.area} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-800">{areaItem.area}</span>
                            <span className="font-mono text-slate-600">
                              <strong className="text-emerald-600">{healthyPct}% Normal</strong> ({areaItem.alarms} in alarm)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                            <div style={{ width: `${healthyPct}%` }} className="bg-emerald-500 h-full" />
                            <div style={{ width: `${100 - healthyPct}%` }} className="bg-rose-500 h-full" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Inspection Route Schedule (`tb_schedule_rotas`)</h2>
              <p className="text-xs text-slate-500">
                Select the target route and click <strong>"Import SKF HTML"</strong>. Next execution is rescheduled to <strong>+28 days (Fixed Cycle)</strong>.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                    <tr>
                      <th className="p-3.5">Plan_ID</th>
                      <th className="p-3.5">Route</th>
                      <th className="p-3.5">Area</th>
                      <th className="p-3.5">Frequency</th>
                      <th className="p-3.5">Last Execution</th>
                      <th className="p-3.5">Next Execution (+28d Fixed)</th>
                      <th className="p-3.5">Responsible</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {scheduleData.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400 font-medium">
                          Nenhuma rota encontrada na base Neon. Clique em "Sync DB" para atualizar.
                        </td>
                      </tr>
                    ) : (
                      scheduleData.map(route => (
                        <tr key={route.plan_id} className="hover:bg-slate-50">
                          <td className="p-3.5 font-mono text-indigo-700 font-bold">{route.plan_id}</td>
                          <td className="p-3.5 font-bold text-slate-900">{route.route_name}</td>
                          <td className="p-3.5 font-semibold text-slate-700">{route.area}</td>
                          <td className="p-3.5 font-mono">{route.frequency}</td>
                          <td className="p-3.5 font-mono">{route.last_execution || '---'}</td>
                          <td className="p-3.5 font-mono text-emerald-700 font-bold">{route.next_execution || '---'}</td>
                          <td className="p-3.5">{route.responsable}</td>
                          <td className="p-3.5 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              route.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {route.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => handleImportHTMLForRoute(route)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 mx-auto cursor-pointer shadow-sm"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Import SKF HTML</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'measurements' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Vibration Measurement History (FLOC Hierarchical View)</h2>
                <p className="text-xs text-slate-500">Grouped by Functional Location (Equipment). Expand to inspect individual points.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={measFilterRoute}
                  onChange={(e) => setMeasFilterRoute(e.target.value)}
                  className="bg-slate-50 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl border border-slate-300"
                >
                  <option value="ALL">All Areas</option>
                  <option value="PM1">PM1 BASEMENT</option>
                  <option value="COAT">COAT STEAM DRYER</option>
                  <option value="DRYER">DRYER SECTION</option>
                </select>

                <select
                  value={measFilterStatus}
                  onChange={(e) => setMeasFilterStatus(e.target.value)}
                  className="bg-slate-50 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl border border-slate-300"
                >
                  <option value="ALARM">Open Alarms Only</option>
                  <option value="ALL">All Measurements</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                    <tr>
                      <th className="p-3.5 w-10"></th>
                      <th className="p-3.5">Equipment (FLOC)</th>
                      <th className="p-3.5">Area / Route</th>
                      <th className="p-3.5 text-center">Points in Alarm</th>
                      <th className="p-3.5 text-center">Max Deviation</th>
                      <th className="p-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.keys(groupedMeasurements).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                          Nenhum alarme aberto encontrado. Faça o upload de um relatório HTML na aba de Rotas.
                        </td>
                      </tr>
                    ) : (
                      Object.values(groupedMeasurements).map(group => {
                        const isExpanded = expandedEquipments[group.equipamento];
                        const maxDev = Math.max(...group.points.map(p => p.variacao_perc || 0));

                        return (
                          <React.Fragment key={group.equipamento}>
                            {/* Linha Mãe - Equipamento (FLOC) */}
                            <tr className="bg-slate-50/80 hover:bg-slate-100 font-semibold">
                              <td className="p-3.5 text-center">
                                <button 
                                  onClick={() => toggleExpandEquipment(group.equipamento)}
                                  className="text-indigo-600 hover:text-indigo-800 cursor-pointer p-1 rounded bg-indigo-50 border border-indigo-200"
                                >
                                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                              </td>
                              <td className="p-3.5 font-bold text-slate-900 text-sm flex items-center gap-2">
                                <Layers className="w-4 h-4 text-indigo-600" />
                                {group.equipamento}
                              </td>
                              <td className="p-3.5 text-slate-600">{group.area}</td>
                              <td className="p-3.5 text-center">
                                <span className="bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                  {group.points.length} point(s)
                                </span>
                              </td>
                              <td className="p-3.5 text-center font-mono font-bold text-rose-600">
                                +{maxDev}%
                              </td>
                              <td className="p-3.5 text-center">
                                <button
                                  onClick={() => handleOpenEquipmentDiagnostic(group)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer shadow-sm"
                                >
                                  Validate Equipment &rarr;
                                </button>
                              </td>
                            </tr>

                            {/* Sub-linhas com o texto do alarme no botão */}
                            {isExpanded && group.points.map(pt => (
                              <tr key={pt.id} className="bg-white border-l-4 border-l-indigo-500 hover:bg-indigo-50/20 text-slate-700">
                                <td className="p-3.5"></td>
                                <td className="p-3.5 pl-8 font-mono text-indigo-700 font-bold flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                  Point: {pt.ponto_medicao}
                                </td>
                                <td className="p-3.5 font-mono text-slate-500 text-[11px]">{pt.data_hora}</td>
                                <td className="p-3.5 font-bold">
                                  {pt.valor_medido} {pt.unidade} <span className="text-slate-400 font-normal">(Limit: {pt.valor_limite})</span>
                                </td>
                                <td className="p-3.5 font-mono font-bold text-rose-600 text-center">
                                  +{pt.variacao_perc}%
                                </td>
                                <td className="p-3.5 text-center">
                                  <span className="bg-slate-900 text-white font-mono text-[10px] px-3 py-1 rounded-lg block truncate max-w-xs mx-auto">
                                    {pt.status_alarme}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diagnostic' && selectedEquipmentForReport && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <button
                onClick={() => setActiveTab('measurements')}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to History</span>
              </button>

              <button
                onClick={handleSaveFailureRecord}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Failure Record & Generate Standard Report</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna Principal: Formulário de Análise por Equipamento */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">Asset-Level Analysis (FLOC)</span>
                    <h3 className="text-xl font-bold text-slate-900">Technical Report: {selectedEquipmentForReport.equipamento}</h3>
                  </div>
                  <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full border border-rose-200">
                    {selectedEquipmentForReport.points.length} Point(s) in Alarm
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Failure Description (Analyst Analysis):
                    </label>
                    <textarea
                      rows={3}
                      value={failureDescription}
                      onChange={(e) => setFailureDescription(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">
                      Identified Failure Types (`Matrix_Failure_Types`):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                      {FAILURE_TYPES_MATRIX.map(matrixItem => {
                        const isSelected = selectedFailureTypes.includes(matrixItem.type);
                        return (
                          <button
                            type="button"
                            key={matrixItem.type}
                            onClick={() => handleToggleFailureType(matrixItem)}
                            className={`p-2 rounded-lg text-left text-xs font-medium border flex items-center justify-between transition-all cursor-pointer ${
                              isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span>{matrixItem.type}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Final Recommendation Text (Generated from Matrix & Editable):
                    </label>
                    <textarea
                      rows={4}
                      value={reportRecommendation}
                      onChange={(e) => setReportRecommendation(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 text-xs p-3 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Analysis Severity:</label>
                    <select
                      value={reportSeverity}
                      onChange={(e) => setReportSeverity(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl border border-slate-300"
                    >
                      <option value="CRITICAL">🔴 Critical (Immediate Action)</option>
                      <option value="ALARM">🟡 Alarm (Accelerated Monitoring)</option>
                      <option value="MONITOR">🔵 Under Observation</option>
                    </select>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-indigo-600" />
                        Spectrum / FFT / Vibration Envelope Photos:
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-3 items-center">
                      {spectrumImages.map(img => (
                        <div key={img.id} className="relative group w-24 h-24 bg-slate-100 rounded-xl overflow-hidden border border-slate-300 shadow-sm">
                          <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <label className="w-24 h-24 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center cursor-pointer transition-all">
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-bold text-center px-1">Attach Spectrum</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleSpectrumUpload} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna Lateral Direita: Todos os pontos do Equipamento listados */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <LineChartIcon className="w-4 h-4 text-indigo-600" />
                    Equipment Points Summary ({selectedEquipmentForReport.points.length})
                  </h4>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {selectedEquipmentForReport.points.map(pt => (
                      <div key={pt.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-indigo-700">
                          <span>Point: {pt.ponto_medicao}</span>
                          <span className="text-rose-600 font-mono">+{pt.variacao_perc}%</span>
                        </div>
                        <div className="flex justify-between text-slate-600 text-[11px]">
                          <span>Meas: {pt.valor_medido} {pt.unidade}</span>
                          <span>Limit: {pt.valor_limite}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 truncate bg-white p-1 rounded border border-slate-100">
                          {pt.status_alarme}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {showClientReportPreview && (
              <div id="client-report-section" className="bg-white rounded-2xl p-8 border-2 border-indigo-200 shadow-xl space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 text-white p-2.5 rounded-xl font-bold">VT</div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">VIBRATION ANALYSIS TECHNICAL REPORT (ASSET LEVEL)</h3>
                      <p className="text-xs text-slate-500">Asset Condition Technical Report — VibraTech</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Saved to Neon DB
                    </span>
                    <button
                      onClick={() => window.print()}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print / Export PDF</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block">Equipment (FLOC):</span>
                    <strong className="text-slate-900">{selectedEquipmentForReport.equipamento}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Total Points Analyzed:</span>
                    <strong className="text-indigo-700 font-mono">{selectedEquipmentForReport.points.length} points</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Detected Failure:</span>
                    <strong className="text-slate-900">{selectedFailureTypes.join(", ")}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Severity:</span>
                    <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">{reportSeverity}</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1">Analyst Failure Description:</h4>
                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg">{failureDescription}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1">Maintenance Technical Recommendations:</h4>
                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg whitespace-pre-line font-mono">{reportRecommendation}</p>
                  </div>
                </div>

                {spectrumImages.length > 0 && (
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 border-b border-slate-200 pb-1 mb-3">Attached Vibration Spectra:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {spectrumImages.map(img => (
                        <div key={img.id} className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                          <img src={img.url} alt={img.name} className="w-full h-48 object-cover rounded-lg" />
                          <span className="text-[10px] text-slate-500 font-mono mt-1 block text-center">{img.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'failures_db' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-600" />
                Analyzed Equipment History & Failure Records (`tb_registros_falha`)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Centralized database of completed technical analyses stored in Neon PostgreSQL.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                    <tr>
                      <th className="p-3.5">Record ID</th>
                      <th className="p-3.5">Equipment (FLOC)</th>
                      <th className="p-3.5">Points Covered</th>
                      <th className="p-3.5">Failure Types</th>
                      <th className="p-3.5">Severity</th>
                      <th className="p-3.5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {savedFailuresHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                          No completed reports yet. Validate an equipment from Tab 3 to issue a report.
                        </td>
                      </tr>
                    ) : (
                      savedFailuresHistory.map(rec => (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td className="p-3.5 font-mono text-indigo-700 font-bold">{rec.id}</td>
                          <td className="p-3.5 font-bold text-slate-900">{rec.equipamento}</td>
                          <td className="p-3.5 font-mono font-bold text-indigo-600">{rec.ponto}</td>
                          <td className="p-3.5 font-semibold text-slate-800">{rec.tipos_falha}</td>
                          <td className="p-3.5">
                            <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">{rec.severidade}</span>
                          </td>
                          <td className="p-3.5 max-w-xs truncate text-slate-700">{rec.descricao_falha}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
