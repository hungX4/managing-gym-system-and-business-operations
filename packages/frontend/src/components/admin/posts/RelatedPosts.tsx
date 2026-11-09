import { useEffect, useState } from 'react';
import { getPosts } from '../../../api/posts/posts.api';
import PostCard from './PostCard';
import { shuffle } from '../../../utils/format';
import type { PostListItem } from '../../../api/posts/post';

const MIN_POSTS = 1; // chỉ hiện khi blog có từ 5 bài trở lên
const SHOW = 3;

export default function RelatedPosts({ currentSlug }: { currentSlug: string }) {
  const [items, setItems] = useState<PostListItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    getPosts({ page: 1, limit: 8 })
      .then((res: any) => {
        if (cancelled) return;

        // 1. Kiểm tra an toàn: Lấy mảng items (Xử lý cả trường hợp res bị lồng hay không)
        const list: PostListItem[] = Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res?.items?.items)
            ? res.items.items
            : [];

        const total = res?.meta?.total ?? list.length;

        // 2. Nếu tổng bài viết ít hơn MIN_POSTS (5 bài), không hiển thị bài liên quan
        if (total < MIN_POSTS || list.length === 0) {
          return setItems([]);
        }

        // 3. Lọc bỏ bài viết đang xem hiện tại
        const others = list.filter((p) => p.slug !== currentSlug);
        setItems(shuffle(others).slice(0, SHOW));
      })
      .catch((err) => {
        console.error('RelatedPosts fetch error:', err); // Log lỗi ra console để debug
        setItems([]);
      });

    return () => {
      cancelled = true;
    };
  }, [currentSlug]);

  return (
    <section className="mt-16 border-t border-neutral-200 pt-8">
      <h2 className="mb-6 text-2xl font-bold">Bài viết liên quan</h2>
      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  );
}
