import React from 'react';
import './ClockDisplay.css';

interface ClockDisplayProps {
  hour: number; // 0-23 (24-hour format)
  minute: number; // 0-59
  size?: number; // Clock size in pixels (default: 200)
}

export const ClockDisplay: React.FC<ClockDisplayProps> = ({
  hour,
  minute,
  size = 200,
}) => {
  // Convert 24-hour format to 12-hour for display
  const displayHour = hour % 12;

  // Calculate angles for clock hands
  // Hour hand: moves 30 degrees per hour + 0.5 degrees per minute
  const hourAngle = (displayHour * 30) + (minute * 0.5);
  // Minute hand: moves 6 degrees per minute
  const minuteAngle = minute * 6;

  const center = size / 2;
  const clockRadius = size / 2 - 10;
  const hourHandLength = clockRadius * 0.5;
  const minuteHandLength = clockRadius * 0.75;

  // Calculate hand end points
  const hourHandX = center + hourHandLength * Math.sin((hourAngle * Math.PI) / 180);
  const hourHandY = center - hourHandLength * Math.cos((hourAngle * Math.PI) / 180);
  const minuteHandX = center + minuteHandLength * Math.sin((minuteAngle * Math.PI) / 180);
  const minuteHandY = center - minuteHandLength * Math.cos((minuteAngle * Math.PI) / 180);

  // Generate hour markers (1-12)
  const hourMarkers = [];
  for (let i = 1; i <= 12; i++) {
    const angle = (i * 30 * Math.PI) / 180;
    const markerRadius = clockRadius - 20;
    const x = center + markerRadius * Math.sin(angle);
    const y = center - markerRadius * Math.cos(angle);
    hourMarkers.push(
      <text
        key={i}
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        className="clock-number"
        fontSize={size / 12}
      >
        {i}
      </text>
    );
  }

  // Generate minute tick marks
  const tickMarks = [];
  for (let i = 0; i < 60; i++) {
    const angle = (i * 6 * Math.PI) / 180;
    const isHourMark = i % 5 === 0;
    const outerRadius = clockRadius - 5;
    const innerRadius = isHourMark ? clockRadius - 15 : clockRadius - 10;

    const x1 = center + innerRadius * Math.sin(angle);
    const y1 = center - innerRadius * Math.cos(angle);
    const x2 = center + outerRadius * Math.sin(angle);
    const y2 = center - outerRadius * Math.cos(angle);

    tickMarks.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        className={isHourMark ? 'clock-tick-hour' : 'clock-tick-minute'}
        strokeWidth={isHourMark ? 2 : 1}
      />
    );
  }

  return (
    <div className="clock-display-container">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="clock-svg"
      >
        {/* Clock face */}
        <circle
          cx={center}
          cy={center}
          r={clockRadius}
          className="clock-face"
        />

        {/* Tick marks */}
        {tickMarks}

        {/* Hour numbers */}
        {hourMarkers}

        {/* Hour hand */}
        <line
          x1={center}
          y1={center}
          x2={hourHandX}
          y2={hourHandY}
          className="clock-hand-hour"
          strokeWidth={size / 40}
          strokeLinecap="round"
        />

        {/* Minute hand */}
        <line
          x1={center}
          y1={center}
          x2={minuteHandX}
          y2={minuteHandY}
          className="clock-hand-minute"
          strokeWidth={size / 60}
          strokeLinecap="round"
        />

        {/* Center dot */}
        <circle
          cx={center}
          cy={center}
          r={size / 30}
          className="clock-center"
        />
      </svg>
    </div>
  );
};
