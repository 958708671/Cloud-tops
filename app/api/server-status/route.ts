import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 使用环境变量或默认配置
    const rconHost = process.env.RCON_HOST || '127.0.0.1';
    const rconPort = parseInt(process.env.RCON_PORT || '25575');
    const rconPassword = process.env.RCON_PASSWORD;

    // 尝试连接RCON获取服务器信息
    const { Rcon } = require('rcon-client');
    
    // RCON 密码必须通过环境变量配置
    if (!rconPassword) {
      return NextResponse.json({
        success: true,
        data: { status: 'offline', onlinePlayers: 0, maxPlayers: 20, lastUpdate: new Date().toISOString() }
      });
    }
    
    try {
      const rcon = await Rcon.connect({
        host: rconHost,
        port: rconPort,
        password: rconPassword
      });

      // 获取在线玩家列表
      const listResponse = await rcon.send('list');
      
      // 解析玩家数量
      // 响应格式: "There are X of a max Y players online: player1, player2"
      const match = listResponse.match(/There are (\d+) of a max (\d+) players online/);
      const onlinePlayers = match ? parseInt(match[1]) : 0;
      const maxPlayers = match ? parseInt(match[2]) : 20;

      await rcon.end();

      return NextResponse.json({
        success: true,
        data: {
          status: 'online', // online, offline, maintenance
          onlinePlayers,
          maxPlayers,
          lastUpdate: new Date().toISOString()
        }
      });
    } catch (rconError) {
      // RCON连接失败，服务器可能离线
      return NextResponse.json({
        success: true,
        data: {
          status: 'offline',
          onlinePlayers: 0,
          maxPlayers: 20,
          lastUpdate: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('获取服务器状态失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取服务器状态失败'
    }, { status: 500 });
  }
}
