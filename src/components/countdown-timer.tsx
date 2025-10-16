"use client";

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endTime: number;
}

export function CountdownTimer({ endTime }: CountdownTimerProps) {
  const calculateTimeLeft = () => {
    const difference = endTime - new Date().getTime();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = Object.entries(timeLeft).map(([interval, value], index) => {
    if(value < 0) value = 0;
    return (
      <div key={interval} className="flex items-center gap-2">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold font-mono tracking-wider">
            {String(value).padStart(2, '0')}
          </span>
          <span className="text-xs text-muted-foreground uppercase">{interval}</span>
        </div>
        {index < Object.keys(timeLeft).length - 1 && (
            <span className="text-2xl font-bold text-muted-foreground pb-4">:</span>
        )}
      </div>
    );
  });
  
  const isEnded = Object.values(timeLeft).every(val => val === 0);

  return (
    <div className="flex justify-center items-start gap-1">
      {isEnded ? <span className="text-2xl font-bold font-mono">Raffle Ended</span> : timerComponents}
    </div>
  );
}
