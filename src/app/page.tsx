export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-parchment">
      <main className="flex flex-col items-center gap-8 px-6 text-center">
        <h1 className="text-6xl font-bold tracking-tight text-ink">
          卧龙学堂
        </h1>
        <p className="text-xl text-bamboo">
          用Python征服三国
        </p>
        <button className="rounded-lg bg-shu-red px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-shu-red/90">
          开始游戏
        </button>
      </main>
    </div>
  );
}
