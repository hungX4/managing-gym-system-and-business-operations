export type PostCategory = 'news' | 'promotion' | 'training' | 'nutrition';
export type PostStatus = 'draft' | 'published';

export const CATEGORY_LABEL: Record<PostCategory, string> = {
  news: 'Tin tức',
  promotion: 'Khuyến mãi',
  training: 'Kiến thức tập luyện',
  nutrition: 'Dinh dưỡng',
};

export const STATUS_LABEL: Record<PostStatus, string> = {
  draft: 'Nháp',
  published: 'Đã đăng',
};

export interface PostListItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail: string | null;
  category: PostCategory;
  publishedAt: string | null;
  createdAt: string;
  status?: PostStatus; // chỉ có ở API admin
}

export interface Post extends PostListItem {
  content: string;
  status: PostStatus;
  metaDescription: string | null;
}

export interface Paginated<T> {
  items: T[];
  meta: { total: number; page: number; limit: number; totalPages: number, currentPage: number; };
}

export interface PostQuery {
  page?: number;
  limit?: number;
  category?: PostCategory | '';
  search?: string;
  status?: PostStatus | '';
}

export interface PostFormValues {
  title: string;
  content: string;
  excerpt: string;
  metaDescription: string;
  category: PostCategory;
  status: PostStatus;
  thumbnailFile: File | null;
}
