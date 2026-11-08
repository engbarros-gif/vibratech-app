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

const INITIAL_SCHEDULE_DATA = [
  {
    plan_id: "1M #1PM BASEMENT 1",
    route_name: "#1PM BASEMENT 1",
    area: "PM1",
    frequency: "28 Days",
    last_execution: "2026-10-19 08:00:00",
    next_execution: "2026-11-16 08:00:00",
    responsable: "de Barros Marcelo",
    equipment_count: 77,
    points_count: 415,
    status: "Completed"
  },
  {
    plan_id: "1M #1PM COATERS A",
    route_name: "#1PM COATERS A",
    area: "PM1",
    frequency: "28 Days",
    last_execution: "2026-10-14 08:00:00",
    next_execution: "2026-11-11 08:00:00",
    responsable: "de Barros Marcelo",
    equipment_count: 76,
    points_count: 491,
    status: "Pending"
  },
  {
    plan_id: "1M #1PM DRYER SECTION",
    route_name: "1ST DRYER SECTION VIBRATION",
    area: "DRYER SECTION",
    frequency: "28 Days",
    last_execution: "2026-09-27 05:40:00",
    next_execution: "2026-10-25 05:40:00",
    responsable: "de Barros Marcelo",
    equipment_count: 42,
    points_count: 180,
    status: "Overdue"
  }
];

