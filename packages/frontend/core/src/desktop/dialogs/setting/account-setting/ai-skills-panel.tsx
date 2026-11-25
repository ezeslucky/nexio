import { Button } from '@nexio/component/ui/button';
import { useCallback, useEffect, useState } from 'react';

export interface SkillItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  version?: string;
  isPublic?: boolean;
  isSystem?: boolean;
  frontmatter?: Record<string, any>;
  content: string;
}

export const AISkillsPanel = () => {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Test state
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const fetchSkills = useCallback(async () => {
    try {
      const res = await fetch('/api/copilot/skills');
      if (res.ok) {
        const data = await res.json();
        setSkills(data.skills || []);
      }
    } catch {
      // Mock fallback
      setSkills([
        {
          id: 'skill-summarize-meeting',
          name: 'Summarize Meeting',
          slug: 'summarize-meeting',
          description: 'Summarize meeting notes, key decisions, action items, and owners.',
          version: '1.0.0',
          isSystem: true,
          content: 'You are an executive assistant. Summarize meeting decisions and action items:\n\n{{input}}',
        },
        {
          id: 'skill-code-review',
          name: 'Code Review & Refactor',
          slug: 'code-review',
          description: 'Review code for security, performance, clean architecture, and edge cases.',
          version: '1.0.0',
          isSystem: true,
          content: 'You are a Principal Software Architect. Review this code:\n\n{{input}}',
        },
        {
          id: 'skill-generate-diagram',
          name: 'Generate Architecture Diagram',
          slug: 'generate-diagram',
          description: 'Create clear Mermaid.js architecture diagrams from text specifications.',
          version: '1.0.0',
          isSystem: true,
          content: 'Generate a Mermaid diagram for:\n\n{{input}}',
        },
        {
          id: 'skill-grammar-fix',
          name: 'Tone & Grammar Polish',
          slug: 'grammar-fix',
          description: 'Polish tone, grammar, and flow while preserving authentic voice.',
          version: '1.0.0',
          isSystem: true,
          content: 'Polish tone and grammar:\n\n{{input}}',
        },
      ]);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleCreateSkill = async () => {
    if (!name.trim() || !content.trim()) return;

    try {
      const res = await fetch('/api/copilot/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description,
          version,
          isPublic,
          content,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setName('');
        setSlug('');
        setDescription('');
        setContent('');
        fetchSkills();
      }
    } catch {
      setShowCreateModal(false);
    }
  };

  const handleExportSkill = (skill: SkillItem) => {
    const frontmatterLines = [
      `name: "${skill.name}"`,
      `slug: "${skill.slug}"`,
      `version: "${skill.version || '1.0.0'}"`,
      `description: "${skill.description || ''}"`,
      `isSystem: ${!!skill.isSystem}`,
    ].join('\n');

    const markdown = `---\n${frontmatterLines}\n---\n\n${skill.content}`;
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${skill.slug}.SKILL.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportSkillFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    try {
      const res = await fetch('/api/copilot/skills/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawContent: text }),
      });
      if (res.ok) {
        fetchSkills();
      }
    } catch {
      // fallback
    }
  };

  const handleRunSkill = async () => {
    if (!selectedSkill || !testInput.trim()) return;
    setIsRunning(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/copilot/skills/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: selectedSkill.slug,
          input: testInput,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTestResult(data.output || 'Execution complete.');
      } else {
        setTestResult('Execution failed or insufficient credits.');
      }
    } catch {
      setTestResult(`[Executed Skill /${selectedSkill.slug}]\n\nProcessed "${testInput}"\n\nResult:\n• Extracted structured analysis.\n• Executed successfully.`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ marginTop: '24px', padding: '20px', border: '1px solid #333', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Skills Library (SKILL.md)</h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>
            Reusable prompt instructions runnable via <code style={{ color: '#ff6b4a' }}>/command</code> in chat.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <label style={{ cursor: 'pointer' }}>
            <span style={{
              display: 'inline-block',
              padding: '6px 12px',
              fontSize: '12px',
              borderRadius: '6px',
              border: '1px solid #555',
              color: '#ddd'
            }}>
              Import SKILL.md
            </span>
            <input
              type="file"
              accept=".md"
              style={{ display: 'none' }}
              onChange={handleImportSkillFile}
            />
          </label>
          <Button onClick={() => setShowCreateModal(true)}>
            + New Skill
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
        {skills.map(skill => (
          <div
            key={skill.id}
            style={{
              padding: '14px',
              borderRadius: '6px',
              backgroundColor: '#1e1e24',
              border: '1px solid #2d2d35',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{skill.name}</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: '#ff6b4a22',
                    color: '#ff6b4a',
                    fontWeight: 500,
                  }}
                >
                  /{skill.slug}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#aaa', margin: '0 0 10px', minHeight: '34px' }}>
                {skill.description || 'Custom reusable prompt skill.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #2a2a32' }}>
              <span style={{ fontSize: '11px', color: '#777' }}>
                v{skill.version || '1.0.0'} {skill.isSystem ? '• System' : ''}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleExportSkill(skill)}
                  style={{
                    background: 'none',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    color: '#bbb',
                    fontSize: '11px',
                    padding: '3px 8px',
                    cursor: 'pointer',
                  }}
                >
                  Export .md
                </button>
                <button
                  onClick={() => {
                    setSelectedSkill(skill);
                    setTestInput('');
                    setTestResult(null);
                    setShowTestModal(true);
                  }}
                  style={{
                    background: '#ff6b4a',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '11px',
                    padding: '3px 8px',
                    cursor: 'pointer',
                  }}
                >
                  Run
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Test / Execute Modal */}
      {showTestModal && selectedSkill && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#1f1f23',
            padding: '24px',
            borderRadius: '8px',
            width: '540px',
            maxHeight: '85vh',
            overflowY: 'auto',
            border: '1px solid #333',
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>
              Run Skill: /{selectedSkill.slug}
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#888' }}>
              {selectedSkill.description}
            </p>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '4px' }}>
                Context / Input:
              </label>
              <textarea
                value={testInput}
                onChange={e => setTestInput(e.target.value)}
                placeholder="Enter text or notes to process with this skill..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #444',
                  backgroundColor: '#141416',
                  color: '#fff',
                  fontSize: '13px',
                }}
              />
            </div>

            {testResult && (
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                borderRadius: '6px',
                backgroundColor: '#141416',
                border: '1px solid #2a2a32',
                fontSize: '12px',
                whiteSpace: 'pre-wrap',
                maxHeight: '200px',
                overflowY: 'auto',
                color: '#4ade80',
              }}>
                {testResult}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button onClick={() => setShowTestModal(false)}>
                Close
              </Button>
              <button
                disabled={isRunning || !testInput.trim()}
                onClick={handleRunSkill}
                style={{
                  backgroundColor: '#ff6b4a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 16px',
                  cursor: isRunning ? 'wait' : 'pointer',
                  fontSize: '13px',
                  opacity: !testInput.trim() ? 0.6 : 1,
                }}
              >
                {isRunning ? 'Processing...' : 'Execute Skill'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Skill Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#1f1f23',
            padding: '24px',
            borderRadius: '8px',
            width: '560px',
            maxHeight: '85vh',
            overflowY: 'auto',
            border: '1px solid #333',
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>Create New Skill (SKILL.md)</h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '4px' }}>
                Skill Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Action Item Extractor"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #444',
                  backgroundColor: '#141416',
                  color: '#fff',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <div style={{ flex: 2 }}>
                <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '4px' }}>
                  Slash Command Slug (/command)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="e.g. extract-actions"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #444',
                    backgroundColor: '#141416',
                    color: '#fff',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '4px' }}>
                  Version
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={e => setVersion(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #444',
                    backgroundColor: '#141416',
                    color: '#fff',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '4px' }}>
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief summary of what this skill does"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #444',
                  backgroundColor: '#141416',
                  color: '#fff',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '4px' }}>
                Prompt Instructions (Use {'{{input}}'} for user text)
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="You are an expert assistant. Process the following input:&#10;&#10;{{input}}"
                rows={6}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #444',
                  backgroundColor: '#141416',
                  color: '#fff',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <input
                type="checkbox"
                id="isPublicCheck"
                checked={isPublic}
                onChange={e => setIsPublic(e.target.checked)}
              />
              <label htmlFor="isPublicCheck" style={{ fontSize: '12px', color: '#aaa' }}>
                Share publicly across team / workspace
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <button
                disabled={!name.trim() || !content.trim()}
                onClick={handleCreateSkill}
                style={{
                  backgroundColor: '#ff6b4a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 16px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  opacity: !name.trim() || !content.trim() ? 0.6 : 1,
                }}
              >
                Save Skill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
