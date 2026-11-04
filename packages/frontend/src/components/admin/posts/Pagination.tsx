import { btn } from '../../../styles/ui';

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-10 flex items-center justify-center gap-4 text-sm">
      <button className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← Trước
      </button>
      <span>
        Trang {page} / {totalPages}
      </span>
      <button className={btn} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Sau →
      </button>
    </div>
  );
}
