import React from 'react';

interface CircularProgressScoreProps {
  score: number;
  size?: number; 
  strokeWidth?: number; 
}

interface ScoreTier {
  name: string;
  minScore: number;
  maxScore: number;
  color: string; // Tailwind color class for text and main arc
  segmentColor: string; // Tailwind color class for background segment
  angle: number; // Segment angle for the gauge
}

const scoreTiers: ScoreTier[] = [
  { name: "Poor", minScore: 300, maxScore: 579, color: "text-red-500", segmentColor: "stroke-red-500/30", angle: 70 }, // ~27% of range
  { name: "Fair", minScore: 580, maxScore: 669, color: "text-orange-500", segmentColor: "stroke-orange-500/30", angle: 60 }, // ~16%
  { name: "Good", minScore: 670, maxScore: 739, color: "text-yellow-400", segmentColor: "stroke-yellow-400/30", angle: 60 }, // ~12%
  { name: "Very Good", minScore: 740, maxScore: 799, color: "text-lime-500", segmentColor: "stroke-lime-500/30", angle: 60 }, // ~10%
  { name: "Excellent", minScore: 800, maxScore: 850, color: "text-green-500", segmentColor: "stroke-green-500/30", angle: 50 }, // ~9%
]; // Total angle: 300 degrees for a nice gauge effect


const CircularProgressScore: React.FC<CircularProgressScoreProps> = ({
  score,
  size = 140, // Increased size for better visual
  strokeWidth = 12,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const totalAngle = 300; // Use 300 degrees of the circle for the gauge
  const startAngleOffset = - (totalAngle / 2) - 90; // Center the gauge at the bottom

  const scoreMin = 300;
  const scoreMax = 850;
  
  const normalizedScoreValue = Math.max(scoreMin, Math.min(score, scoreMax));
  const progressPercentage = ((normalizedScoreValue - scoreMin) / (scoreMax - scoreMin));
  const progressAngle = progressPercentage * totalAngle;

  const currentTier = scoreTiers.find(tier => score >= tier.minScore && score <= tier.maxScore) || scoreTiers[0];

  let accumulatedAngle = 0;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform">
        {/* Background Segments */}
        {scoreTiers.map((tier, index) => {
          const segmentPath = `
            M ${size/2 + radius * Math.cos((startAngleOffset + accumulatedAngle) * Math.PI / 180)} 
              ${size/2 + radius * Math.sin((startAngleOffset + accumulatedAngle) * Math.PI / 180)}
            A ${radius} ${radius} 0 ${tier.angle > 180 ? 1 : 0} 1 
              ${size/2 + radius * Math.cos((startAngleOffset + accumulatedAngle + tier.angle) * Math.PI / 180)} 
              ${size/2 + radius * Math.sin((startAngleOffset + accumulatedAngle + tier.angle) * Math.PI / 180)}
          `;
          accumulatedAngle += tier.angle;
          return (
            <path
              key={tier.name}
              d={segmentPath}
              strokeWidth={strokeWidth}
              className={tier.segmentColor.replace('stroke-', 'stroke-') || 'stroke-neutral-200'} // Ensure class is applied
              fill="transparent"
              strokeLinecap="butt" // Use butt for segments
            />
          );
        })}

        {/* Foreground Progress Arc */}
        <path
          d={`
            M ${size/2 + radius * Math.cos(startAngleOffset * Math.PI / 180)} 
              ${size/2 + radius * Math.sin(startAngleOffset * Math.PI / 180)}
            A ${radius} ${radius} 0 ${progressAngle > 180 ? 1 : 0} 1 
              ${size/2 + radius * Math.cos((startAngleOffset + progressAngle) * Math.PI / 180)} 
              ${size/2 + radius * Math.sin((startAngleOffset + progressAngle) * Math.PI / 180)}
          `}
          strokeWidth={strokeWidth}
          className={currentTier.color.replace('text-', 'stroke-') || 'stroke-primary'}
          fill="transparent"
          strokeLinecap="round" // Round for the progress itself
          style={{ transition: 'all 0.5s ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={`text-3xl font-bold ${currentTier.color}`}>
          {score}
        </span>
        <span className={`text-xs font-medium ${currentTier.color} mt-0.5`}>
          {currentTier.name}
        </span>
      </div>
    </div>
  );
};

export default CircularProgressScore;