import type { Paginated } from "../api/posts/post";

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getErrorMessage(err: unknown): string {
  const e = err as { response?: { data?: { message?: string | string[] } }; message?: string };
  const msg = e.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  return msg ?? e.message ?? 'Có lỗi xảy ra';
}



export function toPaginationMeta<T>({ items, meta }: Paginated<T>) {
  return {
    currentPage: meta.page,
    totalPages: meta.totalPages,
    totalItems: meta.total,
    itemsPerPage: meta.limit,
    itemCount: items.length,
  };
}