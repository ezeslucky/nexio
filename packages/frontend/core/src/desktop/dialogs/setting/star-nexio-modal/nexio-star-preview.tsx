import React from 'react';

export const NexioStarPreview: React.FC = () => {
  return (
    <div
      style={{
        width: 400,
        height: 240,
        background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8F3D 45%, #FF4458 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <style>{`
        @keyframes nexioCursorMove {
          0%, 12% { transform: translate(70px, 145px); opacity: 0; }
          18% { opacity: 1; }
          42%, 70% { transform: translate(254px, 25px); opacity: 1; }
          48% { transform: translate(254px, 25px) scale(0.85); }
          54% { transform: translate(254px, 25px) scale(1); }
          82% { transform: translate(270px, 45px); opacity: 1; }
          92%, 100% { transform: translate(300px, 90px); opacity: 0; }
        }
        @keyframes nexioStarGlow {
          0%, 46% {
            background-color: #f6f8fa;
            color: #24292f;
            border-color: #d0d7de;
            box-shadow: none;
          }
          48%, 82% {
            background-color: #fff8c5;
            color: #9a6700;
            border-color: #d4a72c;
            box-shadow: 0 0 12px rgba(227, 179, 65, 0.5);
          }
          88%, 100% {
            background-color: #f6f8fa;
            color: #24292f;
            border-color: #d0d7de;
            box-shadow: none;
          }
        }
        @keyframes nexioStarIconFill {
          0%, 46% { fill: none; stroke: #57606a; }
          48%, 82% { fill: #eac54f; stroke: #b08800; transform: scale(1.2); }
          88%, 100% { fill: none; stroke: #57606a; transform: scale(1); }
        }
        @keyframes nexioPlusOneFloat {
          0%, 47% { opacity: 0; transform: translate(265px, 16px) scale(0.6); }
          50% { opacity: 1; transform: translate(265px, 6px) scale(1); }
          75% { opacity: 0; transform: translate(265px, -12px) scale(0.9); }
          100% { opacity: 0; }
        }
        @keyframes nexioPulseRing {
          0%, 47% { transform: scale(0.6); opacity: 0; }
          48% { transform: scale(0.8); opacity: 0.8; }
          65% { transform: scale(1.6); opacity: 0; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* Floating subtle ambient blur rings */}
      <div
        style={{
          position: 'absolute',
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.12)',
          filter: 'blur(30px)',
          top: -40,
          left: -40,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'rgba(255, 110, 80, 0.25)',
          filter: 'blur(25px)',
          bottom: -30,
          right: -30,
        }}
      />

      {/* Miniature Browser Card */}
      <div
        style={{
          width: 346,
          height: 196,
          borderRadius: 9,
          backgroundColor: '#ffffff',
          boxShadow: '0 18px 36px rgba(0,0,0,0.32), 0 2px 8px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          zIndex: 1,
        }}
      >
        {/* Browser Top Window Chrome */}
        <div
          style={{
            height: 26,
            backgroundColor: '#f1f3f5',
            borderBottom: '1px solid #e1e4e8',
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f56' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffbd2e' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#27c93f' }} />
          </div>
          {/* Address Bar */}
          <div
            style={{
              flex: 1,
              height: 16,
              margin: '0 16px 0 10px',
              backgroundColor: '#ffffff',
              borderRadius: 4,
              border: '1px solid #d0d7de',
              display: 'flex',
              alignItems: 'center',
              padding: '0 6px',
              fontSize: 9,
              color: '#57606a',
              gap: 4,
            }}
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="#2da44e">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
            <span style={{ fontWeight: 500, letterSpacing: -0.2 }}>
              github.com/ezeslucky/nexio
            </span>
          </div>
        </div>

        {/* GitHub Repository Header Content */}
        <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid #eaeef2' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {/* GitHub SVG logo */}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="#24292f">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              <span style={{ fontSize: 11, color: '#0969da', fontWeight: 500 }}>ezeslucky</span>
              <span style={{ fontSize: 11, color: '#57606a' }}>/</span>
              <span style={{ fontSize: 11, color: '#0969da', fontWeight: 700 }}>nexio</span>
              <span
                style={{
                  fontSize: 8,
                  padding: '1px 5px',
                  borderRadius: 8,
                  border: '1px solid #d0d7de',
                  color: '#57606a',
                  fontWeight: 500,
                  marginLeft: 3,
                }}
              >
                Public
              </span>
            </div>

            {/* ⭐ Star Button Mockup */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #d0d7de',
                borderRadius: 5,
                fontSize: 9,
                fontWeight: 600,
                padding: '2px 7px',
                gap: 4,
                cursor: 'pointer',
                animation: 'nexioStarGlow 4.5s ease-in-out infinite',
                transition: 'all 0.2s ease',
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                style={{
                  animation: 'nexioStarIconFill 4.5s ease-in-out infinite',
                  transition: 'all 0.2s ease',
                }}
              >
                <polygon
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                />
              </svg>
              <span>Star</span>
              <span
                style={{
                  fontSize: 8,
                  background: 'rgba(27, 31, 36, 0.08)',
                  padding: '0 4px',
                  borderRadius: 8,
                  marginLeft: 2,
                }}
              >
                1.4k
              </span>
            </div>
          </div>

          {/* Repo Navigation Bar */}
          <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 9 }}>
            <span
              style={{
                color: '#1f2328',
                fontWeight: 600,
                borderBottom: '2px solid #fd8c73',
                paddingBottom: 2,
              }}
            >
              Code
            </span>
            <span style={{ color: '#656d76' }}>Issues</span>
            <span style={{ color: '#656d76' }}>Pull requests</span>
            <span style={{ color: '#656d76' }}>Workflows</span>
          </div>
        </div>

        {/* Repository File Tree & Content Preview */}
        <div style={{ padding: '6px 12px', flex: 1, backgroundColor: '#fcfcfc', fontSize: 9 }}>
          <div
            style={{
              padding: '6px 8px',
              borderRadius: 5,
              background: '#ffffff',
              border: '1px solid #e1e4e8',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#1f2328', fontWeight: 600 }}>
              <span style={{ color: '#0969da' }}>📖</span>
              <span>README.md</span>
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#1f2328' }}>
              NEXIO 🚀
            </div>
            <div style={{ fontSize: 8, color: '#656d76', lineHeight: 1.3 }}>
              Next-generation all-in-one workspace & visual AI automation engine.
            </div>
          </div>
        </div>

        {/* Animated Click Particle "+1" */}
        <div
          style={{
            position: 'absolute',
            fontSize: 10,
            fontWeight: 700,
            color: '#b08800',
            animation: 'nexioPlusOneFloat 4.5s ease-out infinite',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          ⭐ +1
        </div>

        {/* Pulse Click Ripple */}
        <div
          style={{
            position: 'absolute',
            top: 24,
            right: 48,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'rgba(234, 197, 79, 0.4)',
            animation: 'nexioPulseRing 4.5s ease-out infinite',
            pointerEvents: 'none',
            zIndex: 9,
          }}
        />

        {/* Animated Mouse Cursor */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            animation: 'nexioCursorMove 4.5s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: 12,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#1f2328">
            <path
              d="M3 3l7 18 3-7 7-3L3 3z"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
