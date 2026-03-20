import { useEffect, useRef, useState } from "react";

interface ParsedData {
  max: number;
  peaks: number[];
}

function mean(arr: (number | undefined)[]): number {
  let sum = 0;
  let count = 0;
  for (const v of arr) {
    if (v != null) {
      sum += v;
      count++;
    }
  }
  return count > 0 ? sum / count : 0;
}

async function calculate(data: ArrayBuffer): Promise<ParsedData> {
  const audioCtx = new AudioContext();

  const buffer = await audioCtx.decodeAudioData(data.slice(0));
  const leftData = buffer.getChannelData(0);
  const rightData = buffer.getChannelData(1);

  // 左右の平均の絶対値
  const normalized = new Float32Array(leftData.length);
  for (let i = 0; i < leftData.length; i++) {
    normalized[i] = (Math.abs(leftData[i]!) + Math.abs(rightData[i]!)) / 2;
  }

  // 100 個の chunk に分けて平均
  const chunkSize = Math.ceil(normalized.length / 100);
  const peaks: number[] = [];
  let max = 0;
  for (let i = 0; i < normalized.length; i += chunkSize) {
    const end = Math.min(i + chunkSize, normalized.length);
    let sum = 0;
    for (let j = i; j < end; j++) {
      sum += normalized[j]!;
    }
    const avg = sum / (end - i);
    peaks.push(avg);
    if (avg > max) max = avg;
  }

  return { max, peaks };
}

interface Props {
  soundData: ArrayBuffer;
}

export const SoundWaveSVG = ({ soundData }: Props) => {
  const uniqueIdRef = useRef(Math.random().toString(16));
  const [{ max, peaks }, setPeaks] = useState<ParsedData>({
    max: 0,
    peaks: [],
  });

  useEffect(() => {
    calculate(soundData).then(({ max, peaks }) => {
      setPeaks({ max, peaks });
    });
  }, [soundData]);

  return (
    <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 1">
      {peaks.map((peak, idx) => {
        const ratio = peak / max;
        return (
          <rect
            key={`${uniqueIdRef.current}#${idx}`}
            fill="var(--color-cax-accent)"
            height={ratio}
            width="1"
            x={idx}
            y={1 - ratio}
          />
        );
      })}
    </svg>
  );
};
