import { NextResponse } from 'next/server';
import { prisma } from '../../../../../packages/database/src/index';

export async function GET() {
  try {
    // Fetch all items
    const items = await prisma.item.findMany({
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

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}
