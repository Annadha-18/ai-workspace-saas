export type StatMetric = {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
};

export const statMetrics: StatMetric[] = [
  {
    id: "messages",
    label: "AI Messages",
    value: "12.4k",
    change: "+18.2%",
    trend: "up",
  },
  {
    id: "users",
    label: "Active Users",
    value: "2,847",
    change: "+6.4%",
    trend: "up",
  },
  {
    id: "tokens",
    label: "Tokens Used",
    value: "8.2M",
    change: "+12.1%",
    trend: "up",
  },
  {
    id: "latency",
    label: "Avg. Latency",
    value: "1.2s",
    change: "-8.3%",
    trend: "down",
  },
];

export type ChartPoint = {
  name: string;
  messages: number;
  tokens: number;
};

export const usageChartData: ChartPoint[] = [
  { name: "Mon", messages: 420, tokens: 2400 },
  { name: "Tue", messages: 580, tokens: 3200 },
  { name: "Wed", messages: 510, tokens: 2800 },
  { name: "Thu", messages: 720, tokens: 4100 },
  { name: "Fri", messages: 890, tokens: 5200 },
  { name: "Sat", messages: 640, tokens: 3600 },
  { name: "Sun", messages: 480, tokens: 2700 },
];

export type ActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "chat" | "upload" | "team" | "system";
};

export const activityFeed: ActivityItem[] = [
  {
    id: "1",
    title: "New AI conversation",
    description: "Product roadmap summary generated",
    time: "2 min ago",
    type: "chat",
  },
  {
    id: "2",
    title: "Document indexed",
    description: "Q4-report.pdf added to knowledge base",
    time: "18 min ago",
    type: "upload",
  },
  {
    id: "3",
    title: "Team member joined",
    description: "Alex Chen joined Workspace Pro",
    time: "1 hr ago",
    type: "team",
  },
  {
    id: "4",
    title: "Model switched",
    description: "Default model set to Gemini 2.0 Flash",
    time: "3 hr ago",
    type: "system",
  },
  {
    id: "5",
    title: "Weekly digest sent",
    description: "Usage report emailed to admins",
    time: "5 hr ago",
    type: "system",
  },
];

export const chatSuggestions = [
  "Summarize my latest documents",
  "Draft a product update email",
  "Explain our API architecture",
  "Analyze last week's metrics",
];