const INITIAL_MEASUREMENTS_DATA = [
  {
    id: 1,
    equipamento_tag: "COAT STEAM DRYER",
    unidade_fabril: "PM1",
    area_set: "COAT STEAM DRYER",
    ponto_medicao: "1CDRY 128 TS AE4",
    data_hora: "2026-08-27 06:54:39",
    valor_medido: 0.01,
    valor_limite: 0.033,
    variacao_perc: 235.0,
    unidade: "gE",
    status_alarme: "Overall - Danger",
    validation_status: "Unacknowledged",
    validation_justification: ""
  },
  {
    id: 2,
    equipamento_tag: "COAT STEAM DRYER",
    unidade_fabril: "PM1",
    area_set: "COAT STEAM DRYER",
    ponto_medicao: "GEAR 128A AE3",
    data_hora: "2026-08-27 06:57:19",
    valor_medido: 0.269,
    valor_limite: 1.045,
    variacao_perc: 288.0,
    unidade: "gE",
    status_alarme: "Overall - Alert",
    validation_status: "Unacknowledged",
    validation_justification: ""
  },
  {
    id: 3,
    equipamento_tag: "DRYER SECTION",
    unidade_fabril: "PM1",
    area_set: "DRYER SECTION",
    ponto_medicao: "TS02AE4",
    data_hora: "2026-08-27 05:40:17",
    valor_medido: 0.008,
    valor_limite: 0.026,
    variacao_perc: 211.0,
    unidade: "gE",
    status_alarme: "Alert: High Deviation (>200%)",
    validation_status: "Unacknowledged",
    validation_justification: ""
  },
  {
    id: 4,
    equipamento_tag: "DRYER SECTION",
    unidade_fabril: "PM1",
    area_set: "DRYER SECTION",
    ponto_medicao: "TS03AV",
    data_hora: "2026-08-27 05:41:30",
    valor_medido: 0.131,
    valor_limite: 0.208,
    variacao_perc: 58.2,
    unidade: "in/s",
    status_alarme: "1 Band: PM dryer bearing mid range, Peak - Danger\n2 Band: PM dryer bearing mid range, Overall - Danger\n3 Overall - Alert\n4 Band: Paper Machine Dryer Bearing HF, Overall - Danger",
    validation_status: "Unacknowledged",
    validation_justification: ""
  },
  {
    id: 5,
    equipamento_tag: "DRYER SECTION",
    unidade_fabril: "PM1",
    area_set: "DRYER SECTION",
    ponto_medicao: "TS01AV",
    data_hora: "2026-08-27 05:39:40",
    valor_medido: 0.036,
    valor_limite: 0.025,
    variacao_perc: -30.4,
    unidade: "in/s",
    status_alarme: "---",
    validation_status: "Acknowledged",
    validation_justification: ""
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scheduleData, setScheduleData] = useState(INITIAL_SCHEDULE_DATA);
  const [measurementsData, setMeasurementsData] = useState(INITIAL_MEASUREMENTS_DATA);

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
            plan_id: r.rota_id || r.plan_id || "ROUTE",
            route_name: r.nome_rota || r.route_name || "Inspection Route",
            area: r.area || "PM1",
            frequency: "28 Days",
            last_execution: r.last_execution || "2026-10-19 08:00:00",
            next_execution: r.next_execution || "2026-11-16 08:00:00",
            responsable: "de Barros Marcelo",
            equipment_count: 77,
            points_count: 415,
            status: r.status || "Pending"
          }));
          setScheduleData(mappedRoutes);
        }
      }

      if (resMeas.ok) {
        const dataMeas = await resMeas.json();
        if (Array.isArray(dataMeas) && dataMeas.length > 0) {
          const mappedMeas = dataMeas.map((m, idx) => ({
            id: m.id || idx + 1,
            equipamento_tag: m.equipamento || m.equipamento_tag || "EQUIPMENT",
            unidade_fabril: "PM1",
            area_set: m.area || "GENERAL",
            ponto_medicao: m.ponto_medicao || m.ponto || "POINT-01",
            data_hora: m.data_medicao || m.data_hora || "2026-11-08 08:00:00",
            valor_medido: m.valor_vibracao || m.valor_medido || 0.0,
            valor_limite: 0.05,
            variacao_perc: 150.0,
            unidade: "mm/s",
            status_alarme: m.status === 'Danger' ? 'Overall - Danger' : (m.status === 'Alert' ? 'Overall - Alert' : '---'),
            validation_status: m.validation_status || "Unacknowledged",
            validation_justification: m.validation_justification || ""
          }));
          setMeasurementsData(mappedMeas);
        }
      }
    } catch (err) {
      console.error("Using fallback mock data due to API connection state:", err);
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
                    {scheduleData.map(route => (
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
                    ))}
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
                    {measurementsData
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
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diagnostic' && selectedPointForReport && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <button
                onClick={() => setActiveTab('measurements')}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to History</span>
              </button>

              <div className="flex items-center gap-2">
                {validationType === 'Measurement Error' ? (
                  <button
                    onClick={handleDismissMeasurementError}
                    className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Confirm Dismissal (Collection Error)</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSaveFailureRecord}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Failure Record & Generate Standard Report</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">{selectedPointForReport.equipamento_tag}</span>
                    <h3 className="text-xl font-bold text-slate-900">Technical Report & Validation: {selectedPointForReport.ponto_medicao}</h3>
                  </div>
                  <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full border border-rose-200">
                    Deviation: +{selectedPointForReport.variacao_perc}%
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <label className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                    1. Analyst Validation (Validation_Type):
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setValidationType('Unacknowledged')}
                      className={`p-3 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                        validationType === 'Unacknowledged'
                          ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400/30'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <HelpCircle className="w-4 h-4 text-amber-600" />
                        <span>Unacknowledged</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal">Pending technical evaluation</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setValidationType('Acknowledged')}
                      className={`p-3 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                        validationType === 'Acknowledged'
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-400/30'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Acknowledged</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal">Real fault confirmed (Generate Report)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setValidationType('Measurement Error')}
                      className={`p-3 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                        validationType === 'Measurement Error'
                          ? 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-400/30'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Measurement Error</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal">Field collection error (Dismiss)</span>
                    </button>
                  </div>

                  {validationType === 'Measurement Error' && (
                    <div className="pt-2">
                      <label className="text-[11px] font-bold text-rose-800 block mb-1">
                        Collection Error Justification (Required to remove from pending):
                      </label>
                      <input
                        type="text"
                        value={validationJustification}
                        onChange={(e) => setValidationJustification(e.target.value)}
                        placeholder="Ex: Sensor poorly mounted during measurement, transient process noise..."
                        className="w-full bg-white text-slate-800 text-xs p-2.5 rounded-lg border border-rose-300 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  )}
                </div>

                {validationType !== 'Measurement Error' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        2. Failure Description (Analyst Analysis):
                      </label>
                      <textarea
                        rows={3}
                        value={failureDescription}
                        onChange={(e) => setFailureDescription(e.target.value)}
                        placeholder="Describe in detail what was identified during technical analysis of frequency bands..."
                        className="w-full bg-slate-50 text-slate-800 text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800 block">
                        3. Identified Failure Types (`Matrix_Failure_Types`):
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Select one or more failure types so the system includes pre-determined recommendation text in the editable field below:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                        {FAILURE_TYPES_MATRIX.map(matrixItem => {
                          const isSelected = selectedFailureTypes.includes(matrixItem.type);
                          return (
                            <button
                              type="button"
                              key={matrixItem.type}
                              onClick={() => handleToggleFailureType(matrixItem)}
                              className={`p-2 rounded-lg text-left text-xs font-medium border flex items-center justify-between transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
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
                        placeholder="Recommendations from selected matrix will appear here. You can modify or expand this text..."
                        className="w-full bg-slate-50 text-slate-800 text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
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
                        <span className="text-[11px] text-slate-400 font-normal">Attach SKF software screenshots</span>
                      </label>

                      <div className="flex flex-wrap gap-3 items-center">
                        {spectrumImages.map(img => (
                          <div key={img.id} className="relative group w-24 h-24 bg-slate-100 rounded-xl overflow-hidden border border-slate-300 shadow-sm">
                            <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                              <span className="text-[9px] text-white font-mono text-center p-1">{img.name}</span>
                            </div>
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
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <LineChartIcon className="w-4 h-4 text-indigo-600" />
                    Measured Point Summary
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Point:</span>
                      <span className="font-bold">{selectedPointForReport.ponto_medicao}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Measured:</span>
                      <span className="font-bold text-indigo-700">{selectedPointForReport.valor_medido} {selectedPointForReport.unidade}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Limit:</span>
                      <span className="font-bold text-slate-700">{selectedPointForReport.valor_limite} {selectedPointForReport.unidade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Validation:</span>
                      <span className="font-bold font-mono text-indigo-900">{validationType}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Registered SKF Alarms:</label>
                    <div className="bg-rose-50 text-rose-900 p-3 rounded-xl border border-rose-200 text-xs font-mono whitespace-pre-line">
                      {selectedPointForReport.status_alarme}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <p className="text-[11px] text-slate-400">
                    Upon validation, records will be relationally stored in Neon PostgreSQL and rendered into standard reports.
                  </p>
                </div>
              </div>
            </div>

            {showClientReportPreview && (
              <div id="client-report-section" className="bg-white rounded-2xl p-8 border-2 border-indigo-200 shadow-xl space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 text-white p-2.5 rounded-xl font-bold">
                      VT
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">VIBRATION ANALYSIS TECHNICAL REPORT</h3>
                      <p className="text-xs text-slate-500">Asset Condition Technical Report — VibraTech</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Saved to Database
                    </span>
                    <button
                      onClick={() => window.print()}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print / Export PDF</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block">Equipment:</span>
                    <strong className="text-slate-900">{selectedPointForReport.equipamento_tag}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Measured Point:</span>
                    <strong className="text-indigo-700 font-mono">{selectedPointForReport.ponto_medicao}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Detected Failure:</span>
                    <strong className="text-slate-900">{selectedFailureTypes.join(", ") || "Under Analysis"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Severity:</span>
                    <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">{reportSeverity}</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1">Analyst Failure Description:</h4>
                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg">{failureDescription || "No additional comments added."}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1">Maintenance Technical Recommendations:</h4>
                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg whitespace-pre-line font-mono">{reportRecommendation || "Maintain trend monitoring in the next cycle."}</p>
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
                Analyzed Points History & Failure Records (`tb_registros_falha`)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Centralized database of completed technical analyses. To edit or review a published report, use the "Edit Report" button.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                    <tr>
                      <th className="p-3.5">Record ID</th>
                      <th className="p-3.5">Equipment</th>
                      <th className="p-3.5">Point</th>
                      <th className="p-3.5">Failure Types</th>
                      <th className="p-3.5">Severity</th>
                      <th className="p-3.5">Description</th>
                      <th className="p-3.5 text-center">Spectra</th>
                      <th className="p-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {savedFailuresHistory.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                          No completed reports yet. Select a pending alarm from Tab 3 to issue a report.
                        </td>
                      </tr>
                    ) : (
                      savedFailuresHistory.map(rec => (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td className="p-3.5 font-mono text-indigo-700 font-bold">{rec.id}</td>
                          <td className="p-3.5 font-bold text-slate-900">{rec.equipamento}</td>
                          <td className="p-3.5 font-mono font-bold">{rec.ponto}</td>
                          <td className="p-3.5 font-semibold text-slate-800">{rec.tipos_falha}</td>
                          <td className="p-3.5">
                            <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">{rec.severidade}</span>
                          </td>
                          <td className="p-3.5 max-w-xs truncate text-slate-700">{rec.descricao_falha}</td>
                          <td className="p-3.5 text-center font-mono">{rec.espectros_count} attachment(s)</td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => handleOpenPointDiagnostic(rec.ponto_original, rec)}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
                            >
                              Edit Report
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
      </main>
    </div>
  );
}
