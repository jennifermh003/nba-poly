import { NextResponse } from 'next/server';
import { fetchAllOdds } from '@/lib/polymarket';

export async function GET() {
  try {
    const { championship, westConf, eastConf, tokenIds } =
      await fetchAllOdds();

    return NextResponse.json(
      {
        championship,
        westConf,
        eastConf,
        tokenIds,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control':
            'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Failed to fetch odds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch odds' },
      { status: 500 }
    );
  }
}
