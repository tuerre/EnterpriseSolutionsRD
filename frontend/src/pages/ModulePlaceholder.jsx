export default function ModulePlaceholder({ title }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: 32 }}>
      <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 300, marginBottom: 12 }}>{title}</h1>
      <p style={{ color: 'var(--text2)', lineHeight: 1.7 }}>Este módulo está conectado al backend, pero su vista detallada será completada con la siguiente capa de formularios y tablas específicas.</p>
    </div>
  );
}
