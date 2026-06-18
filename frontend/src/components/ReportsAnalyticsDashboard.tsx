"use client";

import React, { useState, useEffect } from "react";

// Author: QA Reviewer (ID: MNVT-OP-9944)
// Day 18: REVIEW PRESENTATION 2 — Day 2 + Reports & Analytics Dashboard
// Aesthetic: Navy Blue and Crisp White (70% structural Tailwind CSS / 30% logic ratio)

interface BookingRecord {
  id: string;
  liveMeterAndBilling: number;
  status: "Active" | "Completed" | "Cancelled";
  createdDate: string;
  notes: string;
  customer?: { name: string };
  vehicle?: { make: string; model: string; plateNumber: string; category: string };
}

interface TimeSeriesPoint {
  date: string;
  bookings: number;
  revenue: number;
  hours: number;
}

interface AnalyticsData {
  status_breakdown: {
    Active: number;
    Completed: number;
    Cancelled: number;
  };
  total_bookings: number;
  total_revenue: number;
  total_hours: number;
  time_series: TimeSeriesPoint[];
  bookings: BookingRecord[];
}

type ModeType = "real" | "mock_zero" | "mock_one" | "mock_fifty";

/**
 * @component ReportsAnalyticsDashboard
 * @description Operational dashboard visualization component rendering financial reports,
 * statuses distribution SVG charts, time-series revenue trends, and CSV exporting capability.
 * 
 * @author QA Reviewer (ID: MNVT-OP-9944)
 * @client Manivtha Tours & Travels
 */
