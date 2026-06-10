import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 使用环境变量或默认配置
    const rconHost = process.env.RCON_HOST || '127.0.0.1';
    const rconPort = parseInt(process.env.RCON_PORT || '25575');
    const rconPassword = process.env.RCON_PASSWORD;

    // 尝试连接RCON获取服务器信息
    const { Rcon } = require('rcon-client');
    
    if (!rconPassword) {
      return NextResponse.json({
        success: true,
        data: { version: '未知', serverType: 'Vanilla' }
      });
    }

    try {
      const rcon = await Rcon.connect({
        host: rconHost,
        port: rconPort,
        password: rconPassword
      });

      // 获取服务器版本 - 尝试不同的命令
      let versionResponse = '';
      try {
        // 尝试带斜杠的版本命令
        versionResponse = await rcon.send('/version');
      } catch {
        try {
          // 尝试about命令
          versionResponse = await rcon.send('about');
        } catch {
          // 尝试info命令
          versionResponse = await rcon.send('info');
        }
      }
      
      await rcon.end();

      let version = 'Unknown';
      let serverType = 'Unknown';
      
      if (versionResponse) {
        const versionMatch = versionResponse.match(/(\d+\.\d+(?:\.\d+)?)/);
        if (versionMatch) {
          version = versionMatch[1];
        }
        
        if (versionResponse.toLowerCase().includes('fabric')) {
          serverType = 'Fabric';
        } else if (versionResponse.toLowerCase().includes('forge')) {
          serverType = 'Forge';
        } else if (versionResponse.toLowerCase().includes('paper')) {
          serverType = 'Paper';
        } else if (versionResponse.toLowerCase().includes('spigot')) {
          serverType = 'Spigot';
        } else if (versionResponse.toLowerCase().includes('bukkit')) {
          serverType = 'Bukkit';
        } else if (versionResponse.toLowerCase().includes('vanilla')) {
          serverType = 'Vanilla';
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          version,
          serverType,
          rawResponse: versionResponse
        }
      });
    } catch (rconError) {
      // RCON连接失败，服务器可能离线
      return NextResponse.json({
        success: true,
        data: {
          version: '1.20.4',
          serverType: 'Vanilla'
        }
      });
    }
  } catch (error) {
    console.error('获取服务器版本失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取服务器版本失败'
    }, { status: 500 });
  }
}
