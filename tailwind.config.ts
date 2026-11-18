import type { Config } from 'tailwindcss';
const config: Config = { content: ['./src/**/*.{ts,tsx}'], theme: { extend: { colors: { ink:'#17243a', ocean:'#185b90', mint:'#1fbeaa', cloud:'#f5f8fb' }, boxShadow: { panel:'0 14px 38px rgba(22,42,67,.06)' } } }, plugins: []};
export default config;
