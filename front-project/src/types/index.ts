export interface Article {
    id: number;
    title: string;
    content: string;
    excerpt?: string;
    author_id: number;
    category_id: number;
    views: number;
    created_at: string;
    updated_at: string;
}

export interface ArticleDetail {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string[];
    author: string;
    date: string;
    status: string;
}

export interface Category {
    id: number;
    name: string;
    description: string;
    created_at: string;
}

export interface Tag {
    id: number;
    name: string;
    created_at: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'editor' | 'author' | 'subscriber';
    status: 'active' | 'inactive';
    created_at: string;
}

export interface Friend {
    id: number;
    name: string;
    url: string;
    description: string;
    status: 'active' | 'inactive';
    created_at: string;
}

export interface Comment {
    id: number;
    article_id: number;
    user_id: number;
    content: string;
    author: string;
    status: 'approved' | 'pending' | 'rejected';
    created_at: string;
    likes: number;
}

export interface Stats {
    articles: number;
    tags: number;
    friends: number;
    categories: number;
    users: number;
    views: number;
}