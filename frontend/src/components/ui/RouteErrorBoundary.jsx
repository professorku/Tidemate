import { Component } from 'react'

export default class RouteErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Detect lazy-chunk loading failures specifically
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      /Loading chunk|Failed to fetch dynamically imported module/i.test(
        error?.message || ''
      )
    console.error('Route error:', error, info, { isChunkError })
    this.setState({ isChunkError })
  }

  handleReload = () => {
    // For chunk errors, hard-reload to pick up new index.html
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      return (
        <main className="min-h-screen bg-[#071d32] p-8 text-white">
          <div className="mx-auto max-w-xl rounded-2xl border border-gold/20 bg-navy p-6">
            <h1 className="text-2xl font-black">Something went wrong</h1>
            <p className="mt-2 text-white/70">
              {this.state.isChunkError
                ? 'A new version was deployed. Reload to continue.'
                : this.state.error.message}
            </p>
            <pre className="mt-4 overflow-auto rounded bg-black/40 p-3 text-xs text-white/60">
              {this.state.error.stack}
            </pre>
            <button
              onClick={this.handleReload}
              className="mt-4 rounded-full bg-gold px-4 py-2 font-extrabold text-navy"
            >
              Reload
            </button>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}