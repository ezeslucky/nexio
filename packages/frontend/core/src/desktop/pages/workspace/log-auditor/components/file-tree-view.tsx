import React from 'react';
import type { RepositoryFile } from '../types';

interface FileTreeViewProps {
  files: RepositoryFile[];
  selectedFile: string | null;
  onSelectFile: (filePath: string) => void;
}

export const FileTreeView: React.FC<FileTreeViewProps> = ({
  files,
  selectedFile,
  onSelectFile,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: 'var(--affine-background-primary-color)',
        border: '1px solid var(--affine-border-color)',
      }}
    >
      <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--affine-text-secondary-color)', marginBottom: '4px' }}>
        Repository Files ({files.length})
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '360px', overflowY: 'auto' }}>
        {files.map(file => {
          const isSelected = selectedFile === file.path;
          return (
            <div
              key={file.id}
              onClick={() => onSelectFile(file.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'var(--affine-background-secondary-color)',
                border: isSelected ? '1px solid #3b82f6' : '1px solid transparent',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.1s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <span>📄</span>
                <span style={{ fontWeight: isSelected ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.path}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', color: 'var(--affine-text-secondary-color)' }}>
                  {file.lineCount} lines
                </span>
                {file.gapsCount > 0 && (
                  <span
                    style={{
                      padding: '1px 6px',
                      borderRadius: '10px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 700,
                    }}
                  >
                    {file.gapsCount} gaps
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
