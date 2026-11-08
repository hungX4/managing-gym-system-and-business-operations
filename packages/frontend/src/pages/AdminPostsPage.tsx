import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminDeletePost, adminGetPosts } from '../api/posts/posts.api';
import Pagination from '../components/admin/posts/Pagination';
import { btn, btnDanger, btnPrimary, btnSm, container, errorText, input, muted, pageTitle } from '../styles/ui';
import {
  CATEGORY_LABEL,
  STATUS_LABEL,
  type Paginated,
  type PostCategory,
  type PostListItem,
  type PostStatus,
} from '../api/posts/post';
import { formatDate, getErrorMessage } from '../utils/format';

const LIMIT = 10;
const th = 'border-b-2 border-black px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide';
const td = 'border-b border-neutral-200 px-3 py-3 align-middle';

export default function AdminPostsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PostStatus | ''>('');
  const [category, setCategory] = useState<PostCategory | ''>('');
  const [search, setSearch] = useState('');
  const [keyword, setKeyword] = useState('');
  const [data, setData] = useState<Paginated<PostListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    adminGetPosts({ page, limit: LIMIT, status, category, search: keyword })
      .then(setData)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [page, status, category, keyword]);

  useEffect(load, [load]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    // Tự động clear kết quả tìm kiếm khi rỗng
    if (val.trim() === '' && keyword !== '') {
      setKeyword('');
      setPage(1);
    }
  };

  const handleDelete = async (post: PostListItem) => {
    if (!window.confirm(`Xóa bài "${post.title}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await adminDeletePost(post.id);
      if (data && data.items.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        load();
      }
    } catch (e) {
      alert(getErrorMessage(e));
    }
  };

  return (
    <main className={container}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h1 className={pageTitle}>Quản lý bài viết</h1>
        <Link to="/admin/posts/new" className={btnPrimary}>
          + Viết bài mới
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setKeyword(search.trim());
            setPage(1);
          }}
        >
          <input
            className={input}
            placeholder="Tìm theo tiêu đề..."
            value={search}
            onChange={handleSearchChange}
          />
          <button className={btn} type="submit">
            Tìm
          </button>
        </form>

        <select
          className={`${input} !w-auto`}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as PostStatus | '');
            setPage(1);
          }}
        >
          <option value="">Mọi trạng thái</option>
          {Object.entries(STATUS_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>

        <select
          className={`${input} !w-auto`}
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as PostCategory | '');
            setPage(1);
          }}
        >
          <option value="">Mọi danh mục</option>
          {Object.entries(CATEGORY_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {error && <p className={errorText}>{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className={th}>Ảnh</th>
              <th className={th}>Tiêu đề</th>
              <th className={th}>Danh mục</th>
              <th className={th}>Trạng thái</th>
              <th className={th}>Ngày tạo</th>
              <th className={th} />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className={`${td} ${muted}`}>
                  Đang tải...
                </td>
              </tr>
            )}
            {!loading && data?.items.length === 0 && (
              <tr>
                <td colSpan={6} className={`${td} ${muted}`}>
                  Không có bài viết.
                </td>
              </tr>
            )}
            {!loading &&
              data?.items.map((p) => (
                <tr key={p.id}>
                  <td className={td}>
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt="" className="block h-10 w-16 object-cover" />
                    ) : (
                      <div className="h-10 w-16 bg-neutral-100" />
                    )}
                  </td>
                  <td className={td}>{p.title}</td>
                  <td className={td}>{CATEGORY_LABEL[p.category] ?? p.category ?? '—'}</td>
                  <td className={td}>
                    {p.status && (
                      <span
                        className={`inline-block border border-black px-2.5 py-0.5 text-xs ${p.status === 'PUBLISHED' ? 'bg-black text-white' : ''
                          }`}
                      >
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    )}
                  </td>
                  <td className={td}>{formatDate(p.createdAt)}</td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    <span className="inline-flex gap-1.5">
                      {p.status === 'PUBLISHED' && (
                        <Link
                          className={`${btn} ${btnSm}`}
                          to={`/tin-tuc/${p.slug}`}
                          target="_blank"
                        >
                          Xem
                        </Link>
                      )}
                      <Link className={`${btn} ${btnSm}`} to={`/admin/posts/${p.id}/edit`}>
                        Sửa
                      </Link>
                      <button className={btnDanger} onClick={() => handleDelete(p)}>
                        Xóa
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {data && (
        <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} />
      )}
    </main>
  );
}