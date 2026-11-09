import { useEffect, useState } from 'react';
import { btn, container, errorText, input, muted, pageTitle } from '../styles/ui';
import {
  CATEGORY_LABEL,
  type Paginated,
  type PostCategory,
  type PostListItem,
} from '../api/posts/post';
import { getPosts } from '../api/posts/posts.api';
import PostCard from '../components/admin/posts/PostCard';
import Pagination from '../components/admin/posts/Pagination';

const LIMIT = 9;

export default function PostsPage() {
  const [category, setCategory] = useState<PostCategory | ''>('');
  const [search, setSearch] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<PostListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getPosts({ page, limit: LIMIT, category, search: keyword })
      .then((res) => !cancelled && setData(res.items))
      .catch(() => !cancelled && setError('Không tải được danh sách bài viết'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, category, keyword]);

  const changeCategory = (c: PostCategory | '') => {
    setCategory(c);
    setPage(1);
  };

  const tab = (active: boolean) =>
    `border-b-2 px-3.5 py-2 text-sm ${active
      ? 'border-black font-bold text-black'
      : 'border-transparent text-neutral-500 hover:text-black'
    }`;

  return (
    <main className={container}>
      <h1 className={pageTitle}>Tin tức</h1>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1">
          <button className={tab(category === '')} onClick={() => changeCategory('')}>
            Tất cả
          </button>
          {(Object.keys(CATEGORY_LABEL) as PostCategory[]).map((c) => (
            <button key={c} className={tab(category === c)} onClick={() => changeCategory(c)}>
              {CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setKeyword(search.trim());
            setPage(1);
          }}
        >
          <input
            className={input}
            placeholder="Tìm bài viết..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className={btn} type="submit">
            Tìm
          </button>
        </form>
      </div>

      {error && <p className={errorText}>{error}</p>}
      {loading && <p className={muted}>Đang tải...</p>}

      {!loading && data && data.items.length === 0 && (
        <p className={muted}>Chưa có bài viết nào.</p>
      )}

      {data && data.items.length > 0 && (
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}

      {data && (
        <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} />
      )}
    </main>
  );
}
