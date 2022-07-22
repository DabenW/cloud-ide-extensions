import { workspace, commands, ExtensionContext, OutputChannel } from 'vscode';
import { WebSocketServer, WebSocket } from 'ws';
import { EventType } from './utils/event';
import { sendEventToServer, putEvent, putEventWithRawData } from './utils/sender';

/**
 * 处理连接的 server
 */
const wss = new WebSocketServer({ port: 3000 });

export class SocketServer {

    public async activate() {
        let misId = process.env.LOGNAME;
        console.log("启动插件 websocket, misId: %s", misId);
        // 引用Server类
        // const wss = new WebSocketServer({ port: 3000 });

        wss.on('connection', function connection(wsConnect) {
            console.log('[server][activate] client connected');
            // 添加连接记录
            putEvent(EventType.OPEN);

            wsConnect.on('message', function message(data) {
                console.log('received: %s', data);
            });

            wsConnect.on("close", function close() {
                console.log("[server][activate] close");
                let allClosed = true;
                wss.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN) {
                        allClosed = false;
                    }
                });
                if (wss.clients.size === 0 || allClosed) {
                    console.log("[server][activate] all client closed");
                    putEvent(EventType.CLOSE);
                }
            });
        });
    }

    public async deactivate() {
        wss.close();
    }
}



/**
 * 实例化
 */
let socketServer: SocketServer;
export function getInterface() {
    if (!socketServer) {
        socketServer = new SocketServer();
    }
    return socketServer;
}