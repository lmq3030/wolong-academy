import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GeneralSprite } from '../GeneralSprite';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, animate, transition, initial, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe('GeneralSprite', () => {
  describe('portrait image', () => {
    it('renders an img tag with correct src for known generals', () => {
      render(<GeneralSprite generalId="guan-yu" side="left" phase="challenge" />);
      const img = screen.getByAltText('guan-yu');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/assets/generals/guan-yu.png');
    });

    it('normalizes underscore IDs for image src', () => {
      render(<GeneralSprite generalId="liu_bei" side="left" phase="challenge" />);
      const img = screen.getByAltText('liu-bei');
      expect(img).toHaveAttribute('src', '/assets/generals/liu-bei.png');
    });

    it('falls back to text character when image fails to load', () => {
      render(<GeneralSprite generalId="guan-yu" side="left" phase="challenge" />);
      const img = screen.getByAltText('guan-yu');
      fireEvent.error(img);
      // After error, should show fallback character
      expect(screen.getByText('关')).toBeInTheDocument();
    });

    it('shows fallback character for unknown generals when image fails', () => {
      render(<GeneralSprite generalId="wang-mang" side="left" phase="challenge" />);
      const img = screen.getByAltText('wang-mang');
      fireEvent.error(img);
      expect(screen.getByText('W')).toBeInTheDocument();
    });
  });

  describe('name label - Chinese names', () => {
    it('shows Chinese name for known generals', () => {
      render(<GeneralSprite generalId="liu-bei" side="left" phase="challenge" />);
      expect(screen.getByText('刘备')).toBeInTheDocument();
    });

    it('shows Chinese name for guan-yu', () => {
      render(<GeneralSprite generalId="guan-yu" side="left" phase="challenge" />);
      expect(screen.getByText('关羽')).toBeInTheDocument();
    });

    it('shows Chinese name for hua-xiong', () => {
      render(<GeneralSprite generalId="hua-xiong" side="right" phase="challenge" />);
      expect(screen.getByText('华雄')).toBeInTheDocument();
    });

    it('shows normalized ID for unknown generals', () => {
      render(<GeneralSprite generalId="wang-mang" side="left" phase="challenge" />);
      expect(screen.getByText('wang-mang')).toBeInTheDocument();
    });
  });

  describe('side-based coloring', () => {
    it('player side (left) uses gold border', () => {
      const { container } = render(
        <GeneralSprite generalId="liu-bei" side="left" phase="challenge" />
      );
      const circle = container.querySelector('[style*="border-color"]') as HTMLElement;
      expect(circle).toBeTruthy();
      expect(circle.style.borderColor).toBe('var(--color-gold)');
    });

    it('enemy side (right) uses gray border', () => {
      const { container } = render(
        <GeneralSprite generalId="cao-cao" side="right" phase="challenge" />
      );
      const circle = container.querySelector('[style*="border-color"]') as HTMLElement;
      expect(circle).toBeTruthy();
      expect(circle.style.borderColor).toBe('rgb(119, 119, 119)');
    });

    it('player name label has shu-red background', () => {
      const { container } = render(
        <GeneralSprite generalId="liu-bei" side="left" phase="challenge" />
      );
      const labels = container.querySelectorAll('span.text-xs');
      expect(labels.length).toBeGreaterThan(0);
      expect((labels[0] as HTMLElement).style.backgroundColor).toBe('var(--color-shu-red)');
    });

    it('enemy name label has gray background', () => {
      const { container } = render(
        <GeneralSprite generalId="cao-cao" side="right" phase="challenge" />
      );
      const labels = container.querySelectorAll('span.text-xs');
      expect(labels.length).toBeGreaterThan(0);
      expect((labels[0] as HTMLElement).style.backgroundColor).toBe('rgb(85, 85, 85)');
    });
  });

  describe('skill_ready phase glow', () => {
    it('shows glow element during skill_ready phase', () => {
      const { container } = render(
        <GeneralSprite generalId="liu-bei" side="left" phase="skill_ready" />
      );
      const glowEl = container.querySelector('.absolute.inset-0.rounded-full');
      expect(glowEl).toBeTruthy();
    });

    it('does not show glow element during challenge phase', () => {
      const { container } = render(
        <GeneralSprite generalId="liu-bei" side="left" phase="challenge" />
      );
      const glowEl = container.querySelector('.absolute.inset-0.rounded-full');
      expect(glowEl).toBeFalsy();
    });
  });
});
