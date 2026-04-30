import { redirect } from 'next/navigation';
import { getSessionToken } from '@/lib/auth/session';
import { getSession, getUser, getUsageToday, getUsageMonth } from '@/lib/auth/kv';
import { SITE_STATS } from '@/lib/constants/siteStats';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const sessionToken = await getSessionToken();
  if (!sessionToken) redirect('/login');

  const email = await getSession(sessionToken);
  if (!email) redirect('/login');

  const user = await getUser(email);
  if (!user) redirect('/login');

  const usageToday = await getUsageToday(user.apiKey, 'key');
  const usageMonth = await getUsageMonth(user.apiKey);
  const limit = user.plan === 'pro' ? SITE_STATS.proMonthlyLimit : SITE_STATS.freeKeyDailyLimit;

  return (
    <DashboardClient
      email={user.email}
      plan={user.plan}
      apiKey={user.apiKey}
      usageToday={usageToday}
      usageMonth={usageMonth}
      limit={limit}
    />
  );
}
