// Các chuỗi class Tailwind dùng lại nhiều nơi (tông đen - trắng)

const btnBase =
  'inline-flex items-center justify-center border border-black px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40';

export const btn = `${btnBase} bg-white text-black hover:bg-black hover:text-white`;
export const btnPrimary = `${btnBase} bg-black text-white hover:bg-neutral-700`;
export const btnSm = 'px-2.5 py-1 text-[13px]';
export const btnDanger =
  'inline-flex items-center justify-center border border-red-700 bg-white px-2.5 py-1 text-[13px] font-semibold text-red-700 transition hover:bg-red-700 hover:text-white';

export const input =
  'w-full border border-neutral-300 bg-white px-3 py-2.5 text-black outline-none focus:border-black';
export const label = 'text-sm font-bold';
export const hint = 'text-xs text-neutral-500';
export const errorText = 'text-sm text-red-700';
export const muted = 'text-neutral-500';

export const container = 'mx-auto max-w-6xl bg-white px-5 pb-16 pt-8 text-black';
export const containerNarrow = 'mx-auto max-w-3xl bg-white px-5 pb-16 pt-8 text-black';
export const pageTitle = 'mb-6 text-3xl font-extrabold tracking-tight';
export const backLink = 'mb-5 inline-block text-sm text-black hover:underline';

// Style cho HTML do editor sinh ra (Tailwind preflight đã xóa style mặc định của h2, ul, ...)
export const richContent =
  '[&_h2]:mb-3 [&_h2]:mt-9 [&_h2]:text-2xl [&_h2]:font-bold ' +
  '[&_h3]:mb-2 [&_h3]:mt-7 [&_h3]:text-xl [&_h3]:font-bold ' +
  '[&_p]:my-4 ' +
  '[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 ' +
  '[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 ' +
  '[&_img]:my-5 [&_img]:h-auto [&_img]:max-w-full ' +
  '[&_a]:underline ' +
  '[&_blockquote]:my-5 [&_blockquote]:border-l-4 [&_blockquote]:border-black [&_blockquote]:pl-5 [&_blockquote]:text-neutral-700';
