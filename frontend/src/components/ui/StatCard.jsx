export default function StatCard({ title, value, icon: Icon, subtitle }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>{title}</div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36, fontWeight: 300, color: 'var(--text)', lineHeight: 1.05, marginTop: 8 }}>{value}</div>
          {subtitle ? <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text3)' }}>{subtitle}</div> : null}
        </div>
        {Icon ? <Icon size={20} color="var(--text3)" /> : null}
      </div>
    </div>
  );
}