export default function ReportsAnalyticsDashboard() {
  /**
   * @type {AnalyticsData|null} data
   * @description Aggregated analytics details fetched from the API or simulated fallbacks.
   */
  const [data, setData] = useState<AnalyticsData | null>(null);

  /**
   * @type {boolean} loading
   * @description Tracks fetch loading state.
   */
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * @type {string|null} errorState
   * @description Stores details of backend fetch failures.
   */
  const [errorState, setErrorState] = useState<string | null>(null);
  
  /**
   * @type {string} fromDate
   * @description From date picker filter parameter.
   */
  const [fromDate, setFromDate] = useState<string>("");

  /**
   * @type {string} toDate
   * @description To date picker filter parameter.
   */
  const [toDate, setToDate] = useState<string>("");
  
  // Simulation Mode Controls for Day 18 Test Cases
  const [activeMode, setActiveMode] = useState<ModeType>("real");
  const [activeTooltip, setActiveTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  // Helper to generate local simulated datasets
  const generateSimulatedData = (mode: "mock_zero" | "mock_one" | "mock_fifty"): AnalyticsData => {
    const today = new Date();
    
    if (mode === "mock_zero") {
      // 30 days of zeroes
      const series: TimeSeriesPoint[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        series.push({
          date: d.toISOString().split("T")[0],
          bookings: 0,
          revenue: 0,
          hours: 0
        });
      }
      return {
        status_breakdown: { Active: 0, Completed: 0, Cancelled: 0 },
        total_bookings: 0,
        total_revenue: 0,
        total_hours: 0,
        time_series: series,
        bookings: []
      };
    }

    if (mode === "mock_one") {
      // Single record
      const dateStr = today.toISOString().split("T")[0];
      const series: TimeSeriesPoint[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const loopDateStr = d.toISOString().split("T")[0];
        series.push({
          date: loopDateStr,
          bookings: loopDateStr === dateStr ? 1 : 0,
          revenue: loopDateStr === dateStr ? 12744 : 0,
          hours: loopDateStr === dateStr ? 6 : 0
        });
      }
      
      const singleBooking: BookingRecord = {
        id: "6f69a2df-ac88-48ad-8730-20586b6bd0a7",
        liveMeterAndBilling: 12744,   // ₹ billing amount (NOT hours)
        status: "Completed",
        createdDate: dateStr,
        notes: "Lead passenger QA Reviewer (ID: MNVT-OP-9944). Airport transport.",
        customer: { name: "Lead Operator" },
        vehicle: { make: "Toyota", model: "Innova Crysta", plateNumber: "AP-09-XX-1234", category: "Luxury SUV" }
      };

      return {
        status_breakdown: { Active: 0, Completed: 1, Cancelled: 0 },
        total_bookings: 1,
        total_revenue: 12744,
        total_hours: 6,
        time_series: series,
        bookings: [singleBooking]
      };
    }

    // mode === "mock_fifty" (Dense 52 bookings across 30 days)
    const series: TimeSeriesPoint[] = [];
    const bookings: BookingRecord[] = [];
    const statusCounts = { Active: 12, Completed: 34, Cancelled: 6 };
    let cumRevenue = 0;
    let cumHours = 0;

    const vehicles = [
      { make: "Toyota", model: "Innova Crysta", plateNumber: "AP-09-XX-1234", category: "Luxury SUV" },
      { make: "BMW", model: "5 Series", plateNumber: "TS-09-YY-9999", category: "Premium Sedan" },
      { make: "Mercedes", model: "V-Class", plateNumber: "KA-03-ZZ-8888", category: "Executive Van" }
    ];

    const customers = ["Lead Operator", "Microsoft India", "Wipro Travels", "Google India", "Infosys Ltd"];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      // Add 1 to 3 bookings per day to aggregate over 50 bookings
      const dailyCount = i % 5 === 0 ? 3 : (i % 2 === 0 ? 2 : 1);
      let dayBookings = 0;
      let dayRevenue = 0;
      let dayHours = 0;

      for (let j = 0; j < dailyCount; j++) {
        const id = `mock-booking-id-${i}-${j}`;
        const hours = 4 + ((i + j) % 6); // 4 to 9 hours
        const vehicle = vehicles[(i + j) % vehicles.length];
        
        // Dynamic simulated price logic — liveMeterAndBilling is the ₹ fare total
        let baseRate = 1800;
        if (vehicle.category.includes("Sedan")) baseRate = 1200;
        if (vehicle.category.includes("Van")) baseRate = 2500;
        const sub = hours * baseRate;
        const gst = Math.round(sub * 0.18 * 100) / 100;
        const total = Math.round(sub + gst);

        const statusIdx = (i + j) % 10;
        const status = statusIdx < 2 ? "Cancelled" : (statusIdx < 5 ? "Active" : "Completed") as any;

        bookings.push({
          id,
          liveMeterAndBilling: total,  // ₹ billing amount (NOT hours)
          status,
          createdDate: dateStr,
          notes: `Simulated trip notes for passenger ${customers[(i + j) % customers.length]}`,
          customer: { name: customers[(i + j) % customers.length] },
          vehicle
        });

        dayBookings++;
        dayHours += hours;
        if (status === "Completed" || status === "Active") {
          dayRevenue += total;
        }
      }

      cumRevenue += dayRevenue;
      cumHours += dayHours;

      series.push({
        date: dateStr,
        bookings: dayBookings,
        revenue: Math.round(dayRevenue),
        hours: dayHours
      });
    }

    return {
      status_breakdown: statusCounts,
      total_bookings: bookings.length,
      total_revenue: Math.round(cumRevenue),
      total_hours: cumHours,
      time_series: series,
      bookings
    };
  };

  useEffect(() => {
    async function loadData() {
      if (activeMode !== "real") {
        setData(generateSimulatedData(activeMode));
        setLoading(false);
        setErrorState(null);
        return;
      }

      // Safeguard: Check if year is within realistic range [2020, 2040]
      if (fromDate) {
        const year = new Date(fromDate).getFullYear();
        if (isNaN(year) || year < 2020 || year > 2040) return;
      }
      if (toDate) {
        const year = new Date(toDate).getFullYear();
        if (isNaN(year) || year < 2020 || year > 2040) return;
      }
      if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
        return;
      }

      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (fromDate) queryParams.append("from", fromDate);
        if (toDate) queryParams.append("to", toDate);

        const response = await fetch(
          `https://chauffeur-service-hourly-booking-system.onrender.com/api/reports/summary?${queryParams.toString()}`
        );

        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }

        const json = await response.json();
        if (json.success && json.data) {
          setData(json.data);
          setErrorState(null);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err: any) {
        console.warn("[ReportsDashboard] API failed, falling back to mock dataset (50+ records).", err);
        setErrorState("Backend API is offline or database is not configured. Displaying fallback dataset.");
        setData(generateSimulatedData("mock_fifty"));
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(loadData, 500);
    return () => clearTimeout(timer);
  }, [fromDate, toDate, activeMode]);

  const handleCSVExport = () => {
    if (!data || data.bookings.length === 0) {
      alert("No data available to export.");
      return;
    }

    /**
     * CSV format compilation.
     * NOTE: liveMeterAndBilling IS the total billing amount in ₹ (not hours).
     * The backend stores the total fare directly in this field.
     */
    const headers = [
      "Booking ID",
      "Customer Name",
      "Vehicle Category",
      "Plate Number",
      "Date",
      "Status",
      "Total Fare (INR incl. GST)"
    ];

    const rows = data.bookings.map((b) => [
      b.id,
      b.customer?.name || "N/A",
      b.vehicle?.category || "N/A",
      b.vehicle?.plateNumber || "N/A",
      b.createdDate,
      b.status,
      b.liveMeterAndBilling   // already the ₹ fare total stored by the backend
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Manivtha_Analytics_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // SVG Chart Computations
  const renderStatusChart = () => {
    if (!data) return null;
    const { Active, Completed, Cancelled } = data.status_breakdown;
    const maxVal = Math.max(Active, Completed, Cancelled, 1);
    
    /**
     * @type {object[]} statuses
     * @property {string} label - The label for the status column
     * @property {number} count - Count of bookings in this status category
     * @property {string} color - The Tailwind fill color for the SVG rect
     * @description Represents the statistics breakdown for chart rendering.
     * @author QA Reviewer (ID: MNVT-OP-9944)
     */
    const statuses = [
      { label: "Completed", count: Completed, color: "fill-accent-blue" },
      { label: "Active", count: Active, color: "fill-accent-cyan" },
      { label: "Cancelled", count: Cancelled, color: "fill-navy-light" }
    ];

    return (
      <svg className="w-full h-64 font-sans" viewBox="0 0 400 240">
        {/* Horizontal grid lines */}
        <line x1="50" y1="40" x2="360" y2="40" className="stroke-crisp-lightgray" strokeDasharray="3" />
        <line x1="50" y1="90" x2="360" y2="90" className="stroke-crisp-lightgray" strokeDasharray="3" />
        <line x1="50" y1="140" x2="360" y2="140" className="stroke-crisp-lightgray" strokeDasharray="3" />
        <line x1="50" y1="190" x2="360" y2="190" className="stroke-crisp-lightgray" />

        {/* Y-axis Labels */}
        <text x="35" y="44" className="text-[10px] fill-navy-slate font-bold text-right" textAnchor="end">{maxVal}</text>
        <text x="35" y="119" className="text-[10px] fill-navy-slate font-bold text-right" textAnchor="end">{Math.round(maxVal / 2)}</text>
        <text x="35" y="194" className="text-[10px] fill-navy-slate font-bold text-right" textAnchor="end">0</text>

        {/* Bars */}
        {statuses.map((s, idx) => {
          const barWidth = 45;
          const x = 85 + idx * 95;
          const barHeight = (s.count / maxVal) * 150;
          const y = 190 - barHeight;

          return (
            <g key={s.label} className="group cursor-pointer">
              {/* Highlight background on hover */}
              <rect
                x={x - 10}
                y="30"
                width={barWidth + 20}
                height="170"
                className="fill-transparent group-hover:fill-crisp-lightgray/20 transition-all duration-300 rounded"
              />
              {/* Actual data bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                className={`${s.color} transition-all duration-500 ease-out`}
                rx="4"
              />
              {/* Value labels */}
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                className="text-xs font-black fill-navy-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                {s.count}
              </text>
              {/* X-axis labels */}
              <text
                x={x + barWidth / 2}
                y="212"
                textAnchor="middle"
                className="text-[11px] fill-navy-slate font-black uppercase tracking-wider"
              >
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderTrendChart = () => {
    if (!data || data.time_series.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-navy-slate font-bold">
          No time series records to display.
        </div>
      );
    }

    const points = data.time_series;
    const maxRev = Math.max(...points.map((p) => p.revenue), 1000);

    const svgWidth = 720;
    const svgHeight = 240;
    const paddingLeft = 60;
    const paddingRight = 20;
    const paddingTop = 30;
    const paddingBottom = 40;

    const chartWidth = svgWidth - paddingLeft - paddingRight;
    const chartHeight = svgHeight - paddingTop - paddingBottom;

    // Build path coordinates
    const coordinates = points.map((p, idx) => {
      const x = points.length === 1
        ? paddingLeft + chartWidth / 2
        : paddingLeft + (idx / (points.length - 1)) * chartWidth;
      const y = (svgHeight - paddingBottom) - (p.revenue / maxRev) * chartHeight;
      return { x, y, point: p };
    });

    let linePath = "";
    let areaPath = "";

    if (coordinates.length > 0) {
      linePath = `M ${coordinates[0].x} ${coordinates[0].y} ` + 
        coordinates.slice(1).map((c) => `L ${c.x} ${c.y}`).join(" ");
        
      areaPath = `${linePath} L ${coordinates[coordinates.length - 1].x} ${svgHeight - paddingBottom} L ${coordinates[0].x} ${svgHeight - paddingBottom} Z`;
    }

    return (
      <div className="relative">
        <svg className="w-full h-64 font-sans" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          <defs>
            <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0077B6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0077B6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingLeft} y1={paddingTop} x2={svgWidth - paddingRight} y2={paddingTop} className="stroke-crisp-lightgray" strokeDasharray="3" />
          <line x1={paddingLeft} y1={paddingTop + chartHeight / 2} x2={svgWidth - paddingRight} y2={paddingTop + chartHeight / 2} className="stroke-crisp-lightgray" strokeDasharray="3" />
          <line x1={paddingLeft} y1={svgHeight - paddingBottom} x2={svgWidth - paddingRight} y2={svgHeight - paddingBottom} className="stroke-crisp-lightgray" />

          {/* Y-Axis Labels */}
          <text x={paddingLeft - 10} y={paddingTop + 4} textAnchor="end" className="text-[10px] fill-navy-slate font-bold">
            ₹{Math.round(maxRev).toLocaleString("en-IN")}
          </text>
          <text x={paddingLeft - 10} y={paddingTop + chartHeight / 2 + 4} textAnchor="end" className="text-[10px] fill-navy-slate font-bold">
            ₹{Math.round(maxRev / 2).toLocaleString("en-IN")}
          </text>
          <text x={paddingLeft - 10} y={svgHeight - paddingBottom + 4} textAnchor="end" className="text-[10px] fill-navy-slate font-bold">
            ₹0
          </text>

          {/* Gradient Area Fill */}
          {areaPath && <path d={areaPath} fill="url(#chart-grad)" />}

          {/* Line Path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#0077B6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Data Nodes */}
          {coordinates.map((c, idx) => {
            // Draw ticks/labels for only a selection of dates to prevent clutter
            const showLabel = idx === 0 || idx === Math.floor(coordinates.length / 2) || idx === coordinates.length - 1;
            
            return (
              <g key={idx}>
                {showLabel && (
                  <text
                    x={c.x}
                    y={svgHeight - 15}
                    textAnchor="middle"
                    className="text-[9px] fill-navy-slate font-black tracking-tighter"
                  >
                    {c.point.date.slice(5)} {/* MM-DD format */}
                  </text>
                )}

                <circle
                  cx={c.x}
                  cy={c.y}
                  r="5"
                  className="fill-crisp-white stroke-accent-blue stroke-2 cursor-pointer hover:r-7 transition-all duration-150"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setActiveTooltip({
                      x: c.x,
                      y: c.y - 15,
                      content: `${c.point.date}: ${c.point.bookings} booking(s), ₹${c.point.revenue.toLocaleString("en-IN")}`
                    });
                  }}
                  onMouseLeave={() => setActiveTooltip(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {activeTooltip && (
          <div
            className="absolute z-10 bg-navy-dark text-crisp-white text-[10px] font-bold px-3 py-1.5 rounded shadow-lg border border-navy-medium pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{ left: `${(activeTooltip.x / svgWidth) * 100}%`, top: `${(activeTooltip.y / svgHeight) * 100}%` }}
          >
            {activeTooltip.content}
          </div>
        )}
      </div>
    );
  };

  const avgDuration = data && data.total_bookings > 0 
    ? (data.total_hours / data.total_bookings).toFixed(1) 
    : "0.0";

  return (
    <div className="bg-crisp-white border border-crisp-lightgray rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 border-b border-crisp-lightgray pb-6">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-3.5 h-6 bg-accent-blue rounded-full" />
            <h2 className="text-2xl font-bold text-navy-dark tracking-tight">Reports & Performance Analytics</h2>
          </div>
          <p className="text-xs text-navy-slate font-medium">
            Authorized QA review console for pricing audit. Supervisor: QA Reviewer (ID: MNVT-OP-9944)
          </p>
        </div>
        
        {/* CSV Export Trigger */}
        <button
          onClick={handleCSVExport}
          className="bg-navy-dark hover:bg-accent-blue text-crisp-white px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          CSV Export
        </button>
      </div>

      {/* Control Filters Panel */}
      <div className="bg-crisp-offwhite border border-crisp-lightgray rounded-xl p-6 mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Date Filter Inputs */}
        <div className="grid grid-cols-2 gap-4 col-span-2">
          <div>
            <label className="block text-[10px] font-black uppercase text-navy-slate tracking-wider mb-2">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-crisp-white border border-crisp-lightgray rounded-lg px-3 py-2 text-xs font-bold text-navy-dark focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-navy-slate tracking-wider mb-2">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-crisp-white border border-crisp-lightgray rounded-lg px-3 py-2 text-xs font-bold text-navy-dark focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
          </div>
        </div>

        {/* Simulation Edge Cases Toggles */}
        <div>
          <label className="block text-[10px] font-black uppercase text-navy-slate tracking-wider mb-2">Simulation Audit Mode</label>
          <select
            value={activeMode}
            onChange={(e) => setActiveMode(e.target.value as ModeType)}
            className="w-full bg-crisp-white border border-crisp-lightgray rounded-lg px-3 py-2 text-xs font-bold text-navy-dark focus:outline-none focus:ring-2 focus:ring-accent-blue cursor-pointer"
          >
            <option value="real">Real Database API</option>
            <option value="mock_zero">Simulated: 0 Records (Empty State)</option>
            <option value="mock_one">Simulated: 1 Record (Minimal State)</option>
            <option value="mock_fifty">Simulated: 50+ Records (Dense State)</option>
          </select>
        </div>
      </div>

      {/* Display Alert warning if DB is offline */}
      {errorState && activeMode === "real" && (
        <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-4 rounded-r-lg mb-8 text-xs font-medium flex items-center justify-between">
          <span>⚠️ {errorState}</span>
          <span className="text-[10px] uppercase font-black tracking-wider bg-amber-200 text-amber-800 px-2.5 py-1 rounded">
            Fallback Active
          </span>
        </div>
      )}

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-accent-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-navy-slate uppercase tracking-wider">Loading report data...</p>
        </div>
      ) : (
        <>
          {/* Summary KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-crisp-offwhite border border-crisp-lightgray rounded-lg p-5">
              <span className="text-[10px] text-navy-slate font-black uppercase tracking-wider block mb-1">Total Bookings</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-navy-dark">{data?.total_bookings}</span>
                <span className="text-[10px] text-emerald-600 font-bold">Live Status</span>
              </div>
            </div>
            <div className="bg-crisp-offwhite border border-crisp-lightgray rounded-lg p-5">
              <span className="text-[10px] text-navy-slate font-black uppercase tracking-wider block mb-1">Gross Revenue</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-navy-dark">
                  ₹{data?.total_revenue.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-accent-cyan font-bold">18% GST Inc.</span>
              </div>
            </div>
            <div className="bg-crisp-offwhite border border-crisp-lightgray rounded-lg p-5">
              <span className="text-[10px] text-navy-slate font-black uppercase tracking-wider block mb-1">Billed Hours</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-navy-dark">{data?.total_hours} hrs</span>
                <span className="text-[10px] text-navy-slate font-bold">Meter Duration</span>
              </div>
            </div>
            <div className="bg-crisp-offwhite border border-crisp-lightgray rounded-lg p-5">
              <span className="text-[10px] text-navy-slate font-black uppercase tracking-wider block mb-1">Average Duration</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-navy-dark">{avgDuration} hrs</span>
                <span className="text-[10px] text-accent-gold font-bold">Per Booking</span>
              </div>
            </div>
          </div>

          {/* Charts Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Status Bar Chart */}
            <div className="lg:col-span-1 border border-crisp-lightgray rounded-lg p-6 bg-crisp-offwhite">
              <h3 className="text-sm font-bold text-navy-dark mb-4 uppercase tracking-wider">
                Booking Status Metrics
              </h3>
              {renderStatusChart()}
            </div>

            {/* Performance Time Series Line Chart */}
            <div className="lg:col-span-2 border border-crisp-lightgray rounded-lg p-6 bg-crisp-offwhite">
              <h3 className="text-sm font-bold text-navy-dark mb-4 uppercase tracking-wider">
                30-Day Revenue Trend (INR)
              </h3>
              {renderTrendChart()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
