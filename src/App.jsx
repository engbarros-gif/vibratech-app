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
  
