import React, { useRef, useState, useEffect } from 'react';
import { useI18n } from '../lib/i18n';

interface Props {
  initialValue: string;
  onSave: (content: string) => void;
  placeholder?: string;
}

const TEXT_COLORS = [
  { name: 'Ink Black', color: '#111111' },
  { name: 'Vermilion', color: '#ff3b1f' },
  { name: 'Klein Blue', color: '#1a34d6' },
  { name: 'Kelly Green', color: '#00994d' },
  { name: 'Imperial Purple', color: '#6a2ecf' },
];

const HIGHLIGHT_COLORS = [
  { name: 'None', color: 'transparent' },
  { name: 'Yellow Marker', color: '#fef08a' },
  { name: 'Pink Marker', color: '#fbcfe8' },
  { name: 'Mint Marker', color: '#bbf7d0' },
  { name: 'Sky Marker', color: '#bae6fd' },
  { name: 'Orange Marker', color: '#fed7aa' },
];

export const RichNotesEditor: React.FC<Props> = ({
  initialValue,
  onSave,
  placeholder,
}) => {
  const { t } = useI18n();
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedColor, setSelectedColor] = useState('#111111');
  const [selectedHighlight, setSelectedHighlight] = useState('transparent');
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showHighlightPalette, setShowHighlightPalette] = useState(false);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialValue) {
      editorRef.current.innerHTML = initialValue || '';
    }
  }, [initialValue]);

  const exec = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    triggerSave();
  };

  const applyTextColor = (color: string) => {
    setSelectedColor(color);
    exec('foreColor', color);
    setShowColorPalette(false);
  };

  const applyHighlightColor = (color: string) => {
    setSelectedHighlight(color);
    if (color === 'transparent') {
      exec('removeFormat');
    } else {
      exec('hiliteColor', color);
    }
    setShowHighlightPalette(false);
  };

  const triggerSave = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onSave(html);
      setSavedStatus(t('notesEditor.saved'));
      setTimeout(() => setSavedStatus(null), 2000);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        border: '2px solid var(--ink)',
        background: '#ffffff',
        boxShadow: 'var(--hard)',
        overflow: 'hidden',
      }}
    >
      {/* Word & Paint Formatting Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 8px',
          borderBottom: '2px solid var(--ink)',
          background: 'var(--paper)',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Basic Typography buttons */}
        <div style={{ display: 'inline-flex', border: '1.5px solid var(--ink)' }}>
          <button
            type="button"
            onClick={() => exec('bold')}
            title="Bold (Ctrl+B)"
            style={{
              padding: '4px 10px',
              fontWeight: 900,
              border: 'none',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => exec('italic')}
            title="Italic (Ctrl+I)"
            style={{
              padding: '4px 10px',
              fontStyle: 'italic',
              fontWeight: 700,
              border: 'none',
              borderLeft: '1px solid var(--ink)',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => exec('underline')}
            title="Underline (Ctrl+U)"
            style={{
              padding: '4px 10px',
              textDecoration: 'underline',
              fontWeight: 700,
              border: 'none',
              borderLeft: '1px solid var(--ink)',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            U
          </button>
          <button
            type="button"
            onClick={() => exec('strikeThrough')}
            title="Strikethrough"
            style={{
              padding: '4px 10px',
              textDecoration: 'line-through',
              fontWeight: 700,
              border: 'none',
              borderLeft: '1px solid var(--ink)',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            S
          </button>
        </div>

        {/* Structure: Headings & Lists */}
        <div style={{ display: 'inline-flex', border: '1.5px solid var(--ink)' }}>
          <button
            type="button"
            onClick={() => exec('formatBlock', '<h3>')}
            title="Subheading"
            style={{
              padding: '4px 8px',
              fontWeight: 800,
              border: 'none',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => exec('insertUnorderedList')}
            title="Bullet list"
            style={{
              padding: '4px 8px',
              border: 'none',
              borderLeft: '1px solid var(--ink)',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => exec('formatBlock', '<blockquote>')}
            title="Quote block"
            style={{
              padding: '4px 8px',
              border: 'none',
              borderLeft: '1px solid var(--ink)',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '11px',
              fontStyle: 'italic',
            }}
          >
            “ Quote
          </button>
        </div>

        {/* Paint: Text Colors Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => {
              setShowColorPalette(!showColorPalette);
              setShowHighlightPalette(false);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              border: '1.5px solid var(--ink)',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 800,
            }}
            title="Text Color"
          >
            <span
              style={{
                width: '12px',
                height: '12px',
                background: selectedColor,
                border: '1px solid var(--ink)',
                display: 'inline-block',
              }}
            />
            <span>{t('notesEditor.textColor')}</span>
            <span style={{ fontSize: '9px' }}>▾</span>
          </button>

          {showColorPalette && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                zIndex: 50,
                background: '#fff',
                border: '2px solid var(--ink)',
                boxShadow: 'var(--hard)',
                padding: '6px',
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '6px',
                maxWidth: 'calc(100vw - 32px)',
              }}
            >
              {TEXT_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => applyTextColor(c.color)}
                  title={c.name}
                  style={{
                    width: '22px',
                    height: '22px',
                    background: c.color,
                    border: '1.5px solid var(--ink)',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Paint: Highlighter / Background Marker */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => {
              setShowHighlightPalette(!showHighlightPalette);
              setShowColorPalette(false);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              border: '1.5px solid var(--ink)',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 800,
            }}
            title="Highlighter / Paint Marker"
          >
            <span
              style={{
                width: '12px',
                height: '12px',
                background: selectedHighlight === 'transparent' ? '#fff' : selectedHighlight,
                border: '1px solid var(--ink)',
                display: 'inline-block',
              }}
            />
            <span>{t('notesEditor.highlight')}</span>
            <span style={{ fontSize: '9px' }}>▾</span>
          </button>

          {showHighlightPalette && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                zIndex: 50,
                background: '#fff',
                border: '2px solid var(--ink)',
                boxShadow: 'var(--hard)',
                padding: '6px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '6px',
                maxWidth: 'calc(100vw - 32px)',
              }}
            >
              {HIGHLIGHT_COLORS.map((h) => (
                <button
                  key={h.name}
                  type="button"
                  onClick={() => applyHighlightColor(h.color)}
                  title={h.name}
                  style={{
                    width: '26px',
                    height: '22px',
                    background: h.color === 'transparent' ? '#ffffff' : h.color,
                    border: '1.5px solid var(--ink)',
                    cursor: 'pointer',
                    fontSize: '9px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {h.color === 'transparent' ? '✕' : ''}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status / Save Action */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {savedStatus && (
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)' }}>
              ✓ {savedStatus}
            </span>
          )}
          <button
            type="button"
            onClick={triggerSave}
            className="btn btn--primary"
            style={{ fontSize: '10.5px', padding: '3px 10px', boxShadow: 'none' }}
          >
            {t('notesEditor.saveNotes')}
          </button>
        </div>
      </div>

      {/* Clean White Writing Canvas */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={triggerSave}
        onBlur={triggerSave}
        data-placeholder={placeholder || t('notesEditor.placeholder')}
        style={{
          minHeight: '160px',
          maxHeight: '340px',
          overflowY: 'auto',
          padding: '12px 14px',
          fontSize: '14.5px',
          lineHeight: 1.65,
          fontFamily: 'var(--font-body)',
          color: 'var(--ink)',
          outline: 'none',
          boxSizing: 'border-box',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          background: '#ffffff',
          width: '100%',
          maxWidth: '100%',
        }}
      />
    </div>
  );
};