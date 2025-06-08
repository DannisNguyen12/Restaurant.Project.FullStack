export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../../packages/database/src/index';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }
    
    // Fetch items for the specific category
    const items = await prisma.item.findMany({
      where: {
        categoryId: categoryId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching category items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category items' },
      { status: 500 }
    );
  }
}
