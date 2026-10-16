import { Button } from '@nexio/component';
import { notify } from '@nexio/component/ui/notification';
import {
  ViewBody,
  ViewHeader,
  ViewIcon,
  ViewTitle,
  WorkbenchService,
} from '@nexio/core/modules/workbench';
import { WorkspaceService } from '@nexio/core/modules/workspace';
import { useLiveData, useService } from '@toeverything/infra';
import React, { useCallback, useEffect, useState } from 'react';
import { DashboardHeader } from './components/dashboard-header';
import { FileTreeView } from './components/file-tree-view';
import { FindingsList } from './components/findings-list';
import { NewScanModal } from './components/new-scan-modal';
import { ScanHistoryModal } from './components/scan-history-modal';
import { StatsSummary } from './components/stats-summary';
import { analyzeRepositoryFiles } from './engine/analyzer';
import { DEMO_REPOSITORIES } from './engine/demo-repositories';
import { applyPatchToFile, calculateHealthScore } from './engine/patcher';
import type { RepositoryScanSummary, SeverityLevel } from './types';

export const Component = () => {
  const workbench = useService(WorkbenchService).workbench;
  const workspaceService = useService(WorkspaceService);
  const currentWorkspace = workspaceService.workspace;

  const storageKey = `nexio:log-auditor:${currentWorkspace.id}`;
  const historyStorageKey = `nexio:log-auditor:history:${currentWorkspace.id}`;

  // Initialize with saved scan or first rich demo repository
  const [currentScan, setCurrentScan] = useState<RepositoryScanSummary>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load scan from localStorage', e);
    }
    const demo = DEMO_REPOSITORIES[0];
    return analyzeRepositoryFiles(demo.name, 'demo-template', demo.files);
  });

  const [scanHistory, setScanHistory] = useState<RepositoryScanSummary[]>(() => {
    try {
      const stored = localStorage.getItem(historyStorageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load history from localStorage', e);
    }
    return [];
  });

  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | 'all'>('all');
  const [selectedFileFilter, setSelectedFileFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'findings' | 'explorer'>('findings');
  const [newScanModalOpen, setNewScanModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(currentScan));
    } catch (e) {
      console.error('Failed to persist scan', e);
    }
  }, [storageKey, currentScan]);

  useEffect(() => {
    try {
      localStorage.setItem(historyStorageKey, JSON.stringify(scanHistory));
    } catch (e) {
      console.error('Failed to persist scan history', e);
    }
  }, [historyStorageKey, scanHistory]);

  const handleScanCompleted = useCallback((summary: RepositoryScanSummary) => {
    setCurrentScan(summary);
    setScanHistory(prev => [summary, ...prev.filter(s => s.id !== summary.id).slice(0, 15)]);
    setSelectedFileFilter(null);
    setSelectedSeverity('all');
  }, []);

  // Patch Actions
  const handleAcceptPatch = useCallback((findingId: string) => {
    setCurrentScan(prev => {
      const target = prev.findings.find(f => f.id === findingId);
      if (!target) return prev;

      // Apply patch to the file content
      const updatedFiles = prev.files.map(file => {
        if (file.path === target.filePath) {
          const patched = applyPatchToFile(file.content, target);
          return {
            ...file,
            content: patched,
            gapsCount: Math.max(0, file.gapsCount - 1),
          };
        }
        return file;
      });

      const updatedFindings = prev.findings.map(f =>
        f.id === findingId ? { ...f, patchStatus: 'accepted' as const } : f
      );

      const newHealthScore = calculateHealthScore(updatedFindings);

      notify({
        title: 'Patch Accepted & Applied',
        message: `Applied structured telemetry patch to ${target.filePath}:${target.lineNumber}. Health score rose to ${newHealthScore}%.`,
      });

      return {
        ...prev,
        files: updatedFiles,
        findings: updatedFindings,
        currentHealthScore: newHealthScore,
      };
    });
  }, []);

  const handleRejectPatch = useCallback((findingId: string) => {
    setCurrentScan(prev => {
      const updatedFindings = prev.findings.map(f =>
        f.id === findingId ? { ...f, patchStatus: 'rejected' as const } : f
      );
      return {
        ...prev,
        findings: updatedFindings,
      };
    });
  }, []);

  const handleResetPatch = useCallback((findingId: string) => {
    setCurrentScan(prev => {
      const updatedFindings = prev.findings.map(f =>
        f.id === findingId ? { ...f, patchStatus: 'pending' as const } : f
      );
      const newScore = calculateHealthScore(updatedFindings);
      return {
        ...prev,
        findings: updatedFindings,
        currentHealthScore: newScore,
      };
    });
  }, []);

  // Batch Accept all critical findings
  const handleBatchAcceptCritical = useCallback(() => {
    setCurrentScan(prev => {
      let updatedFiles = [...prev.files];
      const criticalGaps = prev.findings.filter(f => f.severity === 'critical' && f.patchStatus === 'pending');

      if (criticalGaps.length === 0) return prev;

      for (const gap of criticalGaps) {
        updatedFiles = updatedFiles.map(file => {
          if (file.path === gap.filePath) {
            return {
              ...file,
              content: applyPatchToFile(file.content, gap),
              gapsCount: Math.max(0, file.gapsCount - 1),
            };
          }
          return file;
        });
      }

      const updatedFindings = prev.findings.map(f =>
        f.severity === 'critical' ? { ...f, patchStatus: 'accepted' as const } : f
      );

      const newScore = calculateHealthScore(updatedFindings);

      notify({
        title: 'Batch Patches Applied',
        message: `Successfully resolved ${criticalGaps.length} critical logging gaps. Health score improved to ${newScore}%.`,
      });

      return {
        ...prev,
        files: updatedFiles,
        findings: updatedFindings,
        currentHealthScore: newScore,
      };
    });
  }, []);

  // Export patched files as Git unified diff or source file
  const handleExportPatchedRepo = useCallback(() => {
    const acceptedGaps = currentScan.findings.filter(f => f.patchStatus === 'accepted');
    if (acceptedGaps.length === 0) {
      notify({
        title: 'No Patches Applied Yet',
        message: 'Accept one or more suggested patches to generate an exportable patch bundle.',
      });
      return;
    }

    const unifiedDiffText = acceptedGaps.map(g => g.suggestedPatch.unifiedDiff).join('\n\n');
    const blob = new Blob([unifiedDiffText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentScan.repositoryName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-logging-patches.diff`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    notify({
      title: 'Patch Bundle Exported',
      message: `Exported ${acceptedGaps.length} logging patches as a Git-compatible .diff file.`,
    });
  }, [currentScan]);

  const acceptedCount = currentScan.findings.filter(f => f.patchStatus === 'accepted').length;

  return (
    <>
      <ViewHeader>
        <ViewIcon>
          <span style={{ fontSize: '18px' }}>🛡️</span>
        </ViewIcon>
        <ViewTitle>AI Logging Sentinel</ViewTitle>
      </ViewHeader>

      <ViewBody>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            backgroundColor: 'var(--affine-background-primary-color)',
            color: 'var(--affine-text-primary-color)',
            overflowY: 'auto',
          }}
        >
          {/* Header */}
          <DashboardHeader
            scan={currentScan}
            onOpenNewScan={() => setNewScanModalOpen(true)}
            onOpenHistory={() => setHistoryModalOpen(true)}
            onBatchAcceptCritical={handleBatchAcceptCritical}
            onExportPatchedRepo={handleExportPatchedRepo}
            acceptedCount={acceptedCount}
          />

          {/* Stats Bar */}
          <StatsSummary
            scan={currentScan}
            selectedSeverity={selectedSeverity}
            onSelectSeverity={setSelectedSeverity}
            acceptedCount={acceptedCount}
          />

          {/* Main View Mode Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '24px 32px 12px' }}>
            <button
              onClick={() => setViewMode('findings')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: viewMode === 'findings' ? 'var(--affine-background-secondary-color)' : 'transparent',
                fontWeight: viewMode === 'findings' ? 700 : 500,
                color: viewMode === 'findings' ? '#2563eb' : 'var(--affine-text-secondary-color)',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              📋 All Findings ({currentScan.findings.length})
            </button>

            <button
              onClick={() => setViewMode('explorer')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: viewMode === 'explorer' ? 'var(--affine-background-secondary-color)' : 'transparent',
                fontWeight: viewMode === 'explorer' ? 700 : 500,
                color: viewMode === 'explorer' ? '#2563eb' : 'var(--affine-text-secondary-color)',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              📁 File Explorer ({currentScan.files.length})
            </button>
          </div>

          {/* Content Body */}
          {viewMode === 'explorer' ? (
            <div style={{ padding: '0 32px 48px', display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
              <FileTreeView
                files={currentScan.files}
                selectedFile={selectedFileFilter}
                onSelectFile={path => {
                  setSelectedFileFilter(path);
                  setViewMode('findings');
                }}
              />
              <div style={{ padding: '24px', backgroundColor: 'var(--affine-background-secondary-color)', borderRadius: '12px', border: '1px solid var(--affine-border-color)' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '15px' }}>File-Level Logging Health</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--affine-text-secondary-color)' }}>
                  Select any file on the left to filter and review its specific logging gaps and code patches.
                </p>
              </div>
            </div>
          ) : (
            <FindingsList
              findings={currentScan.findings}
              selectedSeverity={selectedSeverity}
              onSelectSeverity={setSelectedSeverity}
              onAcceptPatch={handleAcceptPatch}
              onRejectPatch={handleRejectPatch}
              onResetPatch={handleResetPatch}
              selectedFileFilter={selectedFileFilter}
              onClearFileFilter={() => setSelectedFileFilter(null)}
            />
          )}

          {/* Modals */}
          <NewScanModal
            isOpen={newScanModalOpen}
            onClose={() => setNewScanModalOpen(false)}
            onScanCompleted={handleScanCompleted}
          />

          <ScanHistoryModal
            isOpen={historyModalOpen}
            onClose={() => setHistoryModalOpen(false)}
            history={scanHistory}
            onSelectScan={setCurrentScan}
            onClearHistory={() => setScanHistory([])}
          />
        </div>
      </ViewBody>
    </>
  );
};
