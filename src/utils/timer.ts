import { sendEventToServer } from './sender';
import { sendEventDurationMins } from '../constants';

let eventSenderTimer: NodeJS.Timeout;


export async function activate() {
    eventSenderTimer = setInterval(() => {
        sendEventToServer().catch((e) => {
            console.log("[timer][active] 定时发送失败", e);
        });
    }, sendEventDurationMins);
}

export async function deactivate() {
    if (eventSenderTimer) {
        clearInterval(eventSenderTimer);
    }
    // 卸载前再发送一次数据
    await sendEventToServer();
}