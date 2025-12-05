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

  // --- Heti napi tanulási idő (percekben) ---
    const weekTimeByDay = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const filtered = sessions.filter(s =>
      isWithinInterval(new Date(s.timestamp), { start: weekStart, end: weekEnd })
    );

    const timeByDay = {};
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      const key = format(day, 'EEE'); // Mon, Tue, stb.
      timeByDay[key] = 0;
    }

    filtered.forEach(s => {
      const dayKey = format(new Date(s.timestamp), 'EEE');
      timeByDay[dayKey] += (s.duration || DEFAULT_SESSION_DURATION) / 60;
    });

    return Object.entries(timeByDay).map(([day, minutes]) => ({ day, minutes }));
    }, [sessions]);

  // --- Ha nincs session ---
    if (!sessions || sessions.length === 0) {
        return <p>Nincs még mentett session az adatokhoz.</p>;
    }

    return (
     <div style={{ padding: 24 }}>
        <h2>Heti session szám tantárgyanként</h2>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currentWeekSessions}>
            <XAxis dataKey="topic" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#007bff" />
            </BarChart>
        </ResponsiveContainer>
     </div>
    );
}