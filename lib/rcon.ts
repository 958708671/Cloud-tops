interface RconOptions {
  host: string;
  port: number;
  password: string;
}

interface RconResponse {
  id: number;
  type: number;
  body: string;
}

class Rcon {
  private socket: any = null;
  private host: string;
  private port: number;
  private password: string;
  private connected: boolean = false;
  private authenticated: boolean = false;
  private requestId: number = 0;
  private net: any;

  constructor(options: RconOptions) {
    this.host = options.host;
    this.port = options.port;
    this.password = options.password;
    this.net = require('net');
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = this.net.createSocket('tcp');
      
      const timeout = setTimeout(() => {
        this.socket?.destroy();
        reject(new Error('连接超时'));
      }, 5000);

      this.socket.connect(this.port, this.host, () => {
        clearTimeout(timeout);
        this.connected = true;
        resolve();
      });

      this.socket.on('error', (err: any) => {
        clearTimeout(timeout);
        reject(new Error(`连接错误: ${err.message}`));
      });

      this.socket.on('close', () => {
        this.connected = false;
        this.authenticated = false;
      });
    });
  }

  async authenticate(): Promise<void> {
    if (!this.connected || !this.socket) {
      throw new Error('未连接到服务器');
    }

    return new Promise((resolve, reject) => {
      const authId = this.requestId++;
      const packet = this.createPacket(authId, 3, this.password);

      const timeout = setTimeout(() => {
        reject(new Error('认证超时'));
      }, 5000);

      const onData = (data: Buffer) => {
        clearTimeout(timeout);
        this.socket?.off('data', onData);
        
        const response = this.parsePacket(data);
        // RCON 协议：认证失败时服务器返回 ID = -1
        if (response.id === -1) {
          reject(new Error('认证失败: 密码错误'));
        } else if (response.id === authId) {
          this.authenticated = true;
          resolve();
        } else {
          reject(new Error('认证失败: 响应ID不匹配'));
        }
      };

      this.socket.on('data', onData);
      this.socket.write(packet);
    });
  }

  async sendCommand(command: string): Promise<string> {
    if (!this.connected || !this.authenticated || !this.socket) {
      throw new Error('未连接或未认证');
    }

    return new Promise((resolve, reject) => {
      const commandId = this.requestId++;
      const packet = this.createPacket(commandId, 2, command);

      const timeout = setTimeout(() => {
        reject(new Error('命令执行超时'));
      }, 10000);

      let responseData = Buffer.alloc(0);

      const onData = (data: Buffer) => {
        responseData = Buffer.concat([responseData, data]);
        
        try {
          const response = this.parsePacket(data);
          clearTimeout(timeout);
          this.socket?.off('data', onData);
          resolve(response.body);
        } catch {
          // 数据不完整，继续等待
        }
      };

      this.socket.on('data', onData);
      this.socket.write(packet);
    });
  }

  private createPacket(id: number, type: number, body: string): Buffer {
    const bodyBuffer = Buffer.from(body, 'utf8');
    const packet = Buffer.alloc(14 + bodyBuffer.length);
    
    packet.writeInt32LE(10 + bodyBuffer.length, 0); // Length
    packet.writeInt32LE(id, 4); // Request ID
    packet.writeInt32LE(type, 8); // Type
    bodyBuffer.copy(packet, 12); // Body
    packet.writeInt8(0, 12 + bodyBuffer.length); // Null terminator
    packet.writeInt8(0, 13 + bodyBuffer.length); // Null terminator
    
    return packet;
  }

  private parsePacket(data: Buffer): RconResponse {
    if (data.length < 14) {
      throw new Error('数据包不完整');
    }

    const length = data.readInt32LE(0);
    if (data.length < 4 + length) {
      throw new Error('数据包不完整');
    }

    return {
      id: data.readInt32LE(4),
      type: data.readInt32LE(8),
      body: data.subarray(12, 12 + length - 10).toString('utf8')
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
      this.connected = false;
      this.authenticated = false;
    }
  }
}

export async function addToWhitelist(
  host: string,
  port: number,
  password: string,
  playerName: string
): Promise<{ success: boolean; message: string }> {
  const rcon = new Rcon({ host, port, password });
  
  try {
    await rcon.connect();
    await rcon.authenticate();
    
    const result = await rcon.sendCommand(`whitelist add ${playerName}`);
    
    rcon.disconnect();
    
    if (result.includes('Added') || result.includes('added') || result.includes(playerName)) {
      return { success: true, message: `已将 ${playerName} 添加到服务器白名单` };
    } else {
      return { success: false, message: `添加白名单失败: ${result}` };
    }
  } catch (error: any) {
    rcon.disconnect();
    return { success: false, message: `连接服务器失败: ${error.message}` };
  }
}

export async function removeFromWhitelist(
  host: string,
  port: number,
  password: string,
  playerName: string
): Promise<{ success: boolean; message: string }> {
  const rcon = new Rcon({ host, port, password });
  
  try {
    await rcon.connect();
    await rcon.authenticate();
    
    const result = await rcon.sendCommand(`whitelist remove ${playerName}`);
    
    rcon.disconnect();
    
    return { success: true, message: `已将 ${playerName} 从服务器白名单移除` };
  } catch (error: any) {
    rcon.disconnect();
    return { success: false, message: `连接服务器失败: ${error.message}` };
  }
}

export async function reloadWhitelist(
  host: string,
  port: number,
  password: string
): Promise<{ success: boolean; message: string }> {
  const rcon = new Rcon({ host, port, password });
  
  try {
    await rcon.connect();
    await rcon.authenticate();
    
    await rcon.sendCommand('whitelist reload');
    
    rcon.disconnect();
    
    return { success: true, message: '白名单已重新加载' };
  } catch (error: any) {
    rcon.disconnect();
    return { success: false, message: `连接服务器失败: ${error.message}` };
  }
}
