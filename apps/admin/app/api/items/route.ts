export const runtime = 'nodejs';
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      fullDescription, 
      price, 
      image, 
      ingredients, 
      servingTips, 
      recommendations, 
      categoryId 
    } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Item name is required' },
        { status: 400 }
      );
    }

    if (!price || typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: 'Valid price is required' },
        { status: 400 }
      );
    }

    // Validate categoryId if provided
    if (categoryId !== null && categoryId !== undefined) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId }
      });
      
      if (!categoryExists) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 400 }
        );
      }
    }

    // Create the new item
    const newItem = await prisma.item.create({
      data: {
        name: name.trim(),
        fullDescription: fullDescription || null,
        price: price,
        image: image || null,
        ingredients: ingredients || [],
        servingTips: servingTips || [],
        recommendations: recommendations || [],
        categoryId: categoryId || null
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        likes: true,
        orderItems: true
      }
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}
