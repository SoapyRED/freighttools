import { NextRequest, NextResponse } from 'next/server';
import { getAllVehicles, getVehicle, getVehiclesByCategory, getVehiclesByRegion, VEHICLE_REF_COUNT } from '@/lib/calculations/vehicle-ref';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'X-RateLimit-Limit': '100',
  'X-RateLimit-Window': '86400',
};
const CACHE = { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' };

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export function GET(req: NextRequest) {
  const h = { ...CORS, ...CACHE };
  const { searchParams } = req.nextUrl;

  const slug = searchParams.get('slug');
  const category = searchParams.get('category');
  const region = searchParams.get('region');

  // Single vehicle lookup
  if (slug) {
    const vehicle = getVehicle(slug);
    if (!vehicle) {
      return NextResponse.json(
        { error: `Vehicle "${slug}" not found.`, valid_slugs: getAllVehicles().map(v => v.slug) },
        { status: 404, headers: h },
      );
    }
    return NextResponse.json({
      meta: { source: 'Industry standard specifications', total: VEHICLE_REF_COUNT },
      result: vehicle,
    }, { headers: h });
  }

  // Filter by category
  if (category) {
    const valid = ['articulated', 'rigid', 'van'];
    if (!valid.includes(category.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid category "${category}". Valid: ${valid.join(', ')}` },
        { status: 400, headers: h },
      );
    }
    const results = getVehiclesByCategory(category.toLowerCase());
    return NextResponse.json({
      meta: { source: 'Industry standard specifications', total: VEHICLE_REF_COUNT },
      count: results.length,
      results,
    }, { headers: h });
  }

  // Filter by region
  if (region) {
    const valid = ['EU', 'US'];
    if (!valid.includes(region.toUpperCase())) {
      return NextResponse.json(
        { error: `Invalid region "${region}". Valid: ${valid.join(', ')}` },
        { status: 400, headers: h },
      );
    }
    const results = getVehiclesByRegion(region);
    return NextResponse.json({
      meta: { source: 'Industry standard specifications', total: VEHICLE_REF_COUNT },
      count: results.length,
      results,
    }, { headers: h });
  }

  // No params → return all
  const results = getAllVehicles();
  return NextResponse.json({
    meta: { source: 'Industry standard specifications', total: VEHICLE_REF_COUNT },
    count: results.length,
    results,
  }, { headers: h });
}
