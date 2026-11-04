import { useEffect, useState } from 'react';
import { getPosts } from '../../../api/posts/posts.api';
import PostCard from './PostCard';
import { shuffle } from '../../../utils/format';
import type { PostListItem } from '../../../api/posts/post';

const MIN_POSTS = 5; // chỉ hiện khi blog có từ 5 bài trở lên
const SHOW = 3;

export default function RelatedPosts({ currentSlug }: { currentSlug: string }) {
  const [items, setItems] = useState<PostListItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    getPosts({ page: 1, limit: 50 })
      .then(({ items, meta }) => {
        if (cancelled || meta.total < MIN_POSTS) return setItems([]);
        const others = items.filter((p) => p.slug !== currentSlug);
        setItems(shuffle(others).slice(0, SHOW));
      })
      .catch(() => setItems([]));
    return () => {
      cancelled = true;
    };
  }, [currentSlug]);

  if (items.length === 0) return null;

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
