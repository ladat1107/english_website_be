export interface SendMailOptions {
    to: string;
    subject: string;
    template?: string;
    context?: Record<string, any>;
    html?: string;
}

export interface ClassScheduleMailContext {
    userName: string;
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    link: string;
}