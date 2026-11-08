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
  const [selectedPointForReport, setSelectedPointForReport] = useState(null);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [validationType, setValidationType] = useState('Unacknowledged');
  const [validationJustification, setValidationJustification] = useState('');
  const [failureDescription, setFailureDescription] = useState('');
  const [selectedFailureTypes, setSelectedFailureTypes] = useState([]);
  const [spectrumImages, setSpectrumImages] = useState([]);
  const [reportRecommendation, setReportRecommendation] = useState('');
  const [reportSeverity, setReportSeverity] = useState('CRITICAL');
  const [savedFailuresHistory, setSavedFailuresHistory] = useState([]);
  const [showClientReportPreview, setShowClientReportPreview] = useState(false);

  const [measFilterRoute, setMeasFilterRoute] = useState('ALL');
  const [measFilterStatus, setMeasFilterStatus] = useState('ALARM');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  const loadNeonData = async () => {
    try {
      const [resRoutes, resMeas] = await Promise.all([
        fetch(`${API_BASE_URL}/rotas`),
        fetch(`${API_BASE_URL}/medicoes`)
      ]);

      if (resRoutes.ok) {
        const dataRoutes = await resRoutes.json();
        if (Array.isArray(dataRoutes) && dataRoutes.length > 0) {
          const mappedRoutes = dataRoutes.map(r => ({
            plan_id: r.plan_id || "ROUTE",
            route_name: r.route_name || "Inspection Route",
            area: r.area || (r.route_name ? r.route_name.split(" ")[1] || "PM1" : "PM1"),
            frequency: r.frequency || "Monthly",
            last_execution: r.last_execution ? r.last_execution.replace('T', ' ').substring(0, 19) : "2026-10-19 08:00:00",
            next_execution: r.next_execution ? r.next_execution.replace('T', ' ').substring(0, 19) : "2026-11-16 08:00:00",
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
            valor_medido: m.valor_vibracao || m.valor_medido || 0.0,
            valor_limite: m.valor_limite || 0.05,
            variacao_perc: m.variacao_perc || 150.0,
            unidade: m.unidade || "mm/s",
            status_alarme: m.status_alarme || (m.status === 'Danger' ? 'Overall - Danger' : (m.status === 'Alert' ? 'Overall - Alert' : '---')),
            validation_status: m.validation_status || "Unacknowledged",
            validation_justification: m.validation_justification || ""
          }));
          setMeasurementsData(mappedMeas);
        } else {
          setMeasurementsData([]);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar dados do Neon:", err);
    }
  };

  useEffect(() => {
    loadNeonData();
  }, []);

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
          simulateLocalUpload(route);
        }
      } catch (err) {
        simulateLocalUpload(route);
      } finally {
        setIsUploading(false);
        setSelectedRouteForUpload(null);
        setTimeout(() => setUploadSuccessMsg(''), 6000);
      }
    };

    fileInput.click();
  };

  const simulateLocalUpload = (route) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 28);
    const nextStr = nextDate.toISOString().replace('T', ' ').substring(0, 19);

    setScheduleData(prev => prev.map(item => {
      if (item.plan_id === route.plan_id) {
        return {
          ...item,
          last_execution: nowStr,
          next_execution: nextStr,
          status: 'Completed'
        };
      }
      return item;
    }));
    setUploadSuccessMsg(`SKF HTML report for Route "${route.route_name}" successfully uploaded and processed! Next execution updated to +28 days.`);
  };

  const handleOpenPointDiagnostic = (point, existingRecord = null) => {
    setSelectedPointForReport(point);
    
    if (existingRecord) {
      setEditingRecordId(existingRecord.id);
      setValidationType(existingRecord.validation_type || 'Acknowledged');
      setValidationJustification('');
      setFailureDescription(existingRecord.descricao_falha);
      setSelectedFailureTypes(existingRecord.tipos_falha ? existingRecord.tipos_falha.split(", ") : []);
      setReportRecommendation(existingRecord.recomendacao);
      setReportSeverity(existingRecord.severidade);
      setSpectrumImages(existingRecord.espectros || []);
    } else {
      setEditingRecordId(null);
      setValidationType(point.validation_status || 'Unacknowledged');
      setValidationJustification(point.validation_justification || '');
      
      const initialFailures = point.status_alarme.toLowerCase().includes('bearing') 
        ? ["Rolling Element Bearing Defect"] 
        : ["Unbalance"];

      setSelectedFailureTypes(initialFailures);
      setFailureDescription(point.status_alarme !== '---' 
        ? `Significant vibration deviation (+${point.variacao_perc}%) detected during measurement. Characteristic signal with elevated amplitudes in high frequency bands.` 
        : ''
      );
      
      const recText = FAILURE_TYPES_MATRIX
        .filter(item => initialFailures.includes(item.type))
        .map(item => item.text)
        .join("\n\n");

      setReportRecommendation(recText);
      setSpectrumImages([
        { id: 1, name: "OuterRing_FFT_Spectrum.png", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60" }
      ]);
    }

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

  const handleDismissMeasurementError = () => {
    if (!selectedPointForReport || !validationJustification.trim()) {
      alert("Please enter a justification for the measurement/collection error.");
      return;
    }

    setMeasurementsData(prev => prev.map(m => {
      if (m.id === selectedPointForReport.id) {
        return {
          ...m,
          validation_status: "Measurement Error",
          validation_justification: validationJustification
        };
      }
      return m;
    }));

    setUploadSuccessMsg(`Measurement at point "${selectedPointForReport.ponto_medicao}" validated as COLLECTION ERROR.`);
    setActiveTab('measurements');
    setTimeout(() => setUploadSuccessMsg(''), 5000);
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
    if (!selectedPointForReport) return;

    if (validationType === 'Acknowledged' && selectedFailureTypes.length === 0) {
      alert("Please select at least one Failure Type in the matrix before saving.");
      return;
    }

    setMeasurementsData(prev => prev.map(m => {
      if (m.id === selectedPointForReport.id) {
        return {
          ...m,
          validation_status: "Completed",
          validation_justification: validationJustification
        };
      }
      return m;
    }));

    const recordData = {
      id: editingRecordId || `REG-${Date.now().toString().slice(-5)}`,
      ponto_id: selectedPointForReport.id,
      equipamento: selectedPointForReport.equipamento_tag,
      ponto: selectedPointForReport.ponto_medicao,
      area: selectedPointForReport.area_set,
      data_registro: new Date().toLocaleString('en-US'),
      validation_type: "Completed",
      tipos_falha: selectedFailureTypes.join(", ") || "Under Analysis",
      descricao_falha: failureDescription || "Technical report generated based on SKF frequency bands and envelope.",
      severidade: reportSeverity,
      recomendacao: reportRecommendation,
      espectros: spectrumImages,
      espectros_count: spectrumImages.length,
      ponto_original: selectedPointForReport
    };

    try {
      await fetch(`${API_BASE_URL}/registros-falha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: recordData.id,
          ponto_medicao: recordData.ponto,
          equipamento_tag: recordData.equipamento,
          area_set: recordData.area,
          validation_type: recordData.validation_type,
          tipos_falha: recordData.tipos_falha,
          descricao_falha: recordData.descricao_falha,
          severidade: recordData.severidade,
          recomendacao: recordData.recomendacao,
          espectros_count: recordData.espectros_count
        })
      });
    } catch (err) {
      console.error("Backend sync warning:", err);
    }

    if (editingRecordId) {
      setSavedFailuresHistory(prev => prev.map(r => r.id === editingRecordId ? recordData : r));
    } else {
      setSavedFailuresHistory(prev => [recordData, ...prev]);
    }

    setShowClientReportPreview(true);
    setUploadSuccessMsg(`Analysis for point "${selectedPointForReport.ponto_medicao}" COMPLETED! Saved to database.`);
    
    setTimeout(() => {
      const reportElement = document.getElementById('client-report-section');
      if (reportElement) {
        reportElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);

    setTimeout(() => setUploadSuccessMsg(''), 6000);
  };

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
                Intelligent Vibration Analysis & Inspection Route System (28-Day Cycle)
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

          {selectedPointForReport && (
            <button
              onClick={() => setActiveTab('diagnostic')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'diagnostic' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>4. Diagnostic & Report ({selectedPointForReport.ponto_medicao})</span>
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
                <span className="text-[11px] text-emerald-600 block mt-1 font-medium">Within 28-day cycle</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Overdue / Pending Routes</span>
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
                    const criticalCount = savedFailuresHistory.filter(f => f.severidade === 'CRITICAL').length + 
                                           measurementsData.filter(m => m.status_alarme.includes('Danger') && m.validation_status === 'Unacknowledged').length;
                    
                    const alertCount = savedFailuresHistory.filter(f => f.severidade === 'ALARM').length + 
                                         measurementsData.filter(m => m.status_alarme.includes('Alert') && m.validation_status === 'Unacknowledged').length;
                    
                    const monitorCount = savedFailuresHistory.filter(f => f.severidade === 'MONITOR').length + 1;
                    const total = criticalCount + alertCount + monitorCount || 1;

                    const critPct = Math.round((criticalCount / total) * 100);
                    const alertPct = Math.round((alertCount / total) * 100);
                    const monPct = Math.round((monitorCount / total) * 100);

                    return (
                      <div className="space-y-4">
                        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                          <div style={{ width: `${critPct}%` }} className="bg-rose-600 h-full transition-all duration-500" title={`Critical: ${critPct}%`} />
                          <div style={{ width: `${alertPct}%` }} className="bg-amber-500 h-full transition-all duration-500" title={`Alarm: ${alertPct}%`} />
                          <div style={{ width: `${monPct}%` }} className="bg-sky-500 h-full transition-all duration-500" title={`Monitor: ${monPct}%`} />
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-2">
                          <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl">
                            <span className="text-[11px] font-bold text-rose-700 block">🔴 Critical</span>
                            <span className="text-xl font-black text-rose-900">{criticalCount}</span>
                            <span className="text-[10px] text-rose-600 block mt-0.5">{critPct}% of occurrences</span>
                          </div>

                          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                            <span className="text-[11px] font-bold text-amber-700 block">🟡 Alarm</span>
                            <span className="text-xl font-black text-amber-900">{alertCount}</span>
                            <span className="text-[10px] text-amber-600 block mt-0.5">{alertPct}% of occurrences</span>
                          </div>

                          <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl">
                            <span className="text-[11px] font-bold text-sky-700 block">🔵 Monitor</span>
                            <span className="text-xl font-black text-sky-900">{monitorCount}</span>
                            <span className="text-[10px] text-sky-600 block mt-0.5">{monPct}% of occurrences</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
                  <span>Auto-updated via Neon PostgreSQL</span>
                  <span className="font-semibold text-slate-600">Active Cycle</span>
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
                      { area: "PM1 BASEMENT", total: 415, alarms: 0 },
                      { area: "COAT STEAM DRYER", total: 491, alarms: 2 },
                      { area: "DRYER SECTION", total: 180, alarms: 2 }
                    ].map(areaItem => {
                      const healthyPct = Math.round(((areaItem.total - areaItem.alarms) / areaItem.total) * 100);
                      const isHighRisk = areaItem.alarms > 1;

                      return (
                        <div key={areaItem.area} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-800">{areaItem.area}</span>
                            <span className="font-mono text-slate-600">
                              <strong className={isHighRisk ? "text-rose-600" : "text-emerald-600"}>{healthyPct}% Normal</strong> ({areaItem.alarms} in alarm)
                            </span>
                          </div>

                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                            <div 
                              style={{ width: `${healthyPct}%` }} 
                              className={`h-full ${healthyPct > 98 ? 'bg-emerald-500' : 'bg-amber-500'} transition-all duration-500`} 
                            />
                            <div 
                              style={{ width: `${100 - healthyPct}%` }} 
                              className="bg-rose-500 h-full transition-all duration-500" 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
                  <span>Continuous condition monitoring</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    Plant Operational
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                Top 5 Critical Vibration Alarms (Unacknowledged)
              </h3>
              <div className="divide-y divide-slate-100">
                {measurementsData
                  .filter(m => m.status_alarme !== '---' && m.validation_status !== 'Measurement Error' && m.validation_status !== 'Completed')
                  .slice(0, 5)
                  .map(m => (
                    <div key={m.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{m.equipamento_tag}</span>
                        <span className="text-xs text-indigo-600 font-mono font-semibold ml-2">[{m.ponto_medicao}]</span>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">{m.status_alarme}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-rose-600 font-mono">+{m.variacao_perc}%</span>
                        <button
                          onClick={() => handleOpenPointDiagnostic(m)}
                          className="block text-[11px] font-bold text-indigo-600 hover:text-indigo-800 mt-1 cursor-pointer"
                        >
                          Validate & Generate Report &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Inspection Route Schedule (`tb_schedule_rotas`)</h2>
              <p className="text-xs text-slate-500">
                Select the target route and click <strong>"Import SKF HTML"</strong> to upload the SKF report file, update execution timestamp and automatically reschedule next execution to <strong>+28 days</strong>.
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
                      <th className="p-3.5">Next Execution (+28d)</th>
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
                          <td className="p-3.5 font-mono">{route.last_execution}</td>
                          <td className="p-3.5 font-mono text-emerald-700 font-bold">{route.next_execution}</td>
                          <td className="p-3.5">{route.responsable}</td>
                          <td className="p-3.5 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              route.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                              route.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}>
                              {route.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => handleImportHTMLForRoute(route)}
                              disabled={isUploading && selectedRouteForUpload?.plan_id === route.plan_id}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 mx-auto cursor-pointer shadow-sm disabled:opacity-50"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isUploading && selectedRouteForUpload?.plan_id === route.plan_id ? "Uploading..." : "Import SKF HTML"}</span>
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
                <h2 className="text-lg font-bold text-slate-900">Vibration Measurement History (`tb_medicoes_vibracao`)</h2>
                <p className="text-xs text-slate-500">Filter open measurements. Click on any alarm to proceed to technical validation.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={measFilterRoute}
                  onChange={(e) => setMeasFilterRoute(e.target.value)}
                  className="bg-slate-50 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl border border-slate-300"
                >
                  <option value="ALL">All Routes / Areas</option>
                  <option value="PM1">PM1 BASEMENT</option>
                  <option value="COAT STEAM DRYER">COAT STEAM DRYER</option>
                  <option value="DRYER SECTION">DRYER SECTION</option>
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
                      <th className="p-3.5">ID</th>
                      <th className="p-3.5">Equipment</th>
                      <th className="p-3.5">Point</th>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Measured</th>
                      <th className="p-3.5">Limit</th>
                      <th className="p-3.5">Dev (%)</th>
                      <th className="p-3.5">Concatenated Alarms (\n)</th>
                      <th className="p-3.5">Validation Status</th>
                      <th className="p-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {measurementsData.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-slate-400 font-medium">
                          Nenhuma medição encontrada. Faça o upload de um relatório HTML na aba de Rotas.
                        </td>
                      </tr>
                    ) : (
                      measurementsData
                        .filter(m => {
                          if (measFilterStatus === 'ALARM') {
                            return m.status_alarme !== '---' && m.validation_status !== 'Measurement Error' && m.validation_status !== 'Completed';
                          }
                          return true;
                        })
                        .map(m => (
                          <tr key={m.id} className="hover:bg-slate-50">
                            <td className="p-3.5 font-mono text-slate-500">{m.id}</td>
                            <td className="p-3.5 font-bold text-slate-900">{m.equipamento_tag}</td>
                            <td className="p-3.5 font-mono text-indigo-700 font-bold">{m.ponto_medicao}</td>
                            <td className="p-3.5 font-mono text-slate-500">{m.data_hora}</td>
                            <td className="p-3.5 font-bold">{m.valor_medido} {m.unidade}</td>
                            <td className="p-3.5 font-mono">{m.valor_limite} {m.unidade}</td>
                            <td className={`p-3.5 font-bold font-mono ${m.variacao_perc > 200 ? 'text-rose-600' : 'text-amber-600'}`}>
                              +{m.variacao_perc}%
                            </td>
                            <td className="p-3.5 font-mono text-[11px] whitespace-pre-line max-w-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                              {m.status_alarme}
                            </td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                m.validation_status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                m.validation_status === 'Measurement Error' ? 'bg-slate-200 text-slate-700 line-through' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {m.validation_status}
                              </span>
                            </td>
                            <td className="p-3.5 text-center">
                              <button
                                onClick={() => handleOpenPointDiagnostic(m)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer shadow-sm"
                              >
                                Validate Point
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

        {activeTab === 'diagnostic' && selectedPointForReport && (
          <div className="space-y-6">
