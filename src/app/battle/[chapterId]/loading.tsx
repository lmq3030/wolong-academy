export default function BattleLoading() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: 'var(--color-parchment)' }}
    >
      <div
        className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
        style={{
          borderColor: 'var(--color-shu-red)',
          borderTopColor: 'transparent',
        }}
      />
      <p className="mt-4 text-lg" style={{ color: 'var(--color-ink)' }}>
        军师正在布阵...
      </p>
    </div>
  );
}
