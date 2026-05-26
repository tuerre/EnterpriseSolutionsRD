export default function SkeletonRow({ cols = 4 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, index) => (
        <td key={index} style={{ padding: '14px 12px', borderBottom: '1px solid var(--border)' }}>
          <div
            style={{
              height: 14,
              borderRadius: 2,
              background: 'var(--surface3)',
              animation: 'pulse 1.2s ease-in-out infinite'
            }}
          />
        </td>
      ))}
    </tr>
  );
}
