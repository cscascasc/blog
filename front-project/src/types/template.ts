export interface Template {
    id: number;
    name: string;
    description: string;
    content: any;
    type: string;
    created_at: string;
}

export interface Content {
    id: number;
    title: string;
    description: string;
    content: any;
    created_at: string;
}