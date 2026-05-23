import { NextResponse } from 'next/server';

// Product catalog with versions
const products = [
  {
    id: 'piyrox-ide',
    name: 'PiyRox IDE',
    description: 'AI-powered IDE that writes its own code',
    version: '2.1.0',
    releaseDate: '2026-05-20',
    downloadUrl: '/downloads/PiyRoxIDE.zip',
    size: '245 MB',
    changelog: [
      'Enhanced AI code generation',
      'Improved performance and stability',
      'New theme options',
      'Bug fixes and optimizations'
    ],
    requirements: {
      os: ['Windows 10+', 'macOS 11+', 'Linux'],
      ram: '8GB minimum',
      disk: '500MB'
    }
  },
  {
    id: 'jarvis-ultimate',
    name: 'JARVIS Ultimate',
    description: 'The world\'s first AI-native OS',
    version: '1.8.5',
    releaseDate: '2026-05-18',
    downloadUrl: '/downloads/JarvisUltimate.zip',
    size: '512 MB',
    changelog: [
      'Advanced AI integration',
      'Improved system performance',
      'New AI assistant features',
      'Security enhancements'
    ],
    requirements: {
      os: ['Windows 10+', 'macOS 11+'],
      ram: '16GB minimum',
      disk: '1GB'
    }
  }
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id');

    if (productId) {
      // Get specific product
      const product = products.find(p => p.id === productId);
      if (!product) {
        return NextResponse.json(
          { success: false, message: 'Product not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, product });
    }

    // Get all products
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error('Products error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Log download (in production, save to database)
    console.log(`Download initiated for ${product.name} v${product.version}`);

    return NextResponse.json({
      success: true,
      message: 'Download started',
      product,
      downloadUrl: product.downloadUrl
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}
