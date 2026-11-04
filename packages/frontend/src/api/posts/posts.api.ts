
import axiosClient from '../axiosClient';
import type { Paginated, Post, PostFormValues, PostListItem, PostQuery } from './post';
// Bỏ các tham số rỗng để không gửi ?category=&search=
function clean(query: PostQuery) {
  return Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== '' && v !== undefined && v !== null),
  );
}

// Body multipart: backend nhận file ở field "thumbnail"
function toFormData(values: PostFormValues): FormData {
  const form = new FormData();
  form.append('title', values.title);
  form.append('content', values.content);
  form.append('excerpt', values.excerpt);
  form.append('metaDescription', values.metaDescription);
  form.append('category', values.category);
  form.append('status', values.status);
  if (values.thumbnailFile) form.append('thumbnail', values.thumbnailFile);
  return form;
}

// ---------- Public ----------
export const getPosts = (query: PostQuery = {}) =>
  axiosClient.get<Paginated<PostListItem>>('/posts', { params: clean(query) }).then((r) => r.data);

export const getPostBySlug = (slug: string) =>
  axiosClient.get<Post>(`/posts/${slug}`).then((r) => r.data);

// ---------- Admin ----------
export const adminGetPosts = (query: PostQuery = {}) =>
  axiosClient.get<Paginated<PostListItem>>('/admin/posts', { params: clean(query) }).then((r) => r.data);

export const adminGetPost = (id: number) =>
  axiosClient.get<Post>(`/admin/posts/${id}`).then((r) => r.data);

export const adminCreatePost = (values: PostFormValues) =>
  axiosClient.post<Post>('/admin/posts', toFormData(values)).then((r) => r.data);

export const adminUpdatePost = (id: number, values: PostFormValues) =>
  axiosClient.patch<Post>(`/admin/posts/${id}`, toFormData(values)).then((r) => r.data);

export const adminDeletePost = (id: number) =>
  axiosClient.delete(`/admin/posts/${id}`).then((r) => r.data);
