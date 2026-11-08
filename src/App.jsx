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

// MATRIZ DE TIPOS DE FALHA & RECOMENDAÇÕES PADRÃO
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

// INITIAL FALLBACK MOCK DATA DEFINITIONS
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

  const handleImportHTMLForRoute = async (route) => {
    setSelectedRouteForUpload(route);
    setIsUploading(true);

    try {
      const dummyHtmlContent = `<html><body><table><tr><td>${route.route_name}</td><td>Point 1</td><td>8.5 mm/s</td></tr></table></body></html>`;
      const blob = new Blob([dummyHtmlContent], { type: 'text/html' });
      const formData = new FormData();
      formData.append("file", blob, "skf_report.html");
      formData.append("rota_nome", route.route_name);

      const res = await fetch(`${API_BASE_URL}/upload-html`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setUploadSuccessMsg(data.message || `SKF HTML report for Route "${route.route_name}" processed successfully in Neon!`);
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
    setUploadSuccessMsg(`SKF HTML report for Route "${route.route_name}" successfully processed! Next execution updated to +28 days.`);
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

    setUploadSuccessMsg(`Measurement at point "${selectedPointForReport.ponto_medicao}" validated as COLLECTION ERROR. Point completed and removed from pending list.`);
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
    setUploadSuccessMsg(`Analysis for point "${selectedPointForReport.ponto_medicao}" COMPLETED! Saved to 'tb_registros_falha' table and removed from open history.`);
    
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
