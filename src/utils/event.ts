

export enum EventType {
    OPEN = 'OPEN',
    CLOSE = 'CLOSE',
    KEY_PRESS = 'KEY_PRESS',
    MOUSE = 'MOUSE',
}

export interface Event {
    type: EventType;
    createTime: number;
    rawData: string | null;
}

export function getEvent(type: EventType, createTime:number, rawData: string | null): Event {
    return {
        type,
        createTime,
        rawData
    };
}