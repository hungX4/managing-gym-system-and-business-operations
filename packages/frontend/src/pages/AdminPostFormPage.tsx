import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Post, PostFormValues } from '../api/posts/post';
import { adminCreatePost, adminGetPost, adminUpdatePost } from '../api/posts/posts.api';
import { getErrorMessage } from '../utils/format';
import { backLink, btn, containerNarrow, errorText, muted, pageTitle } from '../styles/ui';
import PostForm from '../components/admin/PostForm';

// Dùng chung cho tạo mới (/admin/posts/new) và sửa (/admin/posts/:id/edit)
export default function AdminPostFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    adminGetPost(Number(id))
      .then(setPost)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (values: PostFormValues) => {
    setSubmitting(true);
    setError('');
    try {
      if (isEdit) await adminUpdatePost(Number(id), values);
      else await adminCreatePost(values);
      navigate('/admin/posts');
    } catch (e) {
      setError(getErrorMessage(e));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className={containerNarrow}>
        <p className={muted}>Đang tải...</p>
      </main>
    );
  }

  if (isEdit && !post) {
    return (
      <main className={containerNarrow}>
        <p className={`${errorText} mb-4`}>{error || 'Không tìm thấy bài viết'}</p>
        <Link to="/admin/posts" className={btn}>
          ← Quay lại
        </Link>
      </main>
    );
  }

  return (
    <main className={containerNarrow}>
      <Link to="/admin/posts" className={backLink}>
        ← Quản lý bài viết
      </Link>
      <h1 className={pageTitle}>{isEdit ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}</h1>

      {/* Form chỉ mount sau khi đã có dữ liệu, nên initialValues luôn đúng */}
      <PostForm
        initialValues={
          post
            ? {
              title: post.title,
              content: post.content,
              excerpt: post.excerpt ?? '',
              metaDescription: post.metaDescription ?? '',
              category: post.category,
              status: post.status,
            }
            : undefined
        }
        currentThumbnail={post?.thumbnail}
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
