export default function Spinner({ size = 16 }) {
  return (
    <span
      aria-label="Cargando"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'inline-block',
        border: '2px solid var(--border)',
        borderTopColor: 'var(--text)',
        animation: 'spin 0.8s linear infinite'
      }}
    />
  );
}
