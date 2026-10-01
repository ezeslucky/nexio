import {
  ViewBody,
  ViewHeader,
  ViewIcon,
  ViewTitle,
  WorkbenchService,
} from '@affine/core/modules/workbench';
import { WorkspaceService } from '@affine/core/modules/workspace';
import { useLiveData, useService } from '@toeverything/infra';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { STARTER_WORKFLOWS } from './defaults';
import type { WorkflowItem } from './types';
import { WorkflowCanvas } from './workflow-canvas';
import { WorkflowList } from './workflow-list';

export const Component = () => {
  const workbench = useService(WorkbenchService).workbench;
  const workspaceService = useService(WorkspaceService);
  const currentWorkspace = workspaceService.workspace;
  const params = useParams();

  const storageKey = `nexio:workflows:${currentWorkspace.id}`;

  const [workflows, setWorkflows] = useState<WorkflowItem[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load workflows from localStorage', e);
    }
    return STARTER_WORKFLOWS;
  });

  // Save to localStorage whenever workflows change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(workflows));
    } catch (e) {
      console.error('Failed to save workflows to localStorage', e);
    }
  }, [storageKey, workflows]);

  const selectedWorkflowId = params.workflowId || null;

  const activeWorkflow = workflows.find(w => w.id === selectedWorkflowId) || null;

  const handleSelectWorkflow = useCallback(
    (id: string) => {
      workbench.open(`/workflow/${id}`);
    },
    [workbench]
  );

  const handleCreateWorkflow = useCallback(() => {
    const newWorkflow: WorkflowItem = {
      id: `wf-${Date.now()}`,
      name: 'Untitled AI Workflow',
      description: 'Custom AI automation workflow created in Nexio Studio.',
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      executionCount: 0,
      nodes: [
        {
          id: 'node-start',
          type: 'trigger',
          subType: 'manual',
          name: 'Manual Trigger',
          description: 'Triggers workflow execution with input payload',
          position: { x: 100, y: 180 },
          status: 'idle',
          config: { testInput: '{"query": "Hello Nexio Workflow"}' },
        },
        {
          id: 'node-ai',
          type: 'ai',
          subType: 'llm_chat',
          name: 'Nexio AI Generator',
          description: 'Processes input and creates structured insights',
          position: { x: 420, y: 180 },
          status: 'idle',
          config: { model: 'gpt-4o', prompt: '{{$json.query}}' },
        },
      ],
      connections: [
        {
          id: 'conn-start-ai',
          fromNodeId: 'node-start',
          fromPort: 'output',
          toNodeId: 'node-ai',
          toPort: 'input',
        },
      ],
    };

    setWorkflows(prev => [newWorkflow, ...prev]);
    workbench.open(`/workflow/${newWorkflow.id}`);
  }, [workbench]);

  const handleUpdateWorkflow = useCallback((updated: WorkflowItem) => {
    setWorkflows(prev => prev.map(w => (w.id === updated.id ? updated : w)));
  }, []);

  const handleDeleteWorkflow = useCallback(
    (id: string) => {
      setWorkflows(prev => prev.filter(w => w.id !== id));
      if (selectedWorkflowId === id) {
        workbench.open('/workflow');
      }
    },
    [selectedWorkflowId, workbench]
  );

  const handleImportStarter = useCallback(
    (starter: WorkflowItem) => {
      const cloned: WorkflowItem = {
        ...starter,
        id: `wf-${Date.now()}`,
        name: `${starter.name} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        executionCount: 0,
      };
      setWorkflows(prev => [cloned, ...prev]);
      workbench.open(`/workflow/${cloned.id}`);
    },
    [workbench]
  );

  return (
    <>
      <ViewHeader>
        <ViewTitle>
          {activeWorkflow ? `Workflow / ${activeWorkflow.name}` : 'Workflow Studio'}
        </ViewTitle>
        <ViewIcon>
          <span style={{ fontSize: '16px' }}>⚡</span>
        </ViewIcon>
      </ViewHeader>

      <ViewBody>
        <div style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
          {activeWorkflow ? (
            <WorkflowCanvas
              workflow={activeWorkflow}
              onUpdateWorkflow={handleUpdateWorkflow}
              onBack={() => workbench.open('/workflow')}
            />
          ) : (
            <WorkflowList
              workflows={workflows}
              onSelectWorkflow={handleSelectWorkflow}
              onCreateWorkflow={handleCreateWorkflow}
              onUpdateWorkflow={handleUpdateWorkflow}
              onDeleteWorkflow={handleDeleteWorkflow}
              onImportStarter={handleImportStarter}
            />
          )}
        </div>
      </ViewBody>
    </>
  );
};
