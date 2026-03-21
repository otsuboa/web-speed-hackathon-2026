import { RefObject, useEffect, useState } from "react";

/**
 * contentEndRef の要素が boundaryRef の要素より下にあるかを監視する。
 * 例: コンテンツ末尾がスティッキーバーより下にあるとき true を返す。
 *
 * @param contentEndRef - コンテンツの末尾を示す要素の ref
 * @param boundaryRef - 比較対象となる境界要素の ref（例: sticky な入力欄）
 */
export function useHasContentBelow(
  contentEndRef: RefObject<HTMLElement | null>,
  boundaryRef: RefObject<HTMLElement | null>,
): boolean {
  const [hasContentBelow, setHasContentBelow] = useState(false);

  useEffect(() => {
    const endEl = contentEndRef.current;
    const barEl = boundaryRef.current;
    if (!endEl || !barEl) return;

    // boundaryRef の上端を root margin として使い、
    // contentEndRef が画面内（boundary より上）にあるかを監視
    const observer = new IntersectionObserver(
      ([entry]) => {
        // entry が交差していない = contentEnd が boundary より下にある
        setHasContentBelow(!entry!.isIntersecting);
      },
      { root: null, threshold: 0 },
    );
    observer.observe(endEl);
    return () => observer.disconnect();
  }, [contentEndRef, boundaryRef]);

  return hasContentBelow;
}
