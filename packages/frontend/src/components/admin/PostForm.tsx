import { useEffect, useState, type FormEvent } from 'react';
import {
  CATEGORY_LABEL,
  STATUS_LABEL,
  type PostCategory,
  type PostFormValues,
  type PostStatus,
} from '../../api/posts/post';
import { btn, btnPrimary, errorText, hint, input, label } from '../../styles/ui';
import RichTextEditor from './posts/RichTextEditor';

interface Props {
  initialValues?: Partial<PostFormValues>;
  currentThumbnail?: string | null; // ảnh bìa hiện tại khi sửa
  submitting?: boolean;
  error?: string;
  onSubmit: (values: PostFormValues) => void;
}

const EMPTY: PostFormValues = {
  title: '',
  content: '',
  excerpt: '',
  metaDescription: '',
  category: 'NEWS',
  status: 'DRAFT',
  thumbnail: null,
};

export default function PostForm({
  initialValues,
  currentThumbnail,
  submitting,
  error,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<PostFormValues>({ ...EMPTY, ...initialValues });
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState('');

  const set = <K extends keyof PostFormValues>(key: K, v: PostFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  // Dọn URL tạm của preview
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onSelectFile = (file: File | null) => {
    set('thumbnail', file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = (e: FormEvent | React.MouseEvent, status?: PostStatus) => {
    e.preventDefault();
    if (!values.title.trim()) return setLocalError('Vui lòng nhập tiêu đề');
    if (!values.content.trim()) return setLocalError('Vui lòng nhập nội dung');
    setLocalError('');
    onSubmit({ ...values, title: values.title.trim(), status: status ?? values.status });
  };

  const shownThumb = preview ?? currentThumbnail ?? null;

  return (
    <form className="flex flex-col gap-5" onSubmit={(e) => handleSubmit(e)}>
      <div className="flex flex-col gap-1.5">
        <label className={label}>Tiêu đề *</label>
        <input
          className={input}
          value={values.title}
          maxLength={255}
          onChange={(e) => set('title', e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1.5">
          <label className={label}>Danh mục</label>
          <select
            className={input}
            value={values.category}
            onChange={(e) => set('category', e.target.value as PostCategory)}
          >
            {Object.entries(CATEGORY_LABEL).map(([k, text]) => (
              <option key={k} value={k}>
                {text}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label className={label}>Trạng thái</label>
          <select
            className={input}
            value={values.status}
            onChange={(e) => set('status', e.target.value as PostStatus)}
          >
            {Object.entries(STATUS_LABEL).map(([k, text]) => (
              <option key={k} value={k}>
                {text}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={label}>Ảnh bìa</label>
        {shownThumb && (
          <img
            src={shownThumb}
            alt="Ảnh bìa"
            className="max-h-52 max-w-xs border border-neutral-200 object-cover"
          />
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="text-sm file:mr-3 file:cursor-pointer file:border file:border-black file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold hover:file:bg-black hover:file:text-white"
          onChange={(e) => onSelectFile(e.target.files?.[0] ?? null)}
        />
        <small className={hint}>
          JPG, PNG hoặc WEBP, tối đa 5MB. Ảnh chỉ được tải lên khi bạn bấm Lưu.
        </small>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={label}>Tóm tắt (hiện ở danh sách bài viết)</label>
        <textarea
          className={`${input} resize-y`}
          rows={3}
          maxLength={500}
          value={values.excerpt}
          onChange={(e) => set('excerpt', e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={label}>Mô tả SEO (tối đa 160 ký tự)</label>
        <input
          className={input}
          maxLength={160}
          value={values.metaDescription}
          onChange={(e) => set('metaDescription', e.target.value)}
        />
        <small className={hint}>{values.metaDescription.length}/160</small>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={label}>Nội dung *</label>
        <RichTextEditor value={values.content} onChange={(html) => set('content', html)} />
      </div>

      {(localError || error) && <p className={errorText}>{localError || error}</p>}

      <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4">
        <button
          type="button"
          className={btn}
          disabled={submitting}
          onClick={(e) => handleSubmit(e, 'DRAFT')}
        >
          Lưu nháp
        </button>
        <button
          type="button"
          className={btnPrimary}
          disabled={submitting}
          onClick={(e) => handleSubmit(e, 'PUBLISHED')}
        >
          {submitting ? 'Đang lưu...' : 'Xuất bản'}
        </button>
      </div>
    </form>
  );
}
