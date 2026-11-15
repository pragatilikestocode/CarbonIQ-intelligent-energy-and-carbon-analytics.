import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  BarChart3,
  FileText,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  Info,
  Cpu,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { apiService, API_BASE, PdfReport, ReportsResponse } from '../../services/apiService';

function formatSize(kb: number): string {
  if (kb >= 1024) return (kb / 1024).toFixed(1) + ' MB';
  return kb.toFixed(1) + ' KB';
}

export const SasViyaStudio: React.FC = () => {
  const [reports, setReports] = useState<PdfReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<PdfReport | null>(null);
  const [pdfError, setPdfError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  // ---- Load the report list from the backend ------------------------------
  useEffect(() => {
    let mounted = true;
    apiService
      .reports()
      .then((res: ReportsResponse) => {
        if (!mounted) return;
        setReports(res.reports);
        if (res.reports.length > 0) {
          setSelectedReport(res.reports[0]);
        }
      })
      .catch((e: Error) => {
        if (mounted) setError(e.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // ---- Fullscreen change listener -----------------------------------------
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ---- Fullscreen toggle --------------------------------------------------
  const handleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (viewerRef.current) {
      viewerRef.current.requestFullscreen();
    }
  }, []);

  // ---- Report navigation --------------------------------------------------
  const currentIndex = selectedReport ? reports.findIndex((r) => r.id === selectedReport.id) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < reports.length - 1;

  const handlePrev = useCallback(() => {
    if (!hasPrev) return;
    setSelectedReport(reports[currentIndex - 1]);
    setPdfError(false);
  }, [hasPrev, reports, currentIndex]);

  const handleNext = useCallback(() => {
    if (!hasNext) return;
    setSelectedReport(reports[currentIndex + 1]);
    setPdfError(false);
  }, [hasNext, reports, currentIndex]);

  // ---- Build URLs ----------------------------------------------------------
  // iframeSrc: relative path → goes through the Vite proxy → same-origin in
  //   the browser → no cross-origin iframe restrictions, no X-Frame-Options block.
  // pdfUrl: absolute backend URL → used for download <a> and open-in-new-tab.
  const iframeSrc = selectedReport ? selectedReport.url : '';   // "/api/reports/file/…"
  const pdfUrl    = selectedReport ? `${API_BASE}${selectedReport.url}` : '';

  // ---- Render -------------------------------------------------------------
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-cyber-cyan/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                SAS Visual Analytics Reports
              </span>
              {reports.length > 0 && (
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {reports.length} {reports.length === 1 ? 'Report' : 'Reports'} Available
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">SAS Visual Analytics Reports</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              PDF reports exported from SAS Visual Analytics by the CarbonIQ team.
              Browse, view, download, and navigate between reports — no SAS server connection required.
            </p>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="glass-panel rounded-2xl border border-cyber-cyan/30 p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
          <Loader2 className="w-10 h-10 text-cyber-cyan animate-spin mb-4" />
          <p className="font-mono text-sm text-slate-400">Loading report list from backend…</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="glass-panel rounded-2xl border border-red-500/30 p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-white font-mono mb-2">Could not load reports</h3>
          <p className="text-sm text-slate-400 font-mono mb-1">{error}</p>
          <p className="text-xs text-slate-500 font-mono mt-2">
            Start the backend:{' '}
            <code className="text-cyan-300">python -m uvicorn backend.main:app --port 8000</code>
          </p>
        </div>
      )}

      {/* Empty state — no PDFs found */}
      {!loading && !error && reports.length === 0 && (
        <div className="glass-panel rounded-2xl border border-amber-500/30 p-8 min-h-[500px] flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4">
            <FileText className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-white font-mono mb-2">No PDF reports found</h3>
          <p className="text-sm text-slate-400 font-mono max-w-md mb-4">
            No PDF files were found in the reports directory. Add exported SAS Visual Analytics
            PDF reports to the following folder:
          </p>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 break-all">
            visualizations/
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-4 max-w-md">
            Once PDF files are placed in this directory, they will automatically appear here
            when the backend is running. The backend scans the directory and lists all{' '}
            <code className="text-slate-300">.pdf</code> files.
          </p>
        </div>
      )}

      {/* Reports library — list + viewer */}
      {!loading && !error && reports.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Report list sidebar */}
          <div className="space-y-3">
            <div className="glass-panel rounded-2xl p-4 border border-slate-800">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyber-cyan" />
                Reports ({reports.length})
              </h3>
              <div className="space-y-2 max-h-[700px] overflow-y-auto scrollbar-thin pr-1">
                {reports.map((report, idx) => {
                  const isActive = selectedReport?.id === report.id;
                  return (
                    <button
                      key={report.id}
                      onClick={() => {
                        setSelectedReport(report);
                        setPdfError(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 ${
                        isActive
                          ? 'bg-cyber-cyan/15 border-cyber-cyan/50 shadow-glow-cyan'
                          : 'bg-slate-950/60 border-slate-800 hover:border-cyber-cyan/40 hover:bg-slate-900'
                      }`}
                    >
                      <div className={`flex-shrink-0 mt-0.5 ${isActive ? 'text-cyber-cyan' : 'text-slate-500'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                          {report.title}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                          {report.filename}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-slate-600">{formatSize(report.size_kb)}</span>
                          {idx === 0 && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              Latest
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PDF viewer area */}
          <div className="space-y-3">
            {selectedReport ? (
              <>
                {/* Viewer toolbar */}
                <div className="glass-panel rounded-2xl p-3 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  {/* Title + description */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-white truncate">{selectedReport.title}</h3>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{selectedReport.description}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Prev / Next navigation */}
                    <div className="flex items-center gap-1 mr-1">
                      <button
                        onClick={handlePrev}
                        disabled={!hasPrev}
                        title="Previous report"
                        className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyber-cyan/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-[11px] font-mono text-slate-500 px-1">
                        {currentIndex + 1}/{reports.length}
                      </span>
                      <button
                        onClick={handleNext}
                        disabled={!hasNext}
                        title="Next report"
                        className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyber-cyan/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="w-px h-6 bg-slate-700" />

                    {/* Fullscreen */}
                    <button
                      onClick={handleFullscreen}
                      title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyber-cyan/50 transition"
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>

                    {/* Open in new tab */}
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open in new tab"
                      className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyber-cyan/50 transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    {/* Download */}
                    <a
                      href={pdfUrl}
                      download={selectedReport.filename}
                      title="Download PDF"
                      className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyber-cyan/50 transition"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* PDF viewer */}
                <div
                  ref={viewerRef}
                  className="glass-panel rounded-2xl border border-cyber-cyan/30 overflow-hidden bg-slate-950"
                  style={{ minHeight: '750px' }}
                >
                  {pdfError ? (
                    <div className="min-h-[750px] flex flex-col items-center justify-center text-center p-8">
                      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
                        <AlertTriangle className="w-10 h-10" />
                      </div>
                      <h3 className="text-lg font-bold text-white font-mono mb-2">Failed to load PDF</h3>
                      <p className="text-sm text-slate-400 font-mono mb-4">
                        The file <code className="text-cyan-300">{selectedReport.filename}</code> could not be opened.
                      </p>
                      <div className="flex items-center gap-3">
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-semibold transition hover:bg-slate-800"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open in new tab</span>
                        </a>
                        <a
                          href={pdfUrl}
                          download={selectedReport.filename}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs font-mono transition hover:opacity-95"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      key={selectedReport.id}
                      src={iframeSrc}
                      title={selectedReport.title}
                      className="w-full"
                      style={{ minHeight: '750px', height: isFullscreen ? '100vh' : '750px', border: 'none', display: 'block' }}
                      onError={() => setPdfError(true)}
                    />
                  )}
                </div>

                {/* Fullscreen exit hint */}
                {isFullscreen && (
                  <div className="fixed top-4 right-4 z-50 glass-panel rounded-xl p-2 border border-cyber-cyan/40">
                    <button
                      onClick={handleFullscreen}
                      className="p-2 text-cyan-300 hover:text-white transition"
                      title="Exit fullscreen"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="glass-panel rounded-2xl border border-slate-800 p-8 min-h-[750px] flex flex-col items-center justify-center text-center">
                <FileText className="w-12 h-12 text-slate-600 mb-4" />
                <p className="text-sm text-slate-400 font-mono">Select a report from the list to view it.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-start gap-3">
        <Cpu className="w-4 h-4 text-cyber-cyan flex-shrink-0 mt-0.5" />
        <div className="text-[11px] text-slate-500 font-mono leading-relaxed">
          <span className="text-slate-400 font-semibold">Report source:</span>{' '}
          PDF files exported from SAS Visual Analytics, stored in{' '}
          <code className="text-cyan-300">visualizations/</code>.
          The backend scans this directory and serves the file list via{' '}
          <code className="text-cyan-300">/api/reports</code> and individual PDFs via{' '}
          <code className="text-cyan-300">/api/reports/file/</code>. Original files are not moved or modified.
        </div>
      </div>
    </div>
  );
};
