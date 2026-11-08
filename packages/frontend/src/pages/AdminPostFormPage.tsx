import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Post, PostFormValues } from '../api/posts/post';
import { adminCreatePost, adminGetPost, adminUpdatePost } from '../api/posts/posts.api';
import { getErrorMessage } from '../utils/format';
import { backLink, btn, containerNarrow, errorText, muted, pageTitle } from '../styles/ui';
import PostForm from '../components/admin/PostForm';

export default function AdminPostFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const postId = id ? Number(id) : null;
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!postId || isNaN(postId)) {
      if (isEdit) setError('ID bài viết không hợp lệ');
      return;
    }

    setLoading(true);
    adminGetPost(postId)
      .then(setPost)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [postId, isEdit]);

  const handleSubmit = async (values: PostFormValues) => {
    setSubmitting(true);
    setError('');
    try {
      if (isEdit && postId) await adminUpdatePost(postId, values);
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

  if (isEdit && (!post || isNaN(postId!))) {
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