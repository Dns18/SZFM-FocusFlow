import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { startOfWeek, endOfWeek, isWithinInterval, format } from 'date-fns';

const DEFAULT_SESSION_DURATION = 25 * 60;

export default function Statistics({ sessions }) {
    // --- Heti tantárgy session szám ---
  const currentWeekSessions = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const filtered = sessions.filter(s =>
      isWithinInterval(new Date(s.timestamp), { start: weekStart, end: weekEnd })
    );

    const counts = {};
    filtered.forEach(s => {
      const t = s.topic || 'Unknown';
      counts[t] = (counts[t] || 0) + 1;
    });

    return Object.entries(counts).map(([topic, count]) => ({ topic, count }));
  }, [sessions]);
  
}