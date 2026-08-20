import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from './app/common/decorators/public.decorator';
import { SkipTransform } from './app/common/decorators/skip-transform.decorator';

@Controller()
export class AppController {
  @Public()
  @SkipTransform()
  @Get()
  getRoot(@Req() req: Request, @Res() res: Response) {
    const isBrowser = req.headers.accept?.includes('text/html');

    if (isBrowser) {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NestJS Backend Server</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: rgba(18, 24, 38, 0.85);
      --card-border: rgba(255, 255, 255, 0.08);
      --primary: #3b82f6;
      --primary-glow: rgba(59, 130, 246, 0.35);
      --success: #10b981;
      --success-glow: rgba(16, 185, 129, 0.25);
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background-image: 
        radial-gradient(circle at 15% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 85% 80%, rgba(16, 185, 129, 0.12) 0%, transparent 40%);
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 40px;
      max-width: 640px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px var(--primary-glow);
      backdrop-filter: blur(16px);
    }
    .badge-container {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
    }
    .pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 12px #10b981;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.3); }
    }
    h1 {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
      background: linear-gradient(to right, #ffffff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p.subtitle {
      color: var(--text-muted);
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      margin-bottom: 28px;
    }
    .link-box {
      display: block;
      text-decoration: none;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 16px;
      transition: all 0.2s ease;
    }
    .link-box:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.4);
      transform: translateY(-2px);
    }
    .link-title {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .link-desc {
      font-size: 12px;
      color: var(--text-muted);
    }
    .footer {
      border-top: 1px solid var(--card-border);
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge-container">
      <div class="badge">
        <span class="pulse"></span>
        NestJS Server is Running
      </div>
    </div>
    <h1>Primary Backend Starter</h1>
    <p class="subtitle">Production-ready template built with NestJS, Prisma 7, Better Auth, and Apollo GraphQL.</p>
    
    <div class="grid">
      <a href="/api/v1/auth/me" class="link-box">
        <div class="link-title">REST API <span>→</span></div>
        <div class="link-desc">/api/v1 (Auth, Users, Admin)</div>
      </a>
      <a href="/graphql" class="link-box">
        <div class="link-title">GraphQL Sandbox <span>→</span></div>
        <div class="link-desc">/graphql (Apollo Studio)</div>
      </a>
      <a href="/api/v1/users" class="link-box">
        <div class="link-title">Users Endpoint <span>→</span></div>
        <div class="link-desc">/api/v1/users</div>
      </a>
      <a href="/health" class="link-box">
        <div class="link-title">Health Check <span>→</span></div>
        <div class="link-desc">/health (System status)</div>
      </a>
    </div>

    <div class="footer">
      <span>Node: ${process.version}</span>
      <span>Env: ${process.env.NODE_ENV || 'development'}</span>
      <span>Port: ${process.env.PORT || 5000}</span>
    </div>
  </div>
</body>
</html>`;
      return res.type('html').send(html);
    }

    return res.json({
      success: true,
      statusCode: 200,
      message: '🚀 NestJS Backend Server is running successfully!',
      data: {
        appName: process.env.APP_NAME || 'NestJS-Backend-Server',
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        uptime: `${Math.floor(process.uptime())}s`,
        endpoints: {
          rest: `/api/v1`,
          graphql: `/graphql`,
          auth: `/api/v1/auth`,
          health: `/health`,
        },
      },
      timestamp: new Date().toISOString(),
    });
  }

  @Public()
  @SkipTransform()
  @Get('health')
  getHealth(@Res() res: Response) {
    return res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    });
  }
}
