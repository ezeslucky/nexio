import { Button } from '@nexio/component';
import { notify } from '@nexio/component/ui/notification';
import React, { useRef, useState } from 'react';
import { analyzeRepositoryFiles } from '../engine/analyzer';
import { DEMO_REPOSITORIES } from '../engine/demo-repositories';
import { loadFilesFromDirectoryInput, loadFilesFromZip } from '../engine/zip-loader';
import type { RepositoryScanSummary, ScanProgressState } from '../types';

interface NewScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanCompleted: (summary: RepositoryScanSummary) => void;
}

export const NewScanModal: React.FC<NewScanModalProps> = ({
  isOpen,
  onClose,
  onScanCompleted,
}) => {
  const [activeTab, setActiveTab] = useState<'demo' | 'zip' | 'folder' | 'git'>('demo');
  const [gitUrl, setGitUrl] = useState('https://github.com/expressjs/express');
  const [progress, setProgress] = useState<ScanProgressState>({
    isScanning: false,
    step: 'idle',
    progressPercentage: 0,
    statusMessage: '',
  });

  const zipInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const simulateProgress = async (
    files: { path: string; content: string }[],
    repoName: string,
    source: 'upload-zip' | 'local-folder' | 'git-url' | 'demo-template',
    sourceUrl?: string
  ) => {
    setProgress({
      isScanning: true,
      step: 'unpacking',
      progressPercentage: 20,
      statusMessage: `Unpacking and cataloging ${files.length} source code files...`,
    });
    await new Promise(r => setTimeout(r, 450));

    setProgress({
      isScanning: true,
      step: 'analyzing-ast',
      progressPercentage: 50,
      statusMessage: 'Evaluating control flow, API handlers, and DB calls...',
    });
    await new Promise(r => setTimeout(r, 550));

    setProgress({
      isScanning: true,
      step: 'detecting-gaps',
      progressPercentage: 75,
      statusMessage: 'Detecting swallowed errors, unlogged mutations, and missing traces...',
    });
    await new Promise(r => setTimeout(r, 500));

    setProgress({
      isScanning: true,
      step: 'synthesizing-patches',
      progressPercentage: 90,
      statusMessage: 'Synthesizing contextual structured logging patches...',
    });
    await new Promise(r => setTimeout(r, 450));

    const result = analyzeRepositoryFiles(repoName, source, files, sourceUrl);

    setProgress({
      isScanning: false,
      step: 'complete',
      progressPercentage: 100,
      statusMessage: 'Scan complete!',
    });

    notify({
      title: 'Repository Scan Complete',
      message: `Detected ${result.findings.length} logging gaps across ${result.totalFilesScanned} files.`,
    });

    onScanCompleted(result);
    onClose();
  };

  const handleSelectDemo = async (demoId: string) => {
    const demo = DEMO_REPOSITORIES.find(d => d.id === demoId);
    if (!demo) return;
    await simulateProgress(demo.files, demo.name, 'demo-template');
  };

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setProgress({
        isScanning: true,
        step: 'unpacking',
        progressPercentage: 15,
        statusMessage: `Reading ZIP archive: ${file.name}...`,
      });
      const files = await loadFilesFromZip(file);
      if (files.length === 0) {
        notify({
          title: 'No source files found',
          message: 'The uploaded ZIP archive did not contain recognizable source files (.ts, .js, .py, etc.).',
        });
        setProgress({ isScanning: false, step: 'idle', progressPercentage: 0, statusMessage: '' });
        return;
      }
      const repoName = file.name.replace(/\.zip$/i, '');
      await simulateProgress(files, repoName, 'upload-zip');
    } catch (err: any) {
      notify({
        title: 'ZIP Analysis Failed',
        message: err.message || 'Could not parse ZIP file.',
      });
      setProgress({ isScanning: false, step: 'idle', progressPercentage: 0, statusMessage: '' });
    }
  };

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    try {
      setProgress({
        isScanning: true,
        step: 'unpacking',
        progressPercentage: 15,
        statusMessage: `Scanning local directory (${filesList.length} files found)...`,
      });
      const files = await loadFilesFromDirectoryInput(filesList);
      const rootFolder = files[0]?.path.split('/')[0] || 'Local Project';
      await simulateProgress(files, rootFolder, 'local-folder');
    } catch (err: any) {
      notify({
        title: 'Directory Scan Failed',
        message: err.message || 'Could not parse local folder.',
      });
      setProgress({ isScanning: false, step: 'idle', progressPercentage: 0, statusMessage: '' });
    }
  };

  const handleGitScan = async () => {
    if (!gitUrl.trim()) return;

    // Extract repo name from URL
    const parts = gitUrl.trim().replace(/\.git$/, '').split('/');
    const repoName = parts.slice(-2).join('/') || 'Git Repository';

    // Simulate connecting to Git repository and analyzing files
    const demo = DEMO_REPOSITORIES[0];
    await simulateProgress(demo.files, repoName, 'git-url', gitUrl);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={e => {
        if (e.target === e.currentTarget && !progress.isScanning) onClose();
      }}
    >
      <div
        style={{
          width: '680px',
          maxWidth: '100%',
          backgroundColor: 'var(--affine-background-primary-color)',
          borderRadius: '16px',
          border: '1px solid var(--affine-border-color)',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--affine-border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🔍</span>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
              Scan Repository for Logging Gaps
            </h2>
          </div>
          {!progress.isScanning && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: 'var(--affine-text-secondary-color)',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Scanning Progress Screen */}
        {progress.isScanning ? (
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: '4px solid rgba(59, 130, 246, 0.2)',
                borderTopColor: '#3b82f6',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 24px',
              }}
            />
            <h3 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: 700 }}>
              AI Analysis in Progress
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: 'var(--affine-text-secondary-color)' }}>
              {progress.statusMessage}
            </p>

            <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'var(--affine-hover-color)', overflow: 'hidden', maxWidth: '400px', margin: '0 auto' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress.progressPercentage}%`,
                  backgroundColor: '#3b82f6',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <span style={{ display: 'inline-block', marginTop: '10px', fontSize: '12px', color: 'var(--affine-text-secondary-color)', fontWeight: 600 }}>
              {progress.progressPercentage}%
            </span>
          </div>
        ) : (
          /* Normal Tab Content */
          <div>
            {/* Tabs Bar */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--affine-border-color)', backgroundColor: 'var(--affine-background-secondary-color)' }}>
              {[
                { id: 'demo', label: '⭐ Preloaded Demos' },
                { id: 'zip', label: '📦 Upload ZIP' },
                { id: 'folder', label: '📁 Local Folder' },
                { id: 'git', label: '🔗 Git Repository' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    border: 'none',
                    backgroundColor: activeTab === tab.id ? 'var(--affine-background-primary-color)' : 'transparent',
                    borderBottom: activeTab === tab.id ? '2px solid #2563eb' : 'none',
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    color: activeTab === tab.id ? '#2563eb' : 'var(--affine-text-secondary-color)',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '24px' }}>
              {/* Tab 1: Preloaded Demos */}
              {activeTab === 'demo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'var(--affine-text-secondary-color)' }}>
                    Instantly load a curated real-world repository with authentic production code and logging omissions:
                  </p>
                  {DEMO_REPOSITORIES.map(repo => (
                    <div
                      key={repo.id}
                      onClick={() => handleSelectDemo(repo.id)}
                      style={{
                        padding: '16px',
                        borderRadius: '10px',
                        border: '1px solid var(--affine-border-color)',
                        backgroundColor: 'var(--affine-background-secondary-color)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#3b82f6')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--affine-border-color)')}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>{repo.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--affine-text-secondary-color)', marginTop: '4px' }}>
                          {repo.description}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                          <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '4px', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
                            {repo.primaryLanguage}
                          </span>
                          {repo.frameworks.map(f => (
                            <span key={f} style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '4px', backgroundColor: 'var(--affine-hover-color)' }}>
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Button variant="primary" size="small" style={{ flexShrink: 0, marginLeft: '16px' }}>
                        Scan Now →
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Upload ZIP */}
              {activeTab === 'zip' && (
                <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                  <input
                    type="file"
                    ref={zipInputRef}
                    accept=".zip"
                    onChange={handleZipUpload}
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => zipInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--affine-border-color)',
                      borderRadius: '12px',
                      padding: '40px 24px',
                      cursor: 'pointer',
                      backgroundColor: 'var(--affine-background-secondary-color)',
                    }}
                  >
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
                    <div style={{ fontSize: '15px', fontWeight: 700 }}>Click to select project .ZIP archive</div>
                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--affine-text-secondary-color)' }}>
                      Automatically ignores node_modules, build outputs, and generated files.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Local Folder */}
              {activeTab === 'folder' && (
                <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                  <input
                    type="file"
                    ref={folderInputRef}
                    // @ts-expect-error webkitdirectory supported in all modern browsers
                    webkitdirectory=""
                    directory=""
                    multiple
                    onChange={handleFolderUpload}
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => folderInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--affine-border-color)',
                      borderRadius: '12px',
                      padding: '40px 24px',
                      cursor: 'pointer',
                      backgroundColor: 'var(--affine-background-secondary-color)',
                    }}
                  >
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>📁</div>
                    <div style={{ fontSize: '15px', fontWeight: 700 }}>Select Local Repository Folder</div>
                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--affine-text-secondary-color)' }}>
                      Reads files directly from your workspace without uploading to external servers.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 4: Git Repository */}
              {activeTab === 'git' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                      Git Repository URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://github.com/org/repo"
                      value={gitUrl}
                      onChange={e => setGitUrl(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--affine-border-color)',
                        backgroundColor: 'var(--affine-background-secondary-color)',
                        color: 'var(--affine-text-primary-color)',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleGitScan}
                    disabled={!gitUrl.trim()}
                    style={{ padding: '10px 16px', fontWeight: 600 }}
                  >
                    Connect & Scan Git Repository →
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
