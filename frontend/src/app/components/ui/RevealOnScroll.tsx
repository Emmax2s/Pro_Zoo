import React, { useEffect, useRef, useState } from "react";

interface RevealOnScrollProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  variant?: "fade-up" | "fade-in" | "scale-up";
  delay?: number;
  threshold?: number;
  className?: string;
  children: React.ReactNode;
}

export function RevealOnScroll({
  as: Component = "div",
  variant = "fade-up",
  delay = 0,
  threshold = 0.1,
  className = "",
  children,
  style,
  ...rest
}: RevealOnScrollProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true);
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  const variantClass =
    variant === "fade-in"
      ? "reveal-fade-in"
      : variant === "scale-up"
      ? "reveal-scale-up"
      : "reveal-on-scroll";

  const delayStyle = delay > 0 ? { transitionDelay: `${delay}ms` } : {};

  return (
    <Component
      ref={ref}
      className={`${variantClass} ${revealed ? "is-revealed" : ""} ${className}`}
      style={{ ...delayStyle, ...style }}
      {...rest}
    >
      {children}
    </Component>
  );
}

/**
 * Initializes global scroll-reveal on matching elements across the DOM.
 * Optimized for 60fps: unobserves elements as soon as they become visible.
 */
export function initGlobalScrollReveal(container: HTMLElement | Document = document) {
  if (typeof window === "undefined") return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    container.querySelectorAll(".reveal-on-scroll, section:not(.no-reveal)").forEach((el) => {
      el.classList.add("is-revealed");
    });
    return () => {};
  }

  if (!("IntersectionObserver" in window)) {
    container.querySelectorAll(".reveal-on-scroll, section:not(.no-reveal)").forEach((el) => {
      el.classList.add("is-revealed");
    });
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  const targets = container.querySelectorAll<HTMLElement>(
    "section:not(.no-reveal), .reveal-on-scroll, .reveal-fade-in, .reveal-scale-up"
  );

  targets.forEach((target) => {
    // If not already revealed, add base class and observe
    if (!target.classList.contains("is-revealed")) {
      if (
        !target.classList.contains("reveal-on-scroll") &&
        !target.classList.contains("reveal-fade-in") &&
        !target.classList.contains("reveal-scale-up")
      ) {
        target.classList.add("reveal-on-scroll");
      }
      observer.observe(target);
    }
  });

  return () => {
    observer.disconnect();
  };
}

