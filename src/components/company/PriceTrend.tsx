interface PriceTrendProps {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
  /** true면 부모 컨테이너 너비에 맞춰 늘어나되 width를 최대치로 제한 (상세페이지 차트용) */
  responsive?: boolean;
}

/** 더미 주가 히스토리를 그리는 단순 스파크라인 (외부 차트 라이브러리 없이 SVG로 구현) */
export default function PriceTrend({
  data,
  width = 120,
  height = 40,
  positive = true,
  responsive = false,
}: PriceTrendProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });

  const areaPath = `M0,${height} L${points.join(' L')} L${width},${height} Z`;
  const linePath = `M${points.join(' L')}`;
  const color = positive ? 'var(--positive)' : 'var(--negative)';

  return (
    <svg
      width={responsive ? '100%' : width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={responsive ? { maxWidth: width, display: 'block' } : undefined}
      aria-hidden="true"
    >
      <path d={areaPath} fill={color} opacity={0.08} stroke="none" />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
