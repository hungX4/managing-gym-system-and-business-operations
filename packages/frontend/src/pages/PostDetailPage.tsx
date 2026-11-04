import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { backLink, btn, container, muted, pageTitle, richContent } from '../styles/ui';
import { formatDate } from '../utils/format';
import { getPostBySlug } from '../api/posts/posts.api';
import RelatedPosts from '../components/admin/posts/RelatedPosts';
import { CATEGORY_LABEL, type Post } from '../api/posts/post';

export default function PostDetailPage() {
  const { slug = '' } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    getPostBySlug(slug)
      .then((p) => {
        if (cancelled) return;
        setPost(p);
        document.title = p.title;
        window.scrollTo({ top: 0 });
      })
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className={container}>
        <p className={muted}>Đang tải...</p>
      </main>
    );
  }

  if (notFound || !post) {
    return (
      <main className={container}>
        <h1 className={pageTitle}>Không tìm thấy bài viết</h1>
        <Link to="/tin-tuc" className={btn}>
          ← Về trang tin tức
        </Link>
      </main>
    );
  }

  return (
    <main className={container}>
      <article className="mx-auto max-w-3xl">
        <Link to="/tin-tuc" className={backLink}>
          ← Tin tức
        </Link>

        <div className="flex gap-4 text-[13px] uppercase tracking-wide text-neutral-500">
          <span>{CATEGORY_LABEL[post.category]}</span>
          <span>{formatDate(post.publishedAt)}</span>
        </div>
        <h1 className="mb-6 mt-3 text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
          {post.title}
        </h1>

        {post.thumbnail && (
          <img
            src={post.thumbnail}
            alt={post.title}
            className="mb-8 block max-h-[460px] w-full object-cover"
          />
        )}

        <div
          className={`text-[17px] leading-relaxed ${richContent}`}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />
      </article>

      <RelatedPosts currentSlug={post.slug} />
    </main>
  );
}
