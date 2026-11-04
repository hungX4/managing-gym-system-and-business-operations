import { Link } from 'react-router-dom';
import { CATEGORY_LABEL, type PostListItem } from '../../../api/posts/post';
import { formatDate } from '../../../utils/format';

export default function PostCard({ post }: { post: PostListItem }) {
  return (
    <Link
      to={`/tin-tuc/${post.slug}`}
      className="flex flex-col border border-neutral-200 text-black transition hover:border-black"
    >
      <div className="aspect-video overflow-hidden bg-neutral-100">
        {post.thumbnail && (
          <img
            src={post.thumbnail}
            alt={post.title}
            loading="lazy"
            className="block h-full w-full object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <div className="mb-2 flex justify-between text-xs uppercase tracking-wide text-neutral-500">
          <span>{CATEGORY_LABEL[post.category]}</span>
          <span>{formatDate(post.publishedAt)}</span>
        </div>
        <h3 className="mb-2 text-lg font-bold leading-snug">{post.title}</h3>
        {post.excerpt && (
          <p className="line-clamp-3 text-sm text-neutral-500">{post.excerpt}</p>
        )}
      </div>
    </Link>
  );
}
