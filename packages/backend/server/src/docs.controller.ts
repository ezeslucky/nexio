import { Controller, Get, Header, Res } from '@nestjs/common';
import type { Response } from 'express';

import { SkipThrottle } from './base';
import { Public } from './core/auth';

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Nexio Server API',
    version: '1.2.0',
    description:
      'Official REST and WebSocket API documentation for Nexio Server. Provides endpoints for authentication, workspace management, document synchronization, AI Copilot, and cloud storage.',
    contact: {
      name: 'Nexio Support',
    },
    license: {
      name: 'MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3010',
      description: 'Local Nexio Server',
    },
    {
      url: '/',
      description: 'Current Host',
    },
  ],
  tags: [
    { name: 'System', description: 'Server information and self-host initialization' },
    { name: 'Authentication', description: 'User login, registration, sessions, and OAuth flows' },
    { name: 'Workspaces', description: 'Workspace creation, management, and document storage' },
    { name: 'Storage & Blobs', description: 'Binary attachments, images, and file storage' },
    { name: 'Copilot AI', description: 'AI assistant interactions, chat sessions, and model routing' },
    { name: 'Users', description: 'User profile and avatar management' },
    { name: 'GraphQL & Realtime', description: 'GraphQL queries and Yjs WebSocket synchronization' },
  ],
  paths: {
    '/info': {
      get: {
        tags: ['System'],
        summary: 'Get Server Information',
        description: 'Returns the current Nexio server version, deployment mode, and server flavor.',
        responses: {
          '200': {
            description: 'Server status and version details',
            content: {
              'application/json': {
                example: {
                  compatibility: '1.2.0',
                  message: 'Nexio 1.2.0 Server',
                  type: 'selfhosted',
                  flavor: 'allinone',
                },
              },
            },
          },
        },
      },
    },
    '/api/setup': {
      get: {
        tags: ['System'],
        summary: 'Check Setup Status',
        description: 'Checks whether the self-hosted Nexio instance has already been initialized with an administrator.',
        responses: {
          '200': {
            description: 'Initialization state',
            content: {
              'application/json': {
                example: { initialized: true },
              },
            },
          },
        },
      },
      post: {
        tags: ['System'],
        summary: 'Initialize Instance',
        description: 'Creates the root administrator account on first boot.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@nexio.local' },
                  password: { type: 'string', example: 'SecurePassword123' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Administrator created successfully' },
          '400': { description: 'Instance already initialized or invalid payload' },
        },
      },
    },
    '/api/auth/sign-in': {
      post: {
        tags: ['Authentication'],
        summary: 'Sign In',
        description: 'Authenticates a user with email and password, establishing an HTTP-only session cookie.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'user@nexio.local' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Authentication successful',
            content: {
              'application/json': {
                example: {
                  user: { id: 'usr_123', email: 'user@nexio.local', name: 'User' },
                  token: 'jwt_token_sample',
                },
              },
            },
          },
          '401': { description: 'Invalid email or password' },
        },
      },
    },
    '/api/auth/sign-up': {
      post: {
        tags: ['Authentication'],
        summary: 'Sign Up',
        description: 'Registers a new user account on the Nexio platform.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'newuser@nexio.local' },
                  password: { type: 'string', example: 'password123' },
                  name: { type: 'string', example: 'New User' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Registration successful' },
          '400': { description: 'Email already exists or invalid data' },
        },
      },
    },
    '/api/auth/sign-out': {
      post: {
        tags: ['Authentication'],
        summary: 'Sign Out',
        description: 'Clears the user session and invalidates active tokens.',
        responses: {
          '200': { description: 'Successfully signed out' },
        },
      },
    },
    '/api/auth/session': {
      get: {
        tags: ['Authentication'],
        summary: 'Get Current Session',
        description: 'Returns the currently authenticated user profile and permissions.',
        responses: {
          '200': {
            description: 'Active session details',
            content: {
              'application/json': {
                example: {
                  user: { id: 'usr_123', email: 'user@nexio.local', name: 'User' },
                },
              },
            },
          },
          '401': { description: 'Unauthenticated' },
        },
      },
    },
    '/api/oauth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Initiate OAuth Login',
        description: 'Generates OAuth redirect URL for Google or GitHub authentication.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['provider'],
                properties: {
                  provider: { type: 'string', enum: ['google', 'github'], example: 'google' },
                  redirectUri: { type: 'string', example: 'http://localhost:3010/oauth/callback' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'OAuth authorization URL',
            content: {
              'application/json': {
                example: { url: 'https://accounts.google.com/o/oauth2/v2/auth?...' },
              },
            },
          },
        },
      },
    },
    '/api/workspaces': {
      get: {
        tags: ['Workspaces'],
        summary: 'List Workspaces',
        description: 'Retrieves all workspaces accessible to the authenticated user.',
        responses: {
          '200': {
            description: 'List of workspaces',
            content: {
              'application/json': {
                example: [
                  {
                    id: 'ws_demo_123',
                    name: 'My Workspace',
                    avatar: null,
                    createdAt: '2026-10-09T00:00:00.000Z',
                  },
                ],
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Workspaces'],
        summary: 'Create Workspace',
        description: 'Creates a new Nexio collaborative workspace.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Engineering Team' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Workspace created',
            content: {
              'application/json': {
                example: { id: 'ws_eng_456', name: 'Engineering Team' },
              },
            },
          },
        },
      },
    },
    '/api/workspaces/{workspaceId}': {
      get: {
        tags: ['Workspaces'],
        summary: 'Get Workspace Info',
        parameters: [
          { name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Workspace details' },
          '404': { description: 'Workspace not found' },
        },
      },
      delete: {
        tags: ['Workspaces'],
        summary: 'Delete Workspace',
        parameters: [
          { name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Workspace deleted' },
        },
      },
    },
    '/api/workspaces/{workspaceId}/blobs/{key}': {
      get: {
        tags: ['Storage & Blobs'],
        summary: 'Download Blob / Attachment',
        parameters: [
          { name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'key', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Binary data',
            content: { 'application/octet-stream': {} },
          },
          '404': { description: 'Blob not found' },
        },
      },
      put: {
        tags: ['Storage & Blobs'],
        summary: 'Upload Blob / Attachment',
        parameters: [
          { name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'key', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/octet-stream': {},
            'image/png': {},
            'image/jpeg': {},
          },
        },
        responses: {
          '200': { description: 'Blob uploaded successfully' },
        },
      },
    },
    '/api/copilot/chat': {
      post: {
        tags: ['Copilot AI'],
        summary: 'Send Copilot Chat Message',
        description: 'Streams or generates AI assistance responses within the workspace context.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sessionId', 'message'],
                properties: {
                  sessionId: { type: 'string', example: 'sess_123' },
                  message: { type: 'string', example: 'Summarize this document' },
                  model: { type: 'string', example: 'claude-3-5-sonnet' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'AI stream or response payload' },
        },
      },
    },
    '/api/copilot/models': {
      get: {
        tags: ['Copilot AI'],
        summary: 'List Available AI Models',
        description: 'Retrieves all available LLM models configured in Nexio Copilot.',
        responses: {
          '200': {
            description: 'List of model descriptors',
            content: {
              'application/json': {
                example: [
                  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
                  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
                ],
              },
            },
          },
        },
      },
    },
    '/api/avatars/{userId}': {
      get: {
        tags: ['Users'],
        summary: 'Get User Avatar',
        parameters: [
          { name: 'userId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Avatar image' },
          '404': { description: 'Avatar not found' },
        },
      },
    },
    '/graphql': {
      post: {
        tags: ['GraphQL & Realtime'],
        summary: 'GraphQL Endpoint',
        description: 'Main GraphQL API supporting queries, mutations, and introspections for Nexio.',
        responses: {
          '200': { description: 'GraphQL execution result' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'nexio_session',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

function renderDocsHtml(): string {
  const specJsonString = JSON.stringify(openApiSpec);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nexio API Documentation</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <style>
    :root {
      --bg-primary: #0a0a0d;
      --bg-secondary: #121217;
      --bg-tertiary: #1a1a22;
      --border-color: #262633;
      --text-primary: #f0f0f5;
      --text-secondary: #9a9ab0;
      --accent: #3e7bfa;
      --accent-hover: #2d68e2;
      --method-get: #10b981;
      --method-post: #3b82f6;
      --method-put: #f59e0b;
      --method-delete: #ef4444;
      --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-family: var(--font-family);
      line-height: 1.5;
      overflow-x: hidden;
    }

    /* Header */
    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      padding: 0 28px;
      background: rgba(18, 18, 23, 0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-color);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }

    .brand-logo {
      width: 32px;
      height: 32px;
      display: inline-block;
    }

    .brand-title {
      font-size: 19px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #fff;
    }

    .brand-badge {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 999px;
      background: rgba(62, 123, 250, 0.16);
      color: #60a5fa;
      border: 1px solid rgba(96, 165, 250, 0.3);
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      font-size: 13px;
      font-weight: 500;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background: var(--bg-secondary);
      color: var(--text-primary);
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s ease;
    }

    .btn:hover {
      background: var(--bg-tertiary);
      border-color: #3b3b4f;
    }

    .btn-primary {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
    }

    .btn-primary:hover {
      background: var(--accent-hover);
    }

    /* Layout */
    .layout {
      display: flex;
      min-height: calc(100vh - 64px);
    }

    /* Sidebar */
    .sidebar {
      width: 290px;
      flex-shrink: 0;
      border-right: 1px solid var(--border-color);
      background: var(--bg-secondary);
      padding: 20px 0;
      overflow-y: auto;
      height: calc(100vh - 64px);
      position: sticky;
      top: 64px;
    }

    .sidebar-group-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-secondary);
      padding: 12px 24px 6px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 24px;
      font-size: 13px;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.1s;
    }

    .nav-item:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.04);
    }

    .nav-item.active {
      color: #fff;
      background: rgba(62, 123, 250, 0.15);
      border-left: 3px solid var(--accent);
      font-weight: 600;
    }

    .badge-method {
      font-size: 9px;
      font-weight: 700;
      padding: 2px 5px;
      border-radius: 4px;
      font-family: var(--font-mono);
      min-width: 42px;
      text-align: center;
    }

    .method-get { background: rgba(16, 185, 129, 0.15); color: var(--method-get); }
    .method-post { background: rgba(59, 130, 246, 0.15); color: var(--method-post); }
    .method-put { background: rgba(245, 158, 11, 0.15); color: var(--method-put); }
    .method-delete { background: rgba(239, 68, 68, 0.15); color: var(--method-delete); }

    /* Content */
    .content {
      flex: 1;
      padding: 36px 48px;
      max-width: 1080px;
    }

    .hero {
      margin-bottom: 40px;
      padding-bottom: 28px;
      border-bottom: 1px solid var(--border-color);
    }

    .hero h1 {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero p {
      color: var(--text-secondary);
      font-size: 15px;
      max-width: 720px;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin: 24px 0;
    }

    .overview-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 18px;
    }

    .overview-card h3 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 6px;
      color: #fff;
    }

    .overview-card p {
      font-size: 13px;
      color: var(--text-secondary);
    }

    /* Endpoint Card */
    .endpoint-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      margin-bottom: 24px;
      overflow: hidden;
    }

    .endpoint-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
      background: rgba(255, 255, 255, 0.02);
    }

    .endpoint-path {
      font-family: var(--font-mono);
      font-size: 14px;
      font-weight: 600;
      color: #fff;
    }

    .endpoint-summary {
      margin-left: auto;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .endpoint-body {
      padding: 20px;
    }

    .endpoint-desc {
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: 16px;
    }

    .code-box {
      background: #060608;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 14px;
      font-family: var(--font-mono);
      font-size: 12px;
      color: #d1d5db;
      overflow-x: auto;
      margin-top: 10px;
    }

    .try-out-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px dashed var(--border-color);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .try-result {
      margin-top: 12px;
      padding: 12px;
      background: #000;
      border: 1px solid #10b981;
      border-radius: 6px;
      font-family: var(--font-mono);
      font-size: 11px;
      display: none;
    }

    /* Search Input */
    .search-input {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 12px;
      color: #fff;
      width: 240px;
      outline: none;
    }
    .search-input:focus {
      border-color: var(--accent);
    }

    #swagger-container {
      display: none;
      padding: 20px 0;
    }
  </style>
