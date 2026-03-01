import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/'],
        },
        // Replace with your actual domain once you have it
        sitemap: 'https://zenfocus.vercel.app/sitemap.xml',
    };
}
