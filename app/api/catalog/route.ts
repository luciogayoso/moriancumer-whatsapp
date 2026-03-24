// app/api/catalog/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Obtener los productos de Supabase
    const { data: productos, error } = await supabase
      .from('productos')
      .select('*');

    if (error) {
      console.error("Error de Supabase:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2. Configurar la URL base de tu sitio (cambiala por tu dominio real en producción)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://moriancumer.com';
    const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos-imagenes/`;

    // 3. Construir el XML enx formato RSS 2.0 (el preferido de Meta)
    const items = productos?.map((p) => `
      <item>
        <g:id>${p.id}</g:id>
        <g:title>${p.nombre}</g:title>
        <g:description>${p.descripcion || 'Pieza de alta calidad fabricada con impresión 3D.'}</g:description>
        <g:link>${baseUrl}/productos/${p.slug}</g:link>
        <g:image_link>${storageUrl}${p.imagen_url}</g:image_link>
        <g:brand>Moriancumer</g:brand>
        <g:condition>new</g:condition>
        <g:availability>in stock</g:availability>
        <g:price>${p.precio} ARS</g:price>
        <g:google_product_category>Arts &amp; Entertainment &gt; Hobbies &amp; Creative Arts</g:google_product_category>
      </item>
    `).join('');

    const xml = `<?xml version="1.0"?>
      <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
        <channel>
          <title>Catálogo Moriancumer 3D</title>
          <link>${baseUrl}</link>
          <description>Feed de productos para Instagram Shopping</description>
          ${items}
        </channel>
      </rss>`;

    // 4. Retornar el XML con el Content-Type correcto
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (err) {
    console.error('Error generando el catálogo:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}