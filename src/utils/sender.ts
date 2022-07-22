import axios from 'axios';
import { EventType, Event, getEvent } from './event';
import { Queue } from 'queue-typescript';
import { ONE_SEC_MILLISECONDS } from '../constants';

const DOMAIN = "http://10.199.149.204:8080";

const timeout = ONE_SEC_MILLISECONDS * 5;
const MIS_ID = process.env.MIS_ID;
const RW_TOKEN = process.env.ORG_JETBRAINS_PROJECTOR_SERVER_HANDSHAKE_TOKEN;
// const MIS_ID = "wangdaben";
// const RW_TOKEN = "1f96762040ed40f88cdc5043409ead71";

const eventQueue = new Queue<Event>();

export async function putEvent(eventType: EventType) {
    // 队列中添加事件
    putEventWithRawData(eventType, null);
}

export async function putEventWithRawData(eventType: EventType, rawData: any) {
    // 队列中添加事件
    const event = getEvent(eventType, Date.parse(new Date().toString()), rawData === null ? null : JSON.stringify(rawData));
    eventQueue.enqueue(event);
}

function getEventList(): Array<Event> {
    // 每次读取一定数量的事件进行发送
    let maxSize = 50;
    let i: number;
    let eventList: Array<Event> = new Array();
    for (i = 0; i < maxSize; i++) {
        let event = eventQueue.dequeue();
        if (event) {
            eventList.push(event);
        } else {
            break;
        }
    }
    return eventList;
}


export async function sendEventToServer() {
    // 获取队列中缓存的事件
    const eventList = getEventList();
    const request = {
        misId: MIS_ID,
        rwToken: RW_TOKEN,
        eventList: eventList,
    };

    if (eventList.length <= 0) {
        return;
    }

    try {
        const response = await send("/api/1.0/projector/event/record/add", MIS_ID!, request);

        if (!isResponseOk(response)) {
            console.log("发送失败，response: ", response.data);
        }
    } catch (e) {
        // error log
        throw e;
    }

}

async function send(api: string, misId: string, data: any) {
    const response = await axios({
        method: 'post',
        headers: {
            'Authorization': misId
        },
        url: `${DOMAIN}${api}`,
        timeout: timeout,
        data: data,
    });
    return response;
}

function isResponseOk(response: any) {
    return response.status === 200 && response.data && response.data.code === 0;
}