</head>
<body>

  <!-- Top Navigation Header -->
  <header class="header">
    <a href="/api/docs" class="brand">
      <svg class="brand-logo" viewBox="0 0 256 256" fill="none">
        <rect width="256" height="256" rx="56" fill="#08080b" stroke="#333" stroke-width="6" />
        <circle cx="128" cy="128" r="12" fill="#ffffff" />
        <path d="M128 63L91.5 96.5L145.5 113.5Z" fill="#ffffff" />
        <path d="M193 128L159.5 91.5L142.5 145.5Z" fill="#ffffff" />
        <path d="M128 193L164.5 159.5L110.5 142.5Z" fill="#ffffff" />
        <path d="M63 128L96.5 164.5L113.5 110.5Z" fill="#ffffff" />
      </svg>
      <span class="brand-title">NEXIO</span>
      <span class="brand-badge">API Docs v1.2.0</span>
    </a>

    <div class="nav-actions">
      <input type="text" id="endpointSearch" class="search-input" placeholder="Search API endpoints..." onkeyup="filterEndpoints()" />
      <button class="btn" onclick="toggleSwaggerView()" id="swaggerToggleBtn">Swagger UI</button>
      <a href="/api/docs/openapi.json" target="_blank" class="btn btn-primary">OpenAPI JSON</a>
    </div>
  </header>

  <div class="layout">
    <!-- Sidebar Navigation -->
    <aside class="sidebar">
      <div class="sidebar-group-title">Getting Started</div>
      <a href="#overview" class="nav-item active">Overview</a>
      <a href="#authentication" class="nav-item">Authentication</a>

      <div class="sidebar-group-title">System API</div>
      <a href="#get-info" class="nav-item"><span class="badge-method method-get">GET</span>/info</a>
      <a href="#get-setup" class="nav-item"><span class="badge-method method-get">GET</span>/api/setup</a>
      <a href="#post-setup" class="nav-item"><span class="badge-method method-post">POST</span>/api/setup</a>

      <div class="sidebar-group-title">Auth & Sessions</div>
      <a href="#post-signin" class="nav-item"><span class="badge-method method-post">POST</span>/api/auth/sign-in</a>
      <a href="#post-signup" class="nav-item"><span class="badge-method method-post">POST</span>/api/auth/sign-up</a>
      <a href="#post-signout" class="nav-item"><span class="badge-method method-post">POST</span>/api/auth/sign-out</a>
      <a href="#get-session" class="nav-item"><span class="badge-method method-get">GET</span>/api/auth/session</a>
      <a href="#post-oauth" class="nav-item"><span class="badge-method method-post">POST</span>/api/oauth/login</a>

      <div class="sidebar-group-title">Workspaces & Blobs</div>
      <a href="#get-workspaces" class="nav-item"><span class="badge-method method-get">GET</span>/api/workspaces</a>
      <a href="#post-workspaces" class="nav-item"><span class="badge-method method-post">POST</span>/api/workspaces</a>
      <a href="#get-workspace" class="nav-item"><span class="badge-method method-get">GET</span>/api/workspaces/:id</a>
      <a href="#get-blob" class="nav-item"><span class="badge-method method-get">GET</span>.../blobs/:key</a>
      <a href="#put-blob" class="nav-item"><span class="badge-method method-put">PUT</span>.../blobs/:key</a>

      <div class="sidebar-group-title">Copilot & Realtime</div>
      <a href="#post-copilot-chat" class="nav-item"><span class="badge-method method-post">POST</span>/api/copilot/chat</a>
      <a href="#get-copilot-models" class="nav-item"><span class="badge-method method-get">GET</span>/api/copilot/models</a>
      <a href="#graphql" class="nav-item"><span class="badge-method method-post">POST</span>/graphql</a>
      <a href="#sync-ws" class="nav-item"><span class="badge-method method-get">WS</span>/sync</a>
    </aside>

    <!-- Main Content Area -->
    <main class="content">
      <div id="interactive-view">
        <div class="hero" id="overview">
          <h1>Nexio API Documentation</h1>
          <p>Welcome to the official developer documentation for the Nexio Collaborative Platform. Build integrations, synchronize state across clients, automate workspaces, and leverage embedded AI Copilot capabilities.</p>

          <div class="overview-grid">
            <div class="overview-card">
              <h3>Base URL</h3>
              <p><code>http://localhost:3010</code> or your deployment domain.</p>
            </div>
            <div class="overview-card">
              <h3>Authentication</h3>
              <p>Session Cookies (Web) or Bearer JWT token in Authorization header.</p>
            </div>
            <div class="overview-card">
              <h3>Specification</h3>
              <p>OpenAPI 3.0.0 JSON compliant. Downloadable via header button.</p>
            </div>
            <div class="overview-card">
              <h3>Real-time Sync</h3>
              <p>Sub-millisecond collaborative state over WebSocket (Yjs).</p>
            </div>
          </div>
        </div>

        <!-- System Section -->
        <section id="system-endpoints">
          <div class="endpoint-card" id="get-info">
            <div class="endpoint-header">
              <span class="badge-method method-get">GET</span>
              <span class="endpoint-path">/info</span>
              <span class="endpoint-summary">Get Server Information</span>
            </div>
            <div class="endpoint-body">
              <div class="endpoint-desc">Retrieves the running version, flavor, deployment type, and platform health.</div>
              <div class="code-box">curl -X GET "http://localhost:3010/info" -H "Accept: application/json"</div>
              <div class="try-out-section">
                <button class="btn btn-primary" onclick="testEndpoint('/info', 'GET', 'result-info')">Execute Request</button>
              </div>
              <pre class="try-result" id="result-info"></pre>
            </div>
          </div>

          <div class="endpoint-card" id="get-setup">
            <div class="endpoint-header">
              <span class="badge-method method-get">GET</span>
              <span class="endpoint-path">/api/setup</span>
              <span class="endpoint-summary">Check Setup Status</span>
            </div>
            <div class="endpoint-body">
              <div class="endpoint-desc">Determines if the self-hosted Nexio instance has already been initialized.</div>
              <div class="code-box">curl -X GET "http://localhost:3010/api/setup"</div>
              <div class="try-out-section">
                <button class="btn btn-primary" onclick="testEndpoint('/api/setup', 'GET', 'result-setup')">Execute Request</button>
              </div>
              <pre class="try-result" id="result-setup"></pre>
            </div>
          </div>
        </section>

        <!-- Auth Section -->
        <section id="auth-endpoints">
          <div class="endpoint-card" id="get-session">
            <div class="endpoint-header">
              <span class="badge-method method-get">GET</span>
              <span class="endpoint-path">/api/auth/session</span>
              <span class="endpoint-summary">Current Authenticated Session</span>
            </div>
            <div class="endpoint-body">
              <div class="endpoint-desc">Validates the session cookie or bearer token and returns user details.</div>
              <div class="code-box">curl -X GET "http://localhost:3010/api/auth/session" --cookie "nexio_session=..."</div>
              <div class="try-out-section">
                <button class="btn btn-primary" onclick="testEndpoint('/api/auth/session', 'GET', 'result-session')">Execute Request</button>
              </div>
              <pre class="try-result" id="result-session"></pre>
            </div>
          </div>

          <div class="endpoint-card" id="post-signin">
            <div class="endpoint-header">
              <span class="badge-method method-post">POST</span>
              <span class="endpoint-path">/api/auth/sign-in</span>
              <span class="endpoint-summary">User Sign In</span>
            </div>
            <div class="endpoint-body">
              <div class="endpoint-desc">Authenticates user credentials and returns session tokens.</div>
              <div class="code-box">curl -X POST "http://localhost:3010/api/auth/sign-in" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@nexio.local", "password": "password123"}'</div>
            </div>
          </div>

          <div class="endpoint-card" id="post-oauth">
            <div class="endpoint-header">
              <span class="badge-method method-post">POST</span>
              <span class="endpoint-path">/api/oauth/login</span>
              <span class="endpoint-summary">Initiate OAuth Authorization</span>
            </div>
            <div class="endpoint-body">
              <div class="endpoint-desc">Generates the third-party OAuth redirect URI for Google or GitHub login.</div>
              <div class="code-box">curl -X POST "http://localhost:3010/api/oauth/login" \\
  -H "Content-Type: application/json" \\
  -d '{"provider": "google", "redirectUri": "http://localhost:3010/oauth/callback"}'</div>
            </div>
          </div>
        </section>

        <!-- Workspaces Section -->
        <section id="workspace-endpoints">
          <div class="endpoint-card" id="get-workspaces">
            <div class="endpoint-header">
              <span class="badge-method method-get">GET</span>
              <span class="endpoint-path">/api/workspaces</span>
              <span class="endpoint-summary">List User Workspaces</span>
            </div>
            <div class="endpoint-body">
              <div class="endpoint-desc">Lists all workspaces that the authenticated user is a member of.</div>
              <div class="code-box">curl -X GET "http://localhost:3010/api/workspaces" -H "Authorization: Bearer &lt;TOKEN&gt;"</div>
              <div class="try-out-section">
                <button class="btn btn-primary" onclick="testEndpoint('/api/workspaces', 'GET', 'result-workspaces')">Execute Request</button>
              </div>
              <pre class="try-result" id="result-workspaces"></pre>
            </div>
          </div>

          <div class="endpoint-card" id="get-blob">
            <div class="endpoint-header">
              <span class="badge-method method-get">GET</span>
              <span class="endpoint-path">/api/workspaces/:workspaceId/blobs/:key</span>
              <span class="endpoint-summary">Retrieve Binary Blob</span>
            </div>
            <div class="endpoint-body">
              <div class="endpoint-desc">Fetches document attachments, image assets, or uploaded binary objects.</div>
              <div class="code-box">curl -X GET "http://localhost:3010/api/workspaces/ws_123/blobs/img_xyz" -o asset.png</div>
            </div>
          </div>
        </section>

        <!-- Copilot AI Section -->
        <section id="copilot-endpoints">
          <div class="endpoint-card" id="get-copilot-models">
            <div class="endpoint-header">
              <span class="badge-method method-get">GET</span>
              <span class="endpoint-path">/api/copilot/models</span>
              <span class="endpoint-summary">List AI Copilot Models</span>
            </div>
            <div class="endpoint-body">
              <div class="endpoint-desc">Retrieves the AI LLM models available for reasoning, coding, and chat in Nexio.</div>
              <div class="code-box">curl -X GET "http://localhost:3010/api/copilot/models"</div>
              <div class="try-out-section">
                <button class="btn btn-primary" onclick="testEndpoint('/api/copilot/models', 'GET', 'result-copilot-models')">Execute Request</button>
              </div>
              <pre class="try-result" id="result-copilot-models"></pre>
            </div>
          </div>

          <div class="endpoint-card" id="graphql">
            <div class="endpoint-header">
              <span class="badge-method method-post">POST</span>
              <span class="endpoint-path">/graphql</span>
              <span class="endpoint-summary">GraphQL Endpoint</span>
            </div>
            <div class="endpoint-body">
              <div class="endpoint-desc">Executes complex queries and mutations across workspaces, users, and documents.</div>
              <div class="code-box">curl -X POST "http://localhost:3010/graphql" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "{ currentUser { id email name } }"}'</div>
            </div>
          </div>

          <div class="endpoint-card" id="sync-ws">
            <div class="endpoint-header">
              <span class="badge-method method-get">WS</span>
              <span class="endpoint-path">/sync</span>
              <span class="endpoint-summary">Realtime State Synchronization</span>
            </div>
            <div class="endpoint-body">
              <div class="endpoint-desc">WebSocket endpoint implementing the Yjs CRDT protocol for sub-millisecond collaboration.</div>
              <div class="code-box">ws://localhost:3010/sync</div>
            </div>
          </div>
        </section>
      </div>

      <!-- Swagger UI Container -->
      <div id="swagger-container">
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
        <div id="swagger-ui"></div>
      </div>
    </main>
  </div>

  <script>
    const spec = ${specJsonString};

    function filterEndpoints() {
      const q = document.getElementById('endpointSearch').value.toLowerCase();
      document.querySelectorAll('.endpoint-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(q) ? 'block' : 'none';
      });
    }

    async function testEndpoint(url, method, targetId) {
      const resEl = document.getElementById(targetId);
      resEl.style.display = 'block';
      resEl.textContent = 'Executing ' + method + ' ' + url + '...';
      try {
        const res = await fetch(url, { method, headers: { 'Accept': 'application/json' } });
        const text = await res.text();
        let formatted = text;
        try {
          formatted = JSON.stringify(JSON.parse(text), null, 2);
        } catch(e) {}
        resEl.textContent = 'Status: ' + res.status + ' ' + res.statusText + '\\n\\n' + formatted;
        resEl.style.borderColor = res.ok ? '#10b981' : '#ef4444';
      } catch (err) {
        resEl.textContent = 'Request Error: ' + err.message;
        resEl.style.borderColor = '#ef4444';
      }
    }

    let swaggerLoaded = false;
    function toggleSwaggerView() {
      const interView = document.getElementById('interactive-view');
      const swaggerCont = document.getElementById('swagger-container');
      const btn = document.getElementById('swaggerToggleBtn');

      if (swaggerCont.style.display === 'block') {
        swaggerCont.style.display = 'none';
        interView.style.display = 'block';
        btn.textContent = 'Swagger UI';
      } else {
        swaggerCont.style.display = 'block';
        interView.style.display = 'none';
        btn.textContent = 'Nexio Explorer';

        if (!swaggerLoaded) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js';
          script.onload = () => {
            window.ui = SwaggerUIBundle({
              spec: spec,
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [SwaggerUIBundle.presets.apis],
            });
          };
          document.body.appendChild(script);
          swaggerLoaded = true;
        }
      }
    }
  </script>
</body>
</html>`;
}

@Controller('/api/docs')
export class DocsController {
  @SkipThrottle()
  @Public()
  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  getDocs(): string {
    return renderDocsHtml();
  }

  @SkipThrottle()
  @Public()
  @Get('openapi.json')
  getOpenApiSpec() {
    return openApiSpec;
  }
}
