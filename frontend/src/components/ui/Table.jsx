import EmptyState from './EmptyState';
import SkeletonRow from './SkeletonRow';

export default function Table({ columns, data = [], isLoading = false, emptyMessage = 'No hay registros para mostrar' }) {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div style={{ overflowX: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={{ textAlign: 'left', padding: '14px 12px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text2)', borderBottom: '1px solid var(--border)', fontWeight: 400 }}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => <SkeletonRow key={index} cols={columns.length} />)
            : hasData
              ? data.map((row, rowIndex) => (
                  <tr key={row.id ?? rowIndex} style={{ transition: 'background 150ms ease' }} onMouseEnter={(event) => (event.currentTarget.style.background = 'var(--surface2)')} onMouseLeave={(event) => (event.currentTarget.style.background = 'transparent')}>
                    {columns.map((column) => (
                      <td key={column.key} style={{ padding: '14px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text)', verticalAlign: 'top' }}>
                        {column.render ? column.render(row) : row[column.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))
              : (
                <tr>
                  <td colSpan={columns.length} style={{ padding: 0 }}>
                    <EmptyState message={emptyMessage} />
                  </td>
                </tr>
              )}
        </tbody>
      </table>
    </div>
  );
}
