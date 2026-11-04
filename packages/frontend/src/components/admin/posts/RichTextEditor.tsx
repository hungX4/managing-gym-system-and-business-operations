import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { richContent } from '../../../styles/ui';

interface Props {
  value: string;
  onChange: (html: string) => void;
}

// Chỉ dùng các thẻ nằm trong whitelist của sanitize-html bên backend:
// p, h2, h3, b/strong, i/em, ul, ol, li, blockquote, a, img, br
export default function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } }), Image],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? '' : editor.getHTML()),
  });

  if (!editor) return null;

  const btn = (text: string, active: boolean, run: () => void) => (
    <button
      type="button"
      onClick={run}
      className={`border px-2.5 py-1 text-[13px] ${active
        ? 'border-black bg-black text-white'
        : 'border-neutral-300 bg-white text-black hover:border-black'
        }`}
    >
      {text}
    </button>
  );

  const insertImage = () => {
    const url = window.prompt('Dán URL ảnh (https://...)');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="border border-neutral-300 focus-within:border-black">
      <div className="flex flex-wrap gap-1 border-b border-neutral-300 bg-neutral-50 p-2">
        {btn('B', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run())}
        {btn('I', editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run())}
        {btn('H2', editor.isActive('heading', { level: 2 }), () =>
          editor.chain().focus().toggleHeading({ level: 2 }).run(),
        )}
        {btn('H3', editor.isActive('heading', { level: 3 }), () =>
          editor.chain().focus().toggleHeading({ level: 3 }).run(),
        )}
        {btn('• Danh sách', editor.isActive('bulletList'), () =>
          editor.chain().focus().toggleBulletList().run(),
        )}
        {btn('1. Danh sách', editor.isActive('orderedList'), () =>
          editor.chain().focus().toggleOrderedList().run(),
        )}
        {btn('Trích dẫn', editor.isActive('blockquote'), () =>
          editor.chain().focus().toggleBlockquote().run(),
        )}
        {btn('Ảnh (URL)', false, insertImage)}
      </div>
      <EditorContent
        editor={editor}
        className={`${richContent} [&_.ProseMirror]:min-h-80 [&_.ProseMirror]:p-4 [&_.ProseMirror]:leading-7 [&_.ProseMirror]:outline-none`}
      />
    </div>
  );
}
