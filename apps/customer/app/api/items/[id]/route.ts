import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../packages/database/src/index';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const itemId = parseInt(id);
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      );
    }
    
    // Fetch the specific item with detailed information
    const item = await prisma.item.findUnique({
      where: {
        id: itemId,
      },
      select: {
        id: true,
        name: true,
        fullDescription: true,
        price: true,
        image: true,
        ingredients: true, // Added
        servingTips: true, // Added
        recommendations: true, // Added
        category: {
          select: {
            id: true,
            name: true
          }
        },
        orderItems: {
          select: {
            quantity: true
          }
        },
        likes: {
          select: {
            id: true
          }
        },
        createdAt: true,
        updatedAt: true
      },
    });
    
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}