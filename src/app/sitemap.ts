import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://zenfocus.vercel.app', // Update to your custom domain
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        // Add additional pages here later if you create static pages 
        // like /about, /pricing, etc.
    ];
}
