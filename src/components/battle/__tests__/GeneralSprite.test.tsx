import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
  describe('getDisplayChar - Chinese character mapping', () => {
    it('displays correct Chinese character for liu-bei', () => {
      render(<GeneralSprite generalId="liu-bei" side="left" phase="challenge" />);
      expect(screen.getByText('刘')).toBeInTheDocument();
    });

    it('displays correct Chinese character for guan-yu', () => {
      render(<GeneralSprite generalId="guan-yu" side="left" phase="challenge" />);
      expect(screen.getByText('关')).toBeInTheDocument();
    });

    it('displays correct Chinese character for cao-cao', () => {
      render(<GeneralSprite generalId="cao-cao" side="right" phase="challenge" />);
      expect(screen.getByText('曹')).toBeInTheDocument();
    });

    it('falls back to first character uppercase for unknown generals', () => {
      render(<GeneralSprite generalId="wang-mang" side="left" phase="challenge" />);
      expect(screen.getByText('W')).toBeInTheDocument();
    });

    it('handles underscore IDs via normalization (liu_bei -> 刘)', () => {
      render(<GeneralSprite generalId="liu_bei" side="left" phase="challenge" />);
      expect(screen.getByText('刘')).toBeInTheDocument();
    });

    it('handles underscore IDs for zhang_fei', () => {
      render(<GeneralSprite generalId="zhang_fei" side="left" phase="challenge" />);
      expect(screen.getByText('张')).toBeInTheDocument();
    });
  });

  describe('side-based coloring', () => {
    it('player side (left) uses Shu red color', () => {
      const { container } = render(
        <GeneralSprite generalId="liu-bei" side="left" phase="challenge" />
      );
      const circle = container.querySelector('[style*="background-color"]') as HTMLElement;
      expect(circle).toBeTruthy();
      expect(circle.style.backgroundColor).toBe('var(--color-shu-red)');
    });

    it('enemy side (right) uses gray color', () => {
      const { container } = render(
        <GeneralSprite generalId="cao-cao" side="right" phase="challenge" />
      );
      const circle = container.querySelector('[style*="background-color"]') as HTMLElement;
      expect(circle).toBeTruthy();
      expect(circle.style.backgroundColor).toBe('rgb(74, 74, 74)');
    });

    it('player side has gold border', () => {
      const { container } = render(
        <GeneralSprite generalId="liu-bei" side="left" phase="challenge" />
      );
      const circle = container.querySelector('[style*="border-color"]') as HTMLElement;
      expect(circle).toBeTruthy();
      expect(circle.style.borderColor).toBe('var(--color-gold)');
    });

    it('enemy side has gray border', () => {
      const { container } = render(
        <GeneralSprite generalId="cao-cao" side="right" phase="challenge" />
      );
      const circle = container.querySelector('[style*="border-color"]') as HTMLElement;
      expect(circle).toBeTruthy();
      expect(circle.style.borderColor).toBe('rgb(119, 119, 119)');
    });
  });

  describe('name label', () => {
    it('renders general name label for hyphenated ID', () => {
      render(<GeneralSprite generalId="liu-bei" side="left" phase="challenge" />);
      // The name label renders generalId.replace(/_/g, '') which for "liu-bei" stays "liu-bei"
      expect(screen.getByText('liu-bei')).toBeInTheDocument();
    });

    it('renders general name label with underscores removed', () => {
      render(<GeneralSprite generalId="liu_bei" side="left" phase="challenge" />);
      // The name label renders generalId.replace(/_/g, '') which for "liu_bei" becomes "liubei"
      expect(screen.getByText('liubei')).toBeInTheDocument();
    });

    it('player name label has shu-red background', () => {
      const { container } = render(
        <GeneralSprite generalId="liu-bei" side="left" phase="challenge" />
      );
      // The name label is the second span with specific styling
      const labels = container.querySelectorAll('span.text-xs');
      expect(labels.length).toBeGreaterThan(0);
      const label = labels[0] as HTMLElement;
      expect(label.style.backgroundColor).toBe('var(--color-shu-red)');
    });

    it('enemy name label has gray background', () => {
      const { container } = render(
        <GeneralSprite generalId="cao-cao" side="right" phase="challenge" />
      );
      const labels = container.querySelectorAll('span.text-xs');
      expect(labels.length).toBeGreaterThan(0);
      const label = labels[0] as HTMLElement;
      expect(label.style.backgroundColor).toBe('rgb(85, 85, 85)');
    });
  });

  describe('skill_ready phase glow', () => {
    it('shows glow element during skill_ready phase', () => {
      const { container } = render(
        <GeneralSprite generalId="liu-bei" side="left" phase="skill_ready" />
      );
      // The glow element is a div with "absolute inset-0 rounded-full" class
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
