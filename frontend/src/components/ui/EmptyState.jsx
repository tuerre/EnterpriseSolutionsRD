import { FolderOpen } from 'lucide-react';

export default function EmptyState({ message, icon: Icon = FolderOpen }) {
  return (
    <div style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, textAlign: 'center', padding: 24 }}>
      <Icon size={48} color="var(--text3)" />
      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'var(--text2)' }}>{message}</div>
    </div>
  );
}
