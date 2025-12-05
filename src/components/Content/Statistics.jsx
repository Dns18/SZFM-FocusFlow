import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { startOfWeek, endOfWeek, isWithinInterval, format } from 'date-fns';

const DEFAULT_SESSION_DURATION = 25 * 60;

export default function Statistics({ sessions }) {

}