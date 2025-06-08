import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../packages/database/src/index';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ items: [] });
    }

    // Search for items that match the query in name or description
    const items = await prisma.item.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
        category: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}