import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatButton],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements AfterViewInit {
  @ViewChildren('animatedSection')
  sections: QueryList<ElementRef<HTMLElement>>;

  readonly #destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    this.sections.forEach((section) => observer.observe(section.nativeElement));

    this.#destroyRef.onDestroy(() => observer.disconnect());
  }
}
