import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';

/** Sizes the mark is drawn for: 16 / 20 (small variant), 26 / 40 (large). */
const DEFAULT_MARK_SIZE = 26;

/** At or below this edge length the thickened small variant is used. */
const SMALL_MARK_MAX_SIZE = 20;

/**
 * The Descartes Square mark — four dots on a 2×2 lattice in the quadrant
 * accents, with the two "acting" quadrants (q1 gain, q3 risk) drawn larger so
 * the mark reads as a weighted decision rather than a plain grid.
 *
 * Two variants ship because the difference is an optical correction rather than
 * a scale: at or below 20px the dots are thickened and the row-to-row size
 * contrast is reduced, so the smaller pair does not vanish. A single scaled SVG
 * cannot do that.
 *
 * Fills come from `--mark-q1..--mark-q4` (theme.scss), so the mark follows the
 * light/dark palette without a container tile — it sits directly on the surface.
 */
@Component({
  selector: 'app-mark',
  templateUrl: './mark.html',
  styleUrl: './mark.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
  },
})
export class Mark {
  /** Rendered edge length in px. Designed for 16 / 20 / 26 / 40. */
  readonly size = input(DEFAULT_MARK_SIZE, { transform: numberAttribute });

  /**
   * Accessible name. Omit when an ancestor already labels the mark — the header
   * wraps it in a labelled link, so there it stays `aria-hidden`.
   */
  readonly label = input<string>();

  protected readonly isSmall = computed(
    () => this.size() <= SMALL_MARK_MAX_SIZE,
  );
}
