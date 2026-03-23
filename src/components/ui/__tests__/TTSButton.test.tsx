import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { TTSButton } from '../TTSButton';

// ---- Audio mock ----

const mockPause = vi.fn();
const mockPlay = vi.fn().mockResolvedValue(undefined);

let audioInstances: { pause: typeof mockPause; play: typeof mockPlay; onended: (() => void) | null }[] = [];

class MockAudio {
  pause = mockPause;
  play = mockPlay;
  onended: (() => void) | null = null;

  constructor(_url?: string) {
    audioInstances.push(this);
  }
}

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
const mockRevokeObjectURL = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  audioInstances = [];

  // Replace global Audio constructor
  vi.stubGlobal('Audio', MockAudio);

  // Replace URL methods
  vi.stubGlobal('URL', {
    ...globalThis.URL,
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ---- Fetch mock helper ----

function mockFetchSuccess() {
  return vi.fn().mockResolvedValue({
    ok: true,
    blob: () => Promise.resolve(new Blob(['fake-audio'], { type: 'audio/mpeg' })),
  });
}

function mockFetchFailure(status = 500) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
  });
}

describe('TTSButton', () => {
  it('renders with default label', () => {
    render(<TTSButton text="测试文本" />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title', '听讲解');
  });

  it('renders with custom label', () => {
    render(<TTSButton text="测试文本" label="播放" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', '播放');
  });

  it('shows loading state after click, then playing state on success', async () => {
    const fetchMock = mockFetchSuccess();
    vi.stubGlobal('fetch', fetchMock);

    render(<TTSButton text="三国演义" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // After click completes (fetch resolves, audio plays), should be in playing state
    await waitFor(() => {
      expect(button).toHaveAttribute('title', '点击暂停');
    });
  });

  it('returns to idle state when fetch fails', async () => {
    const fetchMock = mockFetchFailure();
    vi.stubGlobal('fetch', fetchMock);

    render(<TTSButton text="测试" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('title', '听讲解');
    });
  });

  it('pauses audio when clicked while playing', async () => {
    const fetchMock = mockFetchSuccess();
    vi.stubGlobal('fetch', fetchMock);

    render(<TTSButton text="测试" />);

    const button = screen.getByRole('button');

    // First click: start playing
    fireEvent.click(button);
    await waitFor(() => {
      expect(button).toHaveAttribute('title', '点击暂停');
    });

    // Second click: pause
    fireEvent.click(button);
    await waitFor(() => {
      expect(mockPause).toHaveBeenCalled();
      expect(button).toHaveAttribute('title', '听讲解');
    });
  });

  it('returns to idle state when audio ends naturally', async () => {
    const fetchMock = mockFetchSuccess();
    vi.stubGlobal('fetch', fetchMock);

    render(<TTSButton text="测试" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('title', '点击暂停');
    });

    // Simulate audio finishing
    const lastAudio = audioInstances[audioInstances.length - 1];
    expect(lastAudio.onended).toBeDefined();
    lastAudio.onended!();

    await waitFor(() => {
      expect(button).toHaveAttribute('title', '听讲解');
    });
  });

  it('revokes object URL when audio ends', async () => {
    const fetchMock = mockFetchSuccess();
    vi.stubGlobal('fetch', fetchMock);

    render(<TTSButton text="测试" />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(audioInstances.length).toBeGreaterThan(0);
    });

    // Simulate audio ending
    const lastAudio = audioInstances[audioInstances.length - 1];
    lastAudio.onended!();

    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('calls the TTS API with the correct text', async () => {
    const fetchMock = mockFetchSuccess();
    vi.stubGlobal('fetch', fetchMock);

    render(<TTSButton text="诸葛亮" />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/tts');
    expect(options.method).toBe('POST');
    const body = JSON.parse(options.body);
    expect(body.text).toBe('诸葛亮');
  });
});

describe('TTSButton — unmount cleanup', () => {
  it('stops (pauses) audio on unmount while playing', async () => {
    const fetchMock = mockFetchSuccess();
    vi.stubGlobal('fetch', fetchMock);

    const { unmount } = render(<TTSButton text="测试" />);

    // Start playing
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(audioInstances.length).toBeGreaterThan(0);
    });

    // Unmount the component
    unmount();

    // Audio.pause() should have been called by the cleanup effect
    expect(mockPause).toHaveBeenCalled();
  });

  it('does not crash on unmount when no audio is playing', () => {
    const { unmount } = render(<TTSButton text="测试" />);

    // Unmount without ever clicking play — should not throw
    expect(() => unmount()).not.toThrow();
  });

  it('does not crash on unmount during loading state', async () => {
    // Create a fetch that never resolves (simulating slow network)
    let resolvePromise: (value: any) => void;
    const neverResolvingFetch = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );
    vi.stubGlobal('fetch', neverResolvingFetch);

    const { unmount } = render(<TTSButton text="测试" />);

    // Click to start loading
    fireEvent.click(screen.getByRole('button'));

    // Unmount while fetch is still pending — should not throw
    expect(() => unmount()).not.toThrow();

    // Resolve the promise to prevent unhandled rejection
    resolvePromise!({
      ok: true,
      blob: () => Promise.resolve(new Blob()),
    });
  });
});

describe('TTSButton — size variants', () => {
  it('renders small variant with size="sm"', () => {
    render(<TTSButton text="测试" size="sm" />);
    const button = screen.getByRole('button');
    // Small variant should not show the label text in the button content
    // (the label is in the title attr, not visible text in sm mode)
    expect(button).toBeInTheDocument();
  });

  it('renders medium variant by default', () => {
    render(<TTSButton text="测试" />);
    const button = screen.getByRole('button');
    // Default size="md" shows the label text
    expect(button.textContent).toContain('听讲解');
  });
});